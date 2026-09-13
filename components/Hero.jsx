"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import MediaFrame from "./MediaFrame";
import { HERO_MEDIA } from "@/data/projects";
import { onReady } from "@/lib/ready";
import { scrollToHash } from "@/lib/motion";

export default function Hero() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const animated =
      ".hero__line > span, .hero__fade, .hero__panel, .hero__cue";

    /* `is-in` holds the finished state in CSS, and settling also strips any
       inline styles GSAP left behind — an interrupted tween must not be able
       to strand the headline half-way up its mask, since inline styles would
       otherwise outrank the CSS. */
    const settle = () => {
      const targets = root.querySelectorAll(animated);
      gsap.killTweensOf(targets);
      gsap.set(targets, { clearProps: "all" });
      root.classList.add("is-in");
    };

    if (reduced) {
      settle();
      return;
    }

    /* Rewind before playing. `settle()` — including this effect's own cleanup —
       leaves `is-in` on the root, and the settled CSS pins every target to its
       final position. A second mount (React StrictMode in development, Fast
       Refresh, or any future remount) would otherwise hand GSAP targets that
       are already at their end state, so the timeline would tween from the end
       to the end and the hero would simply appear, fully static. */
    root.classList.remove("is-in");
    gsap.set(root.querySelectorAll(animated), { clearProps: "all" });

    let ctx;
    // Safety net: the copy becomes visible regardless of what the intro does.
    const failsafe = window.setTimeout(settle, 3500);

    const stop = onReady(() => {
      /* The film settles into its frame as the panel wipes open — see
         .hero.is-rolling in the stylesheet. Driven by a class rather than by
         the timeline below on purpose: GSAP's settle() calls
         clearProps:"all", and .media carries an inline --ratio from
         MediaFrame that must survive. Nothing in this entrance is GSAP's, so
         there is nothing for clearProps to reach. */
      root.classList.add("is-rolling");

      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          onComplete: settle,
        });
        /* fromTo, not to: the mask start lives in CSS as
           `translate3d(0, 105%, 0)`, which GSAP reads off the computed matrix
           as y = 69px with yPercent = 0. Tweening yPercent to 0 was therefore
           a no-op — the headline stayed hidden behind its mask for the whole
           timeline and then popped into place when settle() cleared it.
           Declaring yPercent on both ends puts the property under GSAP's
           control, the same way the intro sets it before animating. `y: 0` is
           just as load-bearing: without it GSAP keeps that parsed 69px and
           adds yPercent on top, so the line lands one full mask-height low and
           stays invisible. */
        tl.fromTo(
          ".hero__line > span",
          { yPercent: 105, y: 0 },
          { yPercent: 0, y: 0, duration: 1.05, stagger: 0.09 }
        )
          .to(
            ".hero__fade",
            { opacity: 1, y: 0, duration: 0.85, stagger: 0.09 },
            "-=0.65"
          )
          .to(
            ".hero__panel",
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.15, ease: "expo.out" },
            "-=1.0"
          )
          .to(".hero__cue", { opacity: 1, duration: 0.6 }, "-=0.4");
      }, root);
    });

    return () => {
      window.clearTimeout(failsafe);
      stop();
      ctx?.kill();
      // Whatever tore this down, the hero is left readable.
      settle();
    };
  }, []);

  /* ------------------------------------------------------------------ *
     THE CAMERA MOVE
     A slow parallax on the pointer. The panel, the copy and the light behind
     them travel by different amounts and in opposite directions, which is
     what reads as depth rather than as a layer sliding about.

     It writes two custom properties and nothing else — every transform lives
     in CSS, so this never fights the entrance timeline above and costs one
     rAF that only runs while the hero is actually on screen.

     Deliberately narrow in scope: no touch devices, no coarse pointers, and
     nothing at all under prefers-reduced-motion.
   * ------------------------------------------------------------------ */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduced.matches) return;

    let raf = 0;
    let running = false;
    /* target vs current: the camera arrives late, and the lag is the effect.
       Snapping to the pointer reads as a cursor toy; 0.045 takes roughly a
       second to close the distance, which reads as weight. */
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    /* The loop runs only while the camera is actually travelling: a pointer
       move wakes it, and it goes back to sleep once it has caught up. A
       still mouse costs nothing. */
    let inView = false;

    const onMove = (e) => {
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
      if (inView) start();
    };

    /* Pointer off the window: drift back to centre rather than freezing
       wherever it left. */
    const onLeave = () => {
      tx = 0;
      ty = 0;
      if (inView) start();
    };

    const last = { hx: "", hy: "", hd: "" };
    const put = (k, v) => {
      if (last[k] === v) return;
      last[k] = v;
      root.style.setProperty(`--${k}`, v);
    };

    const frame = () => {
      cx += (tx - cx) * 0.045;
      cy += (ty - cy) * 0.045;
      put("hx", cx.toFixed(4));
      put("hy", cy.toFixed(4));
      /* Distance from centre, 0 → 1. The frame breathes 1% as the eye travels
         out from the middle — computed here because CSS has no portable
         abs() or hypot() to do it from --hx/--hy alone. */
      put("hd", Math.min(1, Math.hypot(cx, cy)).toFixed(4));

      const caughtUp = Math.abs(tx - cx) < 0.0005 && Math.abs(ty - cy) < 0.0005;
      if (running && !caughtUp) raf = requestAnimationFrame(frame);
      else running = false;
    };

    function start() {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(frame);
    }
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    /* Scrolled past the hero, there is nothing to move. */
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) start();
        else stop();
      },
      { threshold: 0 }
    );
    io.observe(root);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <section className="hero" id="top" ref={rootRef}>
      <div className="hero__grid">
        <div className="hero__copy">
          <p className="label hero__fade">CREATIVE PRODUCTION STUDIO</p>

          <h1 className="hero__title">
            <span className="line-mask hero__line">
              <span>WE PLANT THE SHOT.</span>
            </span>
            <span className="line-mask hero__line">
              <span>
                YOU WATCH IT <em className="accent">MOVE.</em>
              </span>
            </span>
          </h1>

          <p className="hero__sub hero__fade">
            PARANTI MEDIA IS A CREATIVE PRODUCTION STUDIO CRAFTING CINEMATIC
            STORIES, BRAND EXPERIENCES AND CONTENT THAT PEOPLE REMEMBER.
          </p>

          <div className="hero__actions hero__fade">
            <a
              href="#work"
              className="btn btn--solid"
              onClick={(e) => {
                e.preventDefault();
                scrollToHash("#work");
              }}
              data-cursor="EXPLORE"
            >
              <span>SEE OUR WORK</span>
              <span className="arrow" aria-hidden="true">
                →
              </span>
            </a>
            <a
              href="#contact"
              className="btn"
              onClick={(e) => {
                e.preventDefault();
                scrollToHash("#contact");
              }}
              data-cursor="EXPLORE"
            >
              <span>START A PROJECT</span>
              <span className="arrow" aria-hidden="true">
                →
              </span>
            </a>
          </div>
        </div>

        <div className="hero__panel">
          <MediaFrame
            src={HERO_MEDIA.image}
            video={HERO_MEDIA.video}
            videoMobile={HERO_MEDIA.videoMobile}
            poster={HERO_MEDIA.poster}
            label={HERO_MEDIA.label}
            alt="Paranti Media showreel loop"
            ratio="9 / 16"
            sizes="(max-width: 768px) 100vw, 34vw"
            priority
            zoom
          />
          <div className="hero__panelmeta mono">
            <span>PARANTI IDENT / 001</span>
            <span>THE STORY BEHIND THE SHOT.</span>
          </div>
        </div>
      </div>

      <div className="hero__cue mono" aria-hidden="true">
        <span>SCROLL</span>
        <span className="hero__cueline" />
      </div>

      {/* The way into Director Mode. Deliberately a camera control rather
          than a call to action — it sits opposite the scroll cue at a third
          of full opacity and only resolves on hover. It knows nothing about
          the overlay: it dispatches an event, so the hero still works with
          DirectorMode deleted. */}
      <button
        type="button"
        className="hero__viewfinder mono"
        onClick={() => window.dispatchEvent(new CustomEvent("paranti:director"))}
        aria-label="Enter Director Mode — view the site through the camera"
      >
        <span>VIEWFINDER</span>
        <i aria-hidden="true" />
      </button>
    </section>
  );
}


"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/motion";

/* ==========================================================================
   BIRDS — THE ENVIRONMENT LAYER
   --------------------------------------------------------------------------
   A hidden narrative told only by the sky. The open top of the site has birds
   in it; they thin out as the reader descends; by the contact section the air
   holds almost nothing. Nobody is told this — the environment simply changes.

   ADDITIVE BY DESIGN. This mounts once, beside the other page-level layers,
   and touches no section. It works because of how the site already paints:

     body                    cream — the page ground
     .birds  (z-index: -1)   above that ground, below every piece of content
     sections                transparent (hero, services, work, about …)
     .on-ink                 opaque — the showreel covers the sky
     .contact                opaque — the descent covers it completely

   So the birds show through the open sections and are hidden behind the story
   and the contact world by the page's own backgrounds. The one rule that
   matters — birds never cross text, media, buttons or nav — is guaranteed by
   the negative z-index rather than by hand-placing them around the copy.

   Cost: six spans and one rAF that writes two custom properties. No canvas, no
   particles, no 3D, no scroll library.
   ========================================================================== */

/* ==========================================================================
   THE FLOCK — seventeen birds, four to eight of them in frame
   --------------------------------------------------------------------------
   THE COUNT IS NOT THE POPULATION. Each bird crosses 320vw of travel for
   100vw of visible sky, so it is off screen for roughly 69% of its cycle.
   Seventeen birds × 31% ≈ five in view at any moment, which is what makes a
   sky rather than a flock: birds arrive, cross, and leave, and the one you
   just watched is gone before the next arrives.

   Three depth planes, and every plane is a different speed. Distance is
   carried by size, speed, opacity and wingbeat together — no single one of
   them is enough on its own:

              wingspan     speed        in frame    wings
     far      26–37px      1.3–1.7vw/s  ~2          mostly gliding
     mid      45–61px      1.8–2.5vw/s  ~2          slow beats
     near     74–96px      2.9–3.8vw/s  ~1          slowest beats, most weight

   Clouds sit below all of it at 0.6–1.1vw/s, so the parallax is genuine:
   nothing in this sky shares a speed with anything else.

   NOTHING IS SYNCHRONISED. Every bird has its own duration, its own negative
   delay (which is what starts it part-way through its crossing), its own
   height, its own drift period and its own wingbeat. No two values in the
   table below are repeated.

   `beat: 0` means the bird never flaps — at that distance you would not see
   a wingbeat, only a shape holding a line.

   `phone: false` drops the bird on small screens, chosen to thin every plane
   evenly rather than deleting a whole layer: the depth has to survive.
   ========================================================================== */
const FLOCK = [
  // ---- FAR: small, slow, soft. Seven, so the far sky is never empty.
  // plane       top  scale  dur  delay  alpha  drift  beat  rtl    phone
  { plane: "bg", top: 6, scale: 0.44, dur: 246, delay: -18, alpha: 0.24, drift: 26, beat: 0, rtl: false, phone: true },
  { plane: "bg", top: 14, scale: 0.40, dur: 232, delay: -142, alpha: 0.22, drift: 19, beat: 0, rtl: true, phone: false },
  { plane: "bg", top: 22, scale: 0.52, dur: 208, delay: -74, alpha: 0.30, drift: 31, beat: 9.4, rtl: false, phone: true },
  { plane: "bg", top: 31, scale: 0.47, dur: 250, delay: -196, alpha: 0.26, drift: 22, beat: 0, rtl: true, phone: false },
  { plane: "bg", top: 41, scale: 0.58, dur: 194, delay: -108, alpha: 0.34, drift: 35, beat: 8.1, rtl: false, phone: true },
  { plane: "bg", top: 53, scale: 0.43, dur: 238, delay: -33, alpha: 0.23, drift: 17, beat: 0, rtl: true, phone: false },
  { plane: "bg", top: 66, scale: 0.50, dur: 220, delay: -167, alpha: 0.28, drift: 28, beat: 10.2, rtl: false, phone: true },

  // ---- MID: the birds you actually read as birds.
  { plane: "mid", top: 10, scale: 0.78, dur: 168, delay: -52, alpha: 0.42, drift: 33, beat: 6.4, rtl: true, phone: true },
  { plane: "mid", top: 19, scale: 0.92, dur: 141, delay: -121, alpha: 0.50, drift: 41, beat: 5.7, rtl: false, phone: true },
  { plane: "mid", top: 28, scale: 0.70, dur: 175, delay: -8, alpha: 0.38, drift: 25, beat: 7.2, rtl: false, phone: false },
  { plane: "mid", top: 37, scale: 0.96, dur: 130, delay: -96, alpha: 0.52, drift: 46, beat: 5.1, rtl: true, phone: true },
  { plane: "mid", top: 48, scale: 0.83, dur: 159, delay: -148, alpha: 0.45, drift: 29, beat: 6.8, rtl: false, phone: true },
  { plane: "mid", top: 61, scale: 0.74, dur: 172, delay: -63, alpha: 0.40, drift: 36, beat: 7.6, rtl: true, phone: false },

  // ---- NEAR: one or two in frame, and the only ones with real weight.
  { plane: "fg", top: 16, scale: 1.28, dur: 96, delay: -41, alpha: 0.62, drift: 52, beat: 4.2, rtl: true, phone: true },
  { plane: "fg", top: 34, scale: 1.15, dur: 112, delay: -88, alpha: 0.56, drift: 44, beat: 4.9, rtl: false, phone: false },
  { plane: "fg", top: 45, scale: 1.50, dur: 84, delay: -12, alpha: 0.70, drift: 61, beat: 3.6, rtl: true, phone: true },
  { plane: "fg", top: 58, scale: 1.22, dur: 104, delay: -67, alpha: 0.58, drift: 48, beat: 4.5, rtl: false, phone: false },
];

/* Clouds. Heights are chosen to sit mostly clear of the flock's lanes (the
   birds fly at 12%, 16%, 23% and 31%), so a cloud rarely shares a band with a
   bird — and where one does drift behind, it reads as depth rather than as
   cover, because clouds are painted first and are barely opaque. */
/* Cloud travel is 240vw, so these durations put every cloud between 0.6 and
   1.1vw/s — slower than the slowest bird in the sky (1.28vw/s, far plane).
   That gap is the parallax: clouds < far birds < mid birds < near birds, with
   no two bands sharing a speed. They were a third quicker before the flock
   grew, which put the fastest clouds level with the far birds and flattened
   the depth they exist to create. */
const CLOUDS = [
  // plane   top   width  height  duration  delay   alpha
  { plane: "far", top: 4, w: 30, h: 11, dur: 338, delay: -40, alpha: 0.055 },
  { plane: "far", top: 27, w: 24, h: 9, dur: 403, delay: -190, alpha: 0.045 },
  { plane: "far", top: 45, w: 34, h: 12, dur: 371, delay: -108, alpha: 0.05 },
  { plane: "mid", top: 38, w: 44, h: 16, dur: 267, delay: -22, alpha: 0.07 },
  { plane: "mid", top: 7, w: 38, h: 14, dur: 302, delay: -150, alpha: 0.058 },
  { plane: "near", top: 55, w: 62, h: 22, dur: 218, delay: -76, alpha: 0.075 },
  { plane: "near", top: 20, w: 54, h: 20, dur: 242, delay: -128, alpha: 0.06 },
];

const clamp01 = (n) => Math.min(1, Math.max(0, n));

function Bird({ top, scale, dur, delay, alpha, drift, beat, rtl, phone }) {
  /* Where this bird sits when nothing is allowed to move: exactly where its
     own crossing would have it at t=0 — its negative delay as a fraction of
     its duration, mapped onto the same -110vw → 210vw travel the animation
     uses.

     Two earlier versions of this were wrong in opposite directions. Parking
     every bird at one of two x values was fine for four birds and absurd for
     seventeen (two neat columns of birds). Spreading all seventeen across the
     frame instead put every one of them on screen at once, which is a denser
     sky than the moving version ever shows. Using the real travel range gives
     six in frame — the same four-to-eight the animation runs at — because it
     is not an approximation of the moving sky, it is one frame of it. */
  const phase = (((-delay % dur) + dur) % dur) / dur;
  const park = (rtl ? 210 - 320 * phase : -110 + 320 * phase).toFixed(1);

  return (
    <span
      className={`birds__bird ${rtl ? "birds__bird--rtl" : ""} ${
        beat ? "" : "birds__bird--glide"
      }`}
      data-phone={phone ? "on" : "off"}
      style={{
        top: `${top}%`,
        animationDuration: `${dur}s`,
        animationDelay: `${delay}s`,
        "--bird-scale": scale,
        "--bird-alpha": alpha,
        /* Vertical amplitude and its period, both per bird. Deriving the
           period from the crossing duration rather than picking a second
           number keeps a slow bird's rise slow — a fast drift on a distant
           bird reads as a moth. */
        "--bird-drift": `${drift}px`,
        "--bird-drift-dur": `${(dur / 9).toFixed(1)}s`,
        "--bird-beat": `${beat || 0}s`,
        "--bird-park": `${park}vw`,
      }}
    >
      <span className="birds__drift">
        <svg viewBox="0 0 24 8" width="64" height="21" className="birds__wing">
          {/* Two strokes meeting at the body — all a bird reads as at this
              distance. Silhouette only, in ink.

              The shape is symmetrical about its own centre, which is why the
              right-to-left birds are never mirrored: there would be nothing
              to see, and a flip would fight the wingbeat's transform. */}
          <path
            d="M1 6 C5 1.4, 8.4 1.4, 12 5.2 C15.6 1.4, 19 1.4, 23 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </span>
    </span>
  );
}

export default function Birds() {
  const rootRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    /* Reduced motion: a still, quiet sky. The silhouettes stay — the movement
       does not. */
    if (reduced) {
      root.style.setProperty("--flock", "0.5");
      root.style.setProperty("--dusk", "0.5");
      root.dataset.still = "true";
      return;
    }

    let raf = 0;
    let shown = 0; // eased value actually on screen
    let turned = false;
    let last = { flock: -1, bg: 0, mid: 0, fg: 0 };

    /* Journey progress: 0 at the top of the page, 1 the moment the contact
       section arrives. Everything the flock does is a function of this.

       Where Contact sits is measured once and again only when the page
       changes size — not every frame. Reading layout in a loop that runs next
       to style writes forces a full layout pass per frame, which on a phone
       was the single most expensive thing on the page. */
    let end = 1;
    const measureEnd = () => {
      const contact = document.querySelector(".contact");
      const vh = window.innerHeight;
      end = contact
        ? contact.getBoundingClientRect().top + window.scrollY - vh
        : document.documentElement.scrollHeight - vh;
    };
    const measure = () => clamp01(window.scrollY / Math.max(1, end));
    let lastY = -1;

    const frame = () => {
      const p = measure();

      /* The sky stays open for the first 40% of the journey, then thins over
         the remaining 60% and is gone as the descent begins.

         The previous curve — pow(1 - p, 1.7) — started taking birds away
         immediately and had the sky at under a third by the halfway point.
         Removing the behind-the-scenes section made that visibly worse by
         shortening the page: measured four screens above Contact, the flock
         was already at 0.009, so the birds were gone long before the
         transition they are supposed to be part of. The plateau is what fixes
         it — full sky, then a long taper, rather than a fade that starts at
         the top of the page. */
      const target = Math.pow(clamp01((1 - p) / 0.6), 1.3);

      /* Eased rather than assigned, so a fast scroll or a jump to an anchor
         never snaps the flock in or out. */
      shown += (target - shown) * 0.06;

      /* The last bird. Once, on the approach — it crosses toward the dark,
         thinks better of it, and goes back the way it came. */
      if (!turned && p > 0.8 && p < 0.995) {
        turned = true;
        root.dataset.turn = "true";
      }

      /* Parallax: the planes lag the scroll by different amounts, so the sky
         has depth without anything visibly moving. Deliberately tiny. */
      const y = window.scrollY;
      const bg = -(y * 0.012) % 400;
      const mid = -(y * 0.026) % 400;
      const fg = -(y * 0.045) % 400;

      /* Only touch the DOM when a value has actually changed. */
      const f = Number(shown.toFixed(4));
      if (f !== last.flock) {
        root.style.setProperty("--flock", f);
        /* Inverse of the flock: 0 in the open world, ~1 by the time the
           descent is close. Only the clouds read this, to darken and lose
           their edges on the way down — which is what carries the sky into
           the shadow rather than cutting to it. */
        root.style.setProperty("--dusk", (1 - f).toFixed(4));
        last.flock = f;
      }
      if (bg !== last.bg) {
        root.style.setProperty("--par-bg", `${bg.toFixed(2)}px`);
        last.bg = bg;
      }
      if (mid !== last.mid) {
        root.style.setProperty("--par-mid", `${mid.toFixed(2)}px`);
        last.mid = mid;
      }
      if (fg !== last.fg) {
        root.style.setProperty("--par-fg", `${fg.toFixed(2)}px`);
        last.fg = fg;
      }

      /* Once the sky has gone, rest it: hidden, and its CSS animations
         paused, rather than dozens of invisible birds and clouds flying on. */
      const rest = f < 0.003 ? "true" : "false";
      if (root.dataset.rest !== rest) root.dataset.rest = rest;

      /* The loop only runs while there is something to do: the page is
         scrolling, or the flock is still easing toward where it should be.
         A scroll event starts it again. */
      const settled = y === lastY && Math.abs(target - shown) < 0.0005;
      lastY = y;
      raf = settled ? 0 : requestAnimationFrame(frame);
    };

    const start = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    /* Page height changes (images, fonts, the form expanding) move Contact,
       so the journey's end is re-measured then — once, on the next frame. */
    let remeasure = 0;
    const onResize = () => {
      if (remeasure) return;
      remeasure = requestAnimationFrame(() => {
        remeasure = 0;
        measureEnd();
        start();
      });
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(document.body);

    /* Nothing to compute for a tab nobody is looking at. */
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("scroll", start, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    measureEnd();
    start();

    return () => {
      stop();
      cancelAnimationFrame(remeasure);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("scroll", start);
      window.removeEventListener("resize", onResize);
    };
  }, [reduced]);

  return (
    <div className="birds" ref={rootRef} aria-hidden="true">
      {/* Sky first, flock second. DOM order is what guarantees a bird is never
          painted underneath a cloud — no z-index juggling required. */}
      {["far", "mid", "near"].map((plane) => (
        <div className={`birds__sky birds__sky--${plane}`} key={plane}>
          {CLOUDS.filter((c) => c.plane === plane).map((c, i) => (
            <span
              className="birds__cloud"
              key={`${plane}${i}`}
              style={{
                top: `${c.top}%`,
                width: `${c.w}vw`,
                height: `${c.h}vh`,
                animationDuration: `${c.dur}s`,
                animationDelay: `${c.delay}s`,
                "--cloud-alpha": c.alpha,
              }}
            />
          ))}
        </div>
      ))}

      <div className="birds__plane birds__plane--bg">
        {FLOCK.filter((b) => b.plane === "bg").map((b, i) => (
          <Bird key={`bg${i}`} {...b} />
        ))}
      </div>
      <div className="birds__plane birds__plane--mid">
        {FLOCK.filter((b) => b.plane === "mid").map((b, i) => (
          <Bird key={`mid${i}`} {...b} />
        ))}
      </div>
      <div className="birds__plane birds__plane--fg">
        {FLOCK.filter((b) => b.plane === "fg").map((b, i) => (
          <Bird key={`fg${i}`} {...b} />
        ))}
      </div>

      {/* The turn. Held off screen until the approach to contact, then played
          exactly once. */}
      <span className="birds__last">
        <span className="birds__drift">
          <svg viewBox="0 0 24 8" width="64" height="21" className="birds__wing">
            <path
              d="M1 6 C5 1.4, 8.4 1.4, 12 5.2 C15.6 1.4, 19 1.4, 23 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </span>
    </div>
  );
}

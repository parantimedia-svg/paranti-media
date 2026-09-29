"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/motion";

/* ==========================================================================
   THE DESCENT — CONTACT ENVIRONMENT
   --------------------------------------------------------------------------
   "THE WORLD BEHIND THE SHOT." The last section of the site is the moment the
   reader passes from the lit world into the inside of the camera.

   The sequence, top to bottom:

     soft sunlight → clouds → a bird or two → the light drops →
     deeper shadow → the aperture closes → a lens reflection →
     near-total dark → one distant recording light → the contact content

   There is no cave, no creature and nothing watching. The only living thing in
   the dark is a tiny orange point a long way off — a camera still rolling.
   That is the whole idea: the reader has walked behind the lens, and the
   camera has not stopped.

   Everything is CSS gradients plus one small canvas. No 3D, no video, no image
   payload — the section this sits in has already spent its budget.

   Scroll signals are written as custom properties so CSS owns the look and JS
   only owns the timing:

     --enter   0 → 1 across a viewport of approach. Drains the light out of
               the ordinary page. This is the crossing.
     --travel  the approach itself: sun sinking, shadow rolling in.
     --deep    0 → 1 → 0 across the section. How far inside the camera we are;
               drives the aperture and the dark.
     --rec     the recording light: fades up late, holds, fades out on the way
               back. Cut to 0 by [data-sent] when the form is submitted.
     --lens    a bell around the middle of the dark — the reflection only
               happens as the aperture passes a certain point.

   These are measured straight off the section's own rect each frame rather
   than through ScrollTrigger. Reading the rect cannot go stale — it costs one
   layout query on a frame we are already spending on the dust.
   ========================================================================== */

const clamp01 = (n) => Math.min(1, Math.max(0, n));

/* Smoothstep between two points on the scroll: 0 before `a`, 1 after `b`,
   eased in between. Composing two of these gives a plateau — rise, hold,
   fall — which is what lets the recording light stay lit across the section
   instead of blinking past in a single frame. */
const ramp = (p, a, b) => {
  const t = Math.min(1, Math.max(0, (p - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/* Two birds, not a flock. Each crosses well over a screen's width, so most of
   the time exactly one is in frame and occasionally two — which is what the
   brief asks for and what actually reads as a sky rather than a loop.
   Deliberately larger than the birds elsewhere on the site: at this point the
   reader is meant to see them. */
const BIRDS = [
  { top: 21, size: 78, dur: 54, delay: -6, alpha: 0.5, rtl: false },
  { top: 33, size: 106, dur: 41, delay: -25, alpha: 0.62, rtl: true },
];

function ApproachBird({ top, size, dur, delay, alpha, rtl }) {
  return (
    <span
      className={`cworld__bird ${rtl ? "cworld__bird--rtl" : ""}`}
      style={{
        top: `${top}%`,
        animationDuration: `${dur}s`,
        animationDelay: `${delay}s`,
        "--cb-size": `${size}px`,
        "--cb-alpha": alpha,
      }}
    >
      <span className="cworld__birddrift">
        <svg viewBox="0 0 24 8" className="cworld__wing">
          {/* The same two-stroke silhouette the sky above uses, so the birds
              here read as the same birds, just closer. */}
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

export default function ContactWorld() {
  const rootRef = useRef(null);
  const dustRef = useRef(null);
  const enterRef = useRef(0);
  const scrollDrivenRef = useRef(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    const canvas = dustRef.current;
    if (!root || !canvas) return;

    const section = root.closest(".contact");
    if (!section) return;

    /* Only write a property when its value has actually changed. */
    const written = {};
    const set = (k, v) => {
      if (written[k] === v) return;
      written[k] = v;
      root.style.setProperty(k, v);
    };

    /* Each half of the world is only drawn across the part of the scroll
       where it can actually be seen. Outside it the half is exactly
       transparent (see the thresholds below), but a transparent full-screen
       layer is still rasterised and composited every frame — on a retina
       MacBook that was a large share of the frames the descent dropped. */
    const flag = (k, on) => {
      const v = on ? "on" : "off";
      if (root.dataset[k] !== v) root.dataset[k] = v;
    };
    const phase = (travel) => {
      /* Where the scroll drives visibility (see components.css), these flags
         must stay out of it: a flag set from a callback is stale exactly when
         the main thread is late, and a stale one can hide the sky. */
      if (scrollDrivenRef.current) return;
      /* Every approach layer's opacity ramps up from travel 0.04 (sky, sun,
         clouds — the earliest), and the approach as a whole reaches 0 at 1. */
      flag("approach", travel > 0.04 && travel < 1);
      /* The interior's opacity is --inside, which is 0 until travel 0.66. */
      flag("stage", travel > 0.66);
    };

    /* Written on <html> because the layers it retires live outside this
       section. "covered": the screen is solid ink from edge to edge, so the
       layers beneath the sections are hidden. "inside": additionally the lit
       approach has gone, leaving only the dark — where the film grain,
       multiplied over near-black, no longer changes a visible pixel. */
    const html = document.documentElement;
    const descent = (v) => {
      if ((html.dataset.descent || "") !== v) {
        if (v) html.dataset.descent = v;
        else delete html.dataset.descent;
      }
    };

    /* Reduced motion still gets the world, just already arrived — no
       scroll-linked movement, no drifting dust. The recording light is left
       lit but still, because it is the one element carrying meaning. */
    if (reduced) {
      /* The sun still needs its travel distance, or it would sit where it
         starts rather than where the arrived world puts it. */
      set(
        "--sun-span",
        `${(section.getBoundingClientRect().height * 0.4).toFixed(1)}px`
      );
      set("--enter", "1");
      set("--travel", "1");
      set("--deep", "1");
      set("--rec", "1");
      /* No reflection. --lens is a transient: it exists only while the
         aperture is closing. Parking it at a value would leave a permanent
         streak across the section for anyone on reduced motion — a flare
         from a move that never happens. */
      set("--lens", "0");
      phase(1);
      enterRef.current = 1;
      return;
    }

    const ctx2d = canvas.getContext("2d", { alpha: true });
    if (!ctx2d) return;

    /* Where the browser can drive the descent off the scroll position itself,
       it does, and these writes stop: a property written here lands a frame
       late at best, and several hundred milliseconds late when the main thread
       stalls, which is exactly when the sky was left showing the wrong moment.
       What stays is what CSS cannot do — the dust, the sun's travel distance,
       and the flags that retire layers nothing can see. */
    const scrollDriven =
      typeof CSS !== "undefined" &&
      CSS.supports &&
      CSS.supports("animation-timeline", "view()");
    scrollDrivenRef.current = scrollDriven;

    const mobile = window.matchMedia("(max-width: 768px)").matches;
    const COUNT = mobile ? 14 : 34;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let running = false;
    let parts = [];
    let drawn = true;
    /* The boxes painted last frame, flat as x, y, w, h — the only pixels the
       next frame has to clear. */
    const dirty = [];

    const seed = (p, initial) => {
      p.x = Math.random() * w;
      p.y = initial ? Math.random() * h : h + 12;
      p.r = 0.6 + Math.random() * 1.7;
      p.vy = 0.08 + Math.random() * 0.26; // slow upward drift
      p.vx = (Math.random() - 0.5) * 0.14;
      p.sway = 0.4 + Math.random() * 1.1;
      p.phase = Math.random() * Math.PI * 2;
      p.life = 0.25 + Math.random() * 0.75;
      /* A few motes catch the Paranti orange rather than the neutral light —
         the same warm reflection that travels the rest of the site. */
      p.warm = Math.random() < 0.18;
      return p;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      /* One canvas pixel per CSS pixel: the motes are 0.6–2.3px soft dots,
         and a retina-resolution full-screen canvas (5.2MP) cleared every
         frame was the most expensive animation loop on the page. */
      dpr = 1;
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      /* Setting the width cleared the canvas, so nothing is owed a clear. */
      dirty.length = 0;
      drawn = false;
      parts = Array.from({ length: COUNT }, () => seed({}, true));
    };

    /* Where the section sits in the document, measured when the page changes
       size rather than on every frame — a layout read per frame, next to the
       property writes, forces a full layout pass each time. Its on-screen
       position is then just arithmetic on the scroll position. */
    let docTop = 0;
    let docHeight = 1;
    /* The stretch of page painted in solid ink around the descent: the
       unbroken run of opaque sections leading into it, the section itself
       and an opaque footer after it. While the screen sits entirely inside
       that stretch, the page-level layers underneath it (the sky's birds and
       the back plane of the atmosphere) cannot be seen at all. */
    let coverTop = 0;
    let coverBottom = 0;
    const opaque = (el) => {
      const bg = getComputedStyle(el).backgroundColor;
      const m = bg.match(/rgba?\(([^)]+)\)/);
      if (!m) return false;
      const parts = m[1].split(",");
      return parts.length < 4 || parseFloat(parts[3]) >= 1;
    };
    const measureSection = () => {
      const r = section.getBoundingClientRect();
      docTop = r.top + window.scrollY;
      docHeight = r.height;

      let first = section;
      while (first.previousElementSibling && opaque(first.previousElementSibling)) {
        first = first.previousElementSibling;
      }
      coverTop = first.getBoundingClientRect().top + window.scrollY;
      coverBottom = docTop + docHeight;
      const after = section.parentElement?.nextElementSibling;
      if (!section.nextElementSibling && after && opaque(after)) {
        coverBottom = after.getBoundingClientRect().bottom + window.scrollY;
      }
      /* How far the sun sinks: the 40% of the section height it used to cover
         by animating `top`, now handed to CSS as pixels so the same descent
         can run as a transform. Layout was being recalculated on every
         scrolled frame otherwise — the judder in this section. */
      set("--sun-span", `${(docHeight * 0.4).toFixed(1)}px`);
    };

    /* Everything the environment needs, straight off the geometry. */
    const measure = () => {
      const r = { top: docTop - window.scrollY, height: docHeight };
      const vh = window.innerHeight;

      /* The crossing: begins as the section's top enters at the bottom of the
         screen, completes as it reaches the top. */
      const enter = clamp01((vh - r.top) / vh);

      /* The approach, starting roughly a screen and a half before the section
         arrives. An earlier pass ran this across two and a half viewports,
         which looked better in isolation and was wrong: it painted a landscape
         over the copy of the two sections above. The journey has to happen in
         the space the page actually has spare. */
      const travel = clamp01((vh * 1.4 - r.top) / (vh * 1.4));

      /* Progress across everything the section is on screen for: 0 as its top
         reaches the bottom of the viewport, 1 as its bottom does. That is
         exactly the section's own height of scrolling.

         Measuring the span as `height - vh` instead (the pinned distance) put
         q at 1 while a third of the section was still to come, so the dark
         lifted and the recording light went out with the reader still reading
         the form — the environment resolving before the content it exists
         for. */
      const q = clamp01((vh - r.top) / Math.max(1, r.height));

      enterRef.current = enter;
      phase(travel);

      const y = window.scrollY;
      /* Two pixels inside the run at each end: scroll positions are
         fractional, and a sliver of a lit section showing at the seam would
         be a sliver with its sky missing. */
      const covered = y >= coverTop + 2 && y + vh <= coverBottom - 2;
      descent(covered ? (travel >= 1 ? "inside" : "covered") : "");

      if (scrollDriven) return;

      set("--enter", enter.toFixed(4));
      set("--travel", travel.toFixed(4));

      /* The dark deepens on the way in, holds across the whole of the form,
         and lifts only at the very end — so scrolling back up is the exact
         reverse of scrolling down, and the footer is never dark-locked. */
      set("--deep", (ramp(q, 0.18, 0.42) * (1 - ramp(q, 0.86, 1))).toFixed(4));

      /* The reflection only happens while the aperture is closing — a bell
         through that stretch, gone by the time it is properly dark. */
      set("--lens", (ramp(q, 0.26, 0.44) * (1 - ramp(q, 0.5, 0.68))).toFixed(4));

      /* The recording light arrives once the dark has settled, then stays lit
         for as long as the contact content is on screen. Only the form
         submitting puts it out. */
      set("--rec", (ramp(q, 0.42, 0.6) * (1 - ramp(q, 0.9, 1))).toFixed(4));
    };

    const frame = (t) => {
      measure();

      /* Density follows the crossing: nothing on the cream page, a full drift
         once the reader is through. */
      const strength = enterRef.current;
      /* Clear only the boxes the last frame actually painted, never the whole
         canvas. Thirty-odd 2px motes on a screen-sized canvas were costing a
         full-screen clear and, with it, a full-screen texture hand-off to the
         GPU on every frame — on a retina MacBook, several megabytes a frame
         for a few specks of dust. Same dust, a thousandth of the pixels. */
      if (drawn) {
        for (let i = 0; i < dirty.length; i += 4) {
          ctx2d.clearRect(dirty[i], dirty[i + 1], dirty[i + 2], dirty[i + 3]);
        }
        dirty.length = 0;
        drawn = false;
      }

      if (strength > 0.02) {
        drawn = true;
        const shown = Math.round(parts.length * Math.min(1, strength * 1.15));

        for (let i = 0; i < shown; i++) {
          const p = parts[i];
          p.y -= p.vy;
          p.x += p.vx + Math.sin(t / 1600 + p.phase) * 0.1 * p.sway;

          if (p.y < -12) seed(p, false);

          const a = p.life * strength * (p.warm ? 0.5 : 0.3);
          ctx2d.beginPath();
          ctx2d.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx2d.fillStyle = p.warm
            ? `rgba(225, 84, 30, ${a})`
            : `rgba(243, 234, 211, ${a * 0.7})`;
          ctx2d.fill();
          /* One pixel of slack around the circle for the antialiased edge. */
          const pad = p.r + 1.5;
          dirty.push(p.x - pad, p.y - pad, pad * 2, pad * 2);
        }
      }

      /* Only re-arm while still running. Re-scheduling unconditionally lets a
         stop/start cycle leave an orphaned loop behind, and each new one
         compounds until the tab stops responding. */
      if (running) raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    resize();
    measureSection();
    measure();

    let remeasure = 0;
    const ro = new ResizeObserver(() => {
      if (remeasure) return;
      remeasure = requestAnimationFrame(() => {
        remeasure = 0;
        measureSection();
      });
    });
    ro.observe(document.body);

    /* The loop only runs while the section is on screen. Off screen there is
       no dust to draw and nothing to measure — but the properties still have
       to be parked at the right end, or the environment would freeze
       mid-crossing the moment it scrolled away. */
    const io = new IntersectionObserver(
      ([entry]) => {
        /* Promote the descent's layers to their own GPU layers only while
           the section is near — see "compositing" in components.css. */
        root.dataset.live = entry.isIntersecting ? "true" : "false";
        if (entry.isIntersecting) {
          start();
        } else {
          stop();
          const above = entry.boundingClientRect.top < 0;
          enterRef.current = above ? 1 : 0;
          set("--enter", above ? "1" : "0");
          set("--travel", above ? "1" : "0");
          phase(above ? 1 : 0);
          descent("");
          set("--deep", "0");
          set("--lens", "0");
          set("--rec", "0");
        }
      },
      {
        threshold: 0,
        /* The margin goes on the BOTTOM edge: the section approaches from
           below the fold, so growing the root downward is what brings it into
           view early. A top margin — the intuitive guess — expands upward,
           where the section has already been. */
        rootMargin: "0px 0px 250% 0px",
      }
    );
    io.observe(section);

    const onVisibility = () => {
      if (document.hidden) stop();
    };

    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      descent("");
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(remeasure);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  return (
    <div className="cworld" ref={rootRef} aria-hidden="true">
      {/* Two rulers, never painted. Each one's own span of scroll is the range
          the browser drives the descent across — see "THE DESCENT, TIED TO THE
          SCROLL ITSELF" in components.css. They come first so everything below
          can name their timelines. */}
      <span className="cworld__t cworld__t--travel" />
      <span className="cworld__t cworld__t--enter" />
      <span className="cworld__t cworld__t--q" />

      {/* Fixed: this is what drains the light from the ordinary page on the
          way in, so the crossing starts before the section does. */}
      <span className="cworld__veil" />

      {/* ---- the approach -------------------------------------------------
          What the reader travels through on the way down. Fixed like the veil
          and painted on top of it, so it plays out over the darkening page
          rather than behind the cream sections. Sequenced by --travel:
          sunlight, then the sun dropping, then the shadow taking the sky. */}
      <div className="cworld__approach">
        {/* Soft daylight — the lit world, seen for the last time. */}
        <span className="cworld__sky" />

        {/* A low sun that sinks as the reader descends. This is the light
            source everything else in the approach is lit by. */}
        <span className="cworld__sun" />

        <span className="cworld__cloud cworld__cloud--a" />
        <span className="cworld__cloud cworld__cloud--b" />
        <span className="cworld__cloud cworld__cloud--c" />

        {/* One or two birds, close enough to actually read as birds. */}
        {BIRDS.map((b, i) => (
          <ApproachBird key={i} {...b} />
        ))}

        {/* The far horizon: soft, distant, just enough for the sky to be a
            place rather than a gradient. */}
        <svg
          className="cworld__range"
          viewBox="0 0 1200 300"
          preserveAspectRatio="none"
        >
          <path d="M0 300 L0 196 L88 132 L156 176 L246 96 L330 168 L404 118 L500 200 L566 150 L642 206 L730 128 L812 182 L900 110 L986 174 L1070 140 L1140 190 L1200 152 L1200 300 Z" />
        </svg>

        {/* A nearer line, moving faster — the parallax between the two is what
            sells the travel. */}
        <svg
          className="cworld__ridge"
          viewBox="0 0 1200 300"
          preserveAspectRatio="none"
        >
          <path d="M0 300 L0 244 L120 190 L228 236 L340 168 L448 224 L560 176 L672 232 L790 186 L900 238 L1020 194 L1120 236 L1200 206 L1200 300 Z" />
        </svg>

        {/* The shadow that takes the daylight away, rising from below. */}
        <span className="cworld__shadow" />

        <span className="cworld__fogbank" />
      </div>

      {/* Sticky, one viewport tall: the environment is a place the reader
          moves through rather than a backdrop painted once across a section
          three screens long. */}
      <div className="cworld__stage">
        {/* The dark itself. */}
        <span className="cworld__dark" />

        {/* THE APERTURE. Six blades closing over the frame as the reader
            descends — the moment the world becomes the inside of a camera.
            Soft-edged and slow; it should be felt as the frame tightening,
            not seen as a shape. */}
        <span className="cworld__iris">
          <span className="cworld__blade" />
          <span className="cworld__blade" />
          <span className="cworld__blade" />
        </span>

        {/* Anamorphic reflection across the glass — one wide horizontal
            streak and two faint ghosts, only while the aperture is closing. */}
        <span className="cworld__lens">
          <span className="cworld__streak" />
          <span className="cworld__ghost cworld__ghost--a" />
          <span className="cworld__ghost cworld__ghost--b" />
        </span>

        {/* ---- THE ONLY LIVING THING IN THE DARK -------------------------
            One tiny orange point, a long way off. Not a UI element, not a
            badge, no ring and no label: a recording light on a camera you
            cannot see, breathing very slowly.

            The form turns it off — .contact[data-sent] — because the take is
            finished. */}
        <span className="cworld__rec">
          <span className="cworld__recdot" />
        </span>

        <canvas className="cworld__dust" ref={dustRef} />

        <span className="cworld__floor" />
      </div>
    </div>
  );
}

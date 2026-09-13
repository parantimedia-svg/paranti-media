"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/motion";

/* ==========================================================================
   THE PARANTI ATMOSPHERE — "THE WORLD BEHIND THE SHOT"
   --------------------------------------------------------------------------
   One global environment layer that makes the page feel like a lit space
   rather than a document. It adds nothing to the structure: it mounts once
   beside the other page-level layers, touches no section, and every element
   in it is aria-hidden and pointer-events:none.

   It renders in two planes, because a film set has light both behind you and
   in front of the lens:

     .atmos--back    z-index -1, behind every section. Dust and the slow
                     moving shadow live here. Opaque sections (.on-ink,
                     .contact) cover it, which is correct — you don't see the
                     room's dust once you're inside the camera.

     .atmos--front   z-index 3, over the content but under the rail and nav.
                     The Paranti Light, the leak and the exposure breath live
                     here, because those are things happening to the *lens*,
                     not to the room. Everything here is between 3% and 8%
                     opacity: it must be felt, never seen, and it must never
                     touch readability.

   THE PARANTI LIGHT
   One recurring soft orange source that drifts through the whole site. It is
   painted twice from the same coordinates:

     --warm   multiply — reads as a warm patch on the cream sections
     --glow   screen   — reads as a glow on the ink sections

   Neither blend mode works on both grounds, so rather than compromise on one,
   both are painted and each ground takes the one that suits it. That is what
   lets a single light travel the length of the page and stay believable over
   cream, over ink and over photography.

   NON-REPEATING MOTION
   Every value is a sum of sines whose periods share no common multiple
   (23.3s, 8.7s, 41.9s …). The composite never returns to the same state, so
   there is no loop for the eye to lock onto — which is the difference between
   "this site is alive" and "this site has an animation on it".

   COST
   One rAF. It writes six custom properties and draws a few dozen dust motes.
   It stops entirely when the tab is hidden, and never starts at all under
   prefers-reduced-motion.
   ========================================================================== */

/* Dust: enough to catch the light, far too few to read as particles. */
const DUST_DESKTOP = 26;
const DUST_MOBILE = 9;

export default function Atmosphere() {
  const dustRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const root = document.documentElement;

    /* Reduced motion: the light still exists, it simply stops travelling.
       Parking it at mid-drift keeps the page lit rather than flat. */
    if (reduced) {
      root.style.setProperty("--pm-lx", "56vw");
      root.style.setProperty("--pm-ly", "38vh");
      root.style.setProperty("--pm-glow", "0.5");
      root.style.setProperty("--pm-exp", "0");
      root.style.setProperty("--pm-leak", "0.35");
      root.style.setProperty("--pm-drift", "0px");
      return;
    }

    const canvas = dustRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });

    const mobile = window.matchMedia("(max-width: 768px)").matches;
    const COUNT = mobile ? DUST_MOBILE : DUST_DESKTOP;

    let w = 0;
    let h = 0;
    let raf = 0;
    let running = false;
    let motes = [];

    /* One soft mote, rendered once into an offscreen canvas and then stamped
       per particle. A hard `arc()` fill reads as a polka dot at any alpha —
       dust is out of focus, so it has to have no edge. Building the gradient
       once and using drawImage keeps that cheap: a per-particle
       createRadialGradient every frame would be the most expensive thing on
       the page. */
    const SPRITE = 32;
    let sprite = null;
    const buildSprite = () => {
      const s = document.createElement("canvas");
      s.width = SPRITE;
      s.height = SPRITE;
      const sc = s.getContext("2d");
      if (!sc) return null;
      const g = sc.createRadialGradient(
        SPRITE / 2, SPRITE / 2, 0,
        SPRITE / 2, SPRITE / 2, SPRITE / 2
      );
      g.addColorStop(0, "rgba(22, 19, 15, 1)");
      g.addColorStop(0.35, "rgba(22, 19, 15, 0.55)");
      g.addColorStop(1, "rgba(22, 19, 15, 0)");
      sc.fillStyle = g;
      sc.fillRect(0, 0, SPRITE, SPRITE);
      return s;
    };

    const seed = (m, initial) => {
      m.x = Math.random() * w;
      m.y = initial ? Math.random() * h : h + 20;
      /* Diameter, not radius: 3–9px of soft edge, which at these alphas is a
         speck you notice only when it crosses something plain. */
      m.r = 3 + Math.random() * 6;
      /* Dust falls slowly and unevenly; a shared speed reads as rain. */
      m.vy = -(0.06 + Math.random() * 0.22);
      m.vx = (Math.random() - 0.5) * 0.09;
      m.sway = 0.5 + Math.random() * 1.4;
      m.phase = Math.random() * Math.PI * 2;
      m.a = 0.05 + Math.random() * 0.09;
      return m;
    };

    const resize = () => {
      if (!canvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!sprite) sprite = buildSprite();
      motes = Array.from({ length: COUNT }, () => seed({}, true));
    };

    /* Only write a property when the rounded value has actually moved. A CSS
       custom property write invalidates style for everything that reads it,
       so this is the difference between a free layer and a busy one. */
    const last = {};
    const set = (k, v) => {
      if (last[k] === v) return;
      last[k] = v;
      root.style.setProperty(k, v);
    };

    const start0 = performance.now();

    /* PERFORMANCE
       Every write to a custom property on the root element restyles the
       whole document — measured at ~10ms a write on a phone layout, most of
       a 16ms frame. The light moves on 6–40s periods, so there is nothing to
       gain from updating it 60 times a second: it is written ten times a
       second on desktop and four on phones, and the layers that read it
       carry a matching CSS transition, so the steps are smoothed on the
       compositor and never seen. The dust stays on every frame (it is canvas,
       which costs no style work) — on phones every other frame, double step. */
    const WRITE_MS = mobile ? 250 : 100;
    let lastWrite = -Infinity;
    let tick = 0;
    const step = mobile ? 2 : 1;

    const frame = (now) => {
      const t = (now - start0) / 1000;
      tick++;
      const writeNow = now - lastWrite >= WRITE_MS;
      if (writeNow) lastWrite = now;
      const drawNow = !mobile || tick % 2 === 0;

      /* ---- the Paranti Light --------------------------------------------
         Three periods that never line up, so the path through the frame is a
         slow open curve rather than an orbit. Roughly 20-25s to cross, which
         is slow enough that you notice the light has moved without ever
         catching it moving. */
      const lx =
        50 + 27 * Math.sin(t / 23.3) + 11 * Math.sin(t / 8.7 + 1.3) +
        6 * Math.sin(t / 41.9 + 2.6);
      const ly =
        42 + 19 * Math.cos(t / 19.1) + 8 * Math.cos(t / 13.3 + 0.7);

      /* Intensity breathes on its own clock, so the light is sometimes a
         highlight and sometimes almost nothing. */
      const glow = 0.5 + 0.3 * Math.sin(t / 17.7) + 0.15 * Math.sin(t / 6.1 + 2.1);

      /* Exposure: a stop of drift either side of neutral, no more. Signed, so
         CSS can push it either way from one value. */
      const exp = 0.55 * Math.sin(t / 11.3) + 0.3 * Math.sin(t / 29.7 + 1.1);

      /* The leak sweeps right across the frame and back on a long period. */
      const leak = 0.5 + 0.5 * Math.sin(t / 37.4);

      /* Shadow drift, for the layers behind the content. */
      const drift = 22 * Math.sin(t / 26.5) + 9 * Math.sin(t / 11.9 + 0.4);

      /* Emitted in vw/vh, not %. A percentage in `translate` resolves against
         the element's own box, so the light would move by a fraction of
         itself rather than across the frame — and setting `left`/`top`
         instead would put a layout on every frame. Viewport units in a
         transform are composited. */
      if (writeNow) {
        set("--pm-lx", `${lx.toFixed(2)}vw`);
        set("--pm-ly", `${ly.toFixed(2)}vh`);
        set("--pm-glow", glow.toFixed(3));
        set("--pm-exp", exp.toFixed(3));
        set("--pm-leak", leak.toFixed(3));
        set("--pm-drift", `${drift.toFixed(2)}px`);
      }

      /* ---- dust ----------------------------------------------------------
         Ink motes, multiplied onto the page, so they read as specks caught
         against the cream. The ink sections cover this plane entirely and
         carry their own atmosphere instead. */
      if (ctx && sprite && drawNow) {
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < motes.length; i++) {
          const m = motes[i];
          m.y += m.vy * step;
          m.x += (m.vx + Math.sin(t / 3.2 + m.phase) * 0.07 * m.sway) * step;
          if (m.y < -20) seed(m, false);
          if (m.x < -20) m.x = w + 20;
          else if (m.x > w + 20) m.x = -20;

          ctx.globalAlpha = m.a;
          ctx.drawImage(sprite, m.x - m.r / 2, m.y - m.r / 2, m.r, m.r);
        }
        ctx.globalAlpha = 1;
      }

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

    const onVisibility = () => (document.hidden ? stop() : start());

    resize();
    start();
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  return (
    <>
      {/* Behind every section. */}
      <div
        className="atmos atmos--back"
        aria-hidden="true"
        data-still={reduced ? "true" : "false"}
      >
        <canvas className="atmos__dust" ref={dustRef} />
        <span className="atmos__shadow" />
      </div>

      {/* Over the content, under the site's own chrome. Everything here is
          single-digit percentages of opacity. */}
      <div
        className="atmos atmos--front"
        aria-hidden="true"
        data-still={reduced ? "true" : "false"}
      >
        {/* The Paranti Light, painted for cream and for ink from the same
            coordinates — see the header note. */}
        <span className="atmos__light atmos__light--warm" />
        <span className="atmos__light atmos__light--glow" />

        {/* A slow diagonal leak, the way light creeps past a matte box. */}
        <span className="atmos__leak" />

        {/* Anamorphic reflection: one horizontal streak that only shows when
            the light is near its brightest. */}
        <span className="atmos__flare" />

        {/* Exposure breath — a whole-frame lift and fall of about a third of
            a stop. Painted as an overlay rather than a filter on the page,
            because filtering an ancestor would make it the containing block
            for every fixed layer on the site. */}
        <span className="atmos__exposure" />
      </div>
    </>
  );
}

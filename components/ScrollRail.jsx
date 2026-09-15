"use client";

import { useEffect, useRef } from "react";
import { RailCamera, RailFigure } from "./Figure";
import { usePrefersReducedMotion } from "@/lib/motion";

/* ==========================================================================
   SIGNATURE ANIMATION (B) — THE MONOPOD AS SCROLL PROGRESS
   --------------------------------------------------------------------------
   A slim monopod runs down the left edge of every page. The photographer
   stays whole and planted at its foot the entire time — only the camera
   travels, sliding up the pole as you scroll with an orange fill trailing
   behind it. At the bottom of the page the camera reaches the top: shot set.

   Everything is driven by one CSS custom property (--p, 0→1) so the browser
   only ever animates transforms — no layout, no paint, GPU all the way.
   ========================================================================== */

export default function ScrollRail() {
  const railRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    let raf = 0;
    let queued = false;
    let lastP = -1;
    let lastTheme = "";

    // Sections rendered on ink need the rail flipped to cream.
    const inkSections = Array.from(document.querySelectorAll(".on-ink"));

    /* The page's height and where each ink section sits in it, measured once
       and again only when the page changes size. Reading them on every scroll
       frame forced a layout pass per frame; from these, each frame is plain
       arithmetic on the scroll position. */
    let max = 1;
    let inkSpans = [];
    const measureGeometry = () => {
      const y = window.scrollY;
      max = document.documentElement.scrollHeight - window.innerHeight;
      inkSpans = inkSections.map((s) => {
        const r = s.getBoundingClientRect();
        return [r.top + y, r.bottom + y];
      });
    };

    /* Set by a resize; the next frame re-measures before it draws, even when
       that frame was already queued by a scroll. */
    let geometryStale = false;

    const measure = () => {
      if (geometryStale) {
        measureGeometry();
        geometryStale = false;
      }
      const y = window.scrollY;
      const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;

      if (Math.abs(p - lastP) > 0.0005) {
        rail.style.setProperty("--p", p.toFixed(4));
        lastP = p;
      }

      // Flip contrast when the rail sits over a dark section.
      const probe = y + window.innerHeight * 0.62;
      const onInk = inkSpans.some(([top, bottom]) => top <= probe && bottom >= probe);
      const theme = onInk ? "ink" : "cream";
      if (theme !== lastTheme) {
        rail.dataset.theme = theme;
        lastTheme = theme;
      }

      queued = false;
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      raf = requestAnimationFrame(measure);
    };

    const onResize = () => {
      geometryStale = true;
      onScroll();
    };

    /* Images, fonts and the form change the page height after load. */
    const ro = new ResizeObserver(onResize);
    ro.observe(document.body);

    measureGeometry();
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      className="rail"
      ref={railRef}
      data-reduced={reduced ? "true" : "false"}
      aria-hidden="true"
    >
      <div className="rail__track">
        <div className="rail__fill" />
      </div>

      {/* The travelling camera — the only part that moves. */}
      <div className="rail__cam">
        <RailCamera />
      </div>

      {/* The photographer: whole, planted, never split. */}
      <div className="rail__figure">
        <RailFigure />
      </div>
      <div className="rail__ground" />
    </div>
  );
}

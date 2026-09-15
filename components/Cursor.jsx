"use client";

import { useEffect, useRef } from "react";
import { useIsDesktop, usePrefersReducedMotion } from "@/lib/motion";

/* ==========================================================================
   THE CAMERA CURSOR
   --------------------------------------------------------------------------
   A small ink dot that swells into an orange disc carrying a label over
   interactive media. Desktop pointers only — it never mounts on touch or
   tablet, and never on reduced motion.

   The labels are the camera department's, not a website's. Mapping them here
   rather than rewriting every `data-cursor` in the page keeps the change to
   one file, and leaves the attributes meaning what they always meant.
   ========================================================================== */

/* PLAY    → the reel: the camera is rolling
   VIEW    → a piece of work: the camera is finding it
   EXPLORE → a link onward: the next take */
const LABELS = {
  PLAY: "REC",
  VIEW: "FOCUS",
  EXPLORE: "ROLL",
};

/* Only these get the little tell after the word — the dot is a recording
   light, the arrow is a direction, and neither belongs on a focus pull. */
const MARK = { PLAY: "rec", EXPLORE: "arrow" };

export default function Cursor() {
  const isDesktop = useIsDesktop();
  const reduced = usePrefersReducedMotion();
  const wrapRef = useRef(null);
  const labelRef = useRef(null);

  const enabled = isDesktop && !reduced;

  useEffect(() => {
    if (!enabled) return;

    const wrap = wrapRef.current;
    const label = labelRef.current;
    if (!wrap) return;

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const target = { ...pos };
    let raf = 0;
    let visible = false;

    const onMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!raf) raf = requestAnimationFrame(tick);
      if (!visible) {
        visible = true;
        wrap.style.opacity = "1";
      }

      /* Inside the hero the bare dot becomes an autofocus point — see
         .cursor[data-zone="hero"] in the stylesheet. Nothing else about the
         cursor changes, and over an interactive element the usual orange disc
         still wins. */
      wrap.dataset.zone =
        e.target instanceof Element && e.target.closest(".hero") ? "hero" : "";

      const hit = e.target instanceof Element ? e.target.closest("[data-cursor]") : null;
      if (hit) {
        const key = hit.getAttribute("data-cursor") || "VIEW";
        wrap.classList.add("is-active");
        /* Anything unmapped falls through as its own text, so a future
           data-cursor still works without touching this file. */
        if (label) label.textContent = LABELS[key] || key;
        wrap.dataset.mark = MARK[key] || "none";
      } else {
        wrap.classList.remove("is-active");
      }
    };

    const onLeave = () => {
      visible = false;
      wrap.style.opacity = "0";
    };

    const tick = () => {
      /* Lerp toward the pointer: still weighted, but 0.3 rather than 0.18,
         which trailed the hand by about a quarter of a second and read as
         lag. Once it has caught up the loop stops; a pointer move starts it
         again, so a still mouse costs nothing. */
      pos.x += (target.x - pos.x) * 0.3;
      pos.y += (target.y - pos.y) * 0.3;
      const settled =
        Math.abs(target.x - pos.x) < 0.1 && Math.abs(target.y - pos.y) < 0.1;
      if (settled) {
        pos.x = target.x;
        pos.y = target.y;
      }
      wrap.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      raf = settled ? 0 : requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="cursor" ref={wrapRef} aria-hidden="true" style={{ opacity: 0 }}>
      <div className="cursor__dot" />
      <div className="cursor__ring">
        <span ref={labelRef}>FOCUS</span>
      </div>
    </div>
  );
}

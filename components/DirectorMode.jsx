"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/motion";

/* ==========================================================================
   PARANTI DIRECTOR MODE
   --------------------------------------------------------------------------
   An optional second way to look at the site: not a redesign, a camera held
   up to the one that is already there.

   THE SITE IS NEVER MODIFIED. Everything this feature does is either inside
   its own fixed overlay or expressed as CSS keyed off one attribute:

       document.documentElement[data-director="on"]

   Drop that attribute and the page is byte-for-byte the normal site again —
   there is no state to unwind, no styles to restore and nothing left behind.
   That is the whole architecture, and it is why "EXIT" can be trusted.

   It mounts nothing until it is switched on: the overlay returns null while
   inactive, so a visitor who never finds the viewfinder pays for a single
   event listener and nothing else.

   WHAT RUNS WHILE IT IS ON
   One rAF. It advances the timecode, eases the focus box toward its target
   and writes two custom properties for the camera move. Every visual is a
   transform or an opacity; nothing here reads layout except the focus box's
   one getBoundingClientRect per hover change, which is cached until the
   hovered element changes.
   ========================================================================== */

/* Anything worth pulling focus on. Ordered most specific first — closest()
   walks up from the pointer, so a card must win over the section holding it. */
const LOCK_TARGETS = [
  ".work__card",
  ".showreel__stage",
  ".sheet__frame",
  ".about__card",
  ".trust__logo",
  ".process__step",
  ".btn",
  ".contact__form .field",
].join(",");

/* 24fps, because that is what a film camera counts in. */
const FPS = 24;
const START_FRAMES = ((1 * 60 + 24) * FPS) + 18; // 00:01:24:18

const pad = (n, w = 2) => String(n).padStart(w, "0");

function timecode(frames) {
  const f = frames % FPS;
  const total = Math.floor(frames / FPS);
  return `${pad(Math.floor(total / 3600))}:${pad(
    Math.floor(total / 60) % 60
  )}:${pad(total % 60)}:${pad(f)}`;
}

export default function DirectorMode() {
  const [active, setActive] = useState(false);
  const reduced = usePrefersReducedMotion();

  const boxRef = useRef(null);
  const labelRef = useRef(null);
  const tcRef = useRef(null);
  const birdRef = useRef(null);

  /* ---- the switch ------------------------------------------------------
     The trigger lives in the hero and knows nothing about this component —
     it dispatches an event. No context provider, no prop drilling, and the
     hero keeps working if this file is deleted. */
  useEffect(() => {
    const onToggle = () => setActive((v) => !v);
    window.addEventListener("paranti:director", onToggle);
    return () => window.removeEventListener("paranti:director", onToggle);
  }, []);

  const exit = useCallback(() => setActive(false), []);

  /* ---- the attribute ---------------------------------------------------
     Set on <html> rather than <body> so the CSS can reach fixed layers that
     sit outside the app root. Removed on cleanup no matter how we leave. */
  useEffect(() => {
    const root = document.documentElement;
    if (active) root.dataset.director = "on";
    else delete root.dataset.director;
    return () => {
      delete root.dataset.director;
    };
  }, [active]);

  /* Escape leaves, the way it does everywhere else on the site. */
  useEffect(() => {
    if (!active) return;
    const onKey = (e) => {
      if (e.key === "Escape") setActive(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active]);

  /* ---- the loop --------------------------------------------------------- */
  useEffect(() => {
    if (!active) return;

    const root = document.documentElement;
    const box = boxRef.current;
    const label = labelRef.current;
    const tc = tcRef.current;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    /* Focus box geometry: current and target, eased every frame. */
    let cur = { x: 0, y: 0, w: 116, h: 76 };
    let tgt = { ...cur };
    let hasPointer = false;
    let lockedEl = null;

    /* Camera: pointer position, damped hard. */
    let px = 0;
    let py = 0;
    let cxv = 0;
    let cyv = 0;

    let raf = 0;
    let running = false;
    const t0 = performance.now();

    const IDLE = { w: 116, h: 76 };

    const setLabel = (el) => {
      if (!label) return;
      if (!el) {
        label.textContent = "";
        box.dataset.lock = "off";
        return;
      }
      box.dataset.lock = "on";
      /* A project reads out like a slate. Everything else just locks. */
      const name = el.querySelector?.(".work__name")?.textContent?.trim();
      const cat = el.querySelector?.(".work__cat")?.textContent?.trim();
      label.textContent = name
        ? `FOCUS LOCK\n${name}\n${cat || ""}`.trim()
        : "FOCUS LOCK";
    };

    const measure = () => {
      if (!lockedEl) return;
      const r = lockedEl.getBoundingClientRect();
      /* A little proud of the element, the way a focus box sits outside its
         subject rather than tight against it. */
      tgt = { x: r.left - 6, y: r.top - 6, w: r.width + 12, h: r.height + 12 };
    };

    const onMove = (e) => {
      hasPointer = true;
      px = (e.clientX / window.innerWidth) * 2 - 1;
      py = (e.clientY / window.innerHeight) * 2 - 1;

      const hit =
        e.target instanceof Element ? e.target.closest(LOCK_TARGETS) : null;

      if (hit !== lockedEl) {
        lockedEl = hit;
        setLabel(hit);
      }

      if (hit) measure();
      else
        tgt = {
          x: e.clientX - IDLE.w / 2,
          y: e.clientY - IDLE.h / 2,
          w: IDLE.w,
          h: IDLE.h,
        };
    };

    /* Touch: a tap pulls focus where it landed, then releases. No follow. */
    const onTouch = (e) => {
      const t = e.touches?.[0];
      if (!t) return;
      hasPointer = true;
      const hit =
        e.target instanceof Element ? e.target.closest(LOCK_TARGETS) : null;
      lockedEl = hit;
      setLabel(hit);
      if (hit) measure();
      else
        tgt = {
          x: t.clientX - IDLE.w / 2,
          y: t.clientY - IDLE.h / 2,
          w: IDLE.w,
          h: IDLE.h,
        };
    };

    const frame = (now) => {
      /* Timecode. Derived from elapsed time rather than counted per frame,
         so it stays honest if the tab throttles. */
      if (tc) {
        const f = START_FRAMES + Math.floor(((now - t0) / 1000) * FPS);
        const next = timecode(f);
        if (tc.textContent !== next) tc.textContent = next;
      }

      if (box && hasPointer) {
        /* Locked boxes snap in faster than a free box drifts — that
           difference in weight is what makes a lock feel like a lock. */
        const k = lockedEl ? 0.22 : 0.16;
        cur.x += (tgt.x - cur.x) * k;
        cur.y += (tgt.y - cur.y) * k;
        cur.w += (tgt.w - cur.w) * k;
        cur.h += (tgt.h - cur.h) * k;
        box.style.transform = `translate3d(${cur.x.toFixed(1)}px, ${cur.y.toFixed(
          1
        )}px, 0)`;
        box.style.width = `${cur.w.toFixed(1)}px`;
        box.style.height = `${cur.h.toFixed(1)}px`;
      }

      /* The camera operator: 2px / 3px / 4px across the three scene planes,
         written once and read by CSS. */
      if (fine && !reduced) {
        cxv += (px - cxv) * 0.04;
        cyv += (py - cyv) * 0.04;
        root.style.setProperty("--dm-x", cxv.toFixed(4));
        root.style.setProperty("--dm-y", cyv.toFixed(4));
      }

      if (running) raf = requestAnimationFrame(frame);
    };

    running = true;
    raf = requestAnimationFrame(frame);

    if (fine) window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    /* A locked box must not be left hanging over a moved element. */
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure, { passive: true });

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      root.style.removeProperty("--dm-x");
      root.style.removeProperty("--dm-y");
    };
  }, [active, reduced]);

  /* ---- the bird ---------------------------------------------------------
     Rare on purpose. Somewhere between forty seconds and two minutes apart,
     one silhouette crosses the frame and is gone. It is a signature, not a
     feature, and a visitor may well never see it. */
  useEffect(() => {
    if (!active || reduced) return;
    let timer = 0;
    const schedule = () => {
      timer = window.setTimeout(() => {
        const el = birdRef.current;
        if (el) {
          el.dataset.fly = "true";
          window.setTimeout(() => {
            if (birdRef.current) delete birdRef.current.dataset.fly;
          }, 9000);
        }
        schedule();
      }, 40000 + Math.random() * 80000);
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, [active, reduced]);

  if (!active) return null;

  return (
    <div className="dm" role="region" aria-label="Director mode camera overlay">
      {/* Powering on: the aperture opens and one scanline sweeps the frame.
          Both play once and are then inert. */}
      <span className="dm__iris" aria-hidden="true">
        <span className="dm__blade" />
        <span className="dm__blade" />
        <span className="dm__blade" />
      </span>
      <span className="dm__sweep" aria-hidden="true" />

      {/* Glass: scanlines and a vignette, both far below the threshold of
          anything you would call an effect. */}
      <span className="dm__glass" aria-hidden="true" />

      {/* ---- HUD ---------------------------------------------------------- */}
      <div className="dm__hud mono" aria-hidden="true">
        <div className="dm__corner dm__corner--tl">
          <span className="dm__brand">PARANTI MEDIA</span>
          <span>CAM 01</span>
          <span className="dm__rec">
            REC <i />
          </span>
        </div>

        <div className="dm__corner dm__corner--tr">
          <span>35MM</span>
          <span>F2.8</span>
          <span>ISO 400</span>
        </div>

        <div className="dm__corner dm__corner--bl">
          <span>DIRECTOR MODE</span>
        </div>

        <div className="dm__corner dm__corner--br">
          <span className="dm__tc" ref={tcRef}>
            00:01:24:18
          </span>
        </div>
      </div>

      {/* The focus box. Sized and positioned entirely from the loop. */}
      <span className="dm__focus" ref={boxRef} data-lock="off" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <span className="dm__focuslabel mono" ref={labelRef} />
      </span>

      {/* The signature. Same two-stroke silhouette as the sky above the site. */}
      <span className="dm__bird" ref={birdRef} aria-hidden="true">
        <svg viewBox="0 0 24 8" width="46" height="15">
          <path
            d="M1 6 C5 1.4, 8.4 1.4, 12 5.2 C15.6 1.4, 19 1.4, 23 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </span>

      <button type="button" className="dm__exit mono" onClick={exit}>
        EXIT DIRECTOR MODE <span aria-hidden="true">×</span>
      </button>
    </div>
  );
}

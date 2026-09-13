"use client";

import { useEffect, useState } from "react";

/* True when the visitor has asked the OS to reduce motion. */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}

/* True on a real pointer device wide enough for the cinematic interactions. */
export function useIsDesktop(minWidth = 1025) {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(
      `(hover: hover) and (pointer: fine) and (min-width: ${minWidth}px)`
    );
    const update = () => setOk(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [minWidth]);

  return ok;
}

/* Lightweight IntersectionObserver reveal. Adds .is-in once, then unobserves.
   Falls back to "everything visible" when motion is reduced. */
export function useReveal(rootRef, { selector = ".reveal" } = {}) {
  useEffect(() => {
    const root = rootRef?.current || document;
    const scope = root === document ? document.body : root;

    // `.is-queued` marks a node whose staggered timer is already ticking, so
    // a later sweep never schedules it twice.
    const remaining = () =>
      Array.from(scope.querySelectorAll(`${selector}:not(.is-in):not(.is-queued)`));

    /* Reduced motion: nothing is ever hidden, including anything React
       renders later. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const showAll = () => remaining().forEach((n) => n.classList.add("is-in"));
      showAll();
      const mo = new MutationObserver(showAll);
      mo.observe(scope, { childList: true, subtree: true });
      return () => mo.disconnect();
    }

    /* A plain, deterministic sweep beats an IntersectionObserver here: it
       re-evaluates the true geometry on every frame the page moves, so
       smooth-scroll jumps, restored scroll positions and late-rendered nodes
       all resolve correctly. The candidate list only ever shrinks, so the
       cost falls to zero once the page has been read through. */
    let queued = false;
    let raf = 0;

    const sweep = () => {
      queued = false;
      const trigger = window.innerHeight * 0.92;
      remaining().forEach((el) => {
        const { top, bottom } = el.getBoundingClientRect();
        if (bottom < 0 || top > trigger) return;
        const delay = Number(el.dataset.revealDelay || 0);
        if (delay) {
          window.setTimeout(() => el.classList.add("is-in"), delay);
          el.classList.add("is-queued");
        } else {
          el.classList.add("is-in");
        }
      });
    };

    const schedule = () => {
      if (queued) return;
      queued = true;
      raf = requestAnimationFrame(sweep);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("load", schedule);
    const mo = new MutationObserver(schedule);
    mo.observe(scope, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("load", schedule);
      mo.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [rootRef, selector]);
}

/* Smoothly scroll to a hash target through Lenis when it is running. */
export function scrollToHash(hash) {
  const el = document.querySelector(hash);
  if (!el) return;
  const lenis = window.__lenis;
  if (lenis) {
    lenis.scrollTo(el, { offset: 0, duration: 1.2 });
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/* ==========================================================================
   SCROLL SETUP
   --------------------------------------------------------------------------
   The page scrolls natively. It used to run Lenis smooth scrolling on
   desktop, and that is what made the contact section judder: with Lenis the
   scroll position is computed on the main thread every frame, so any frame
   the browser is slow to paint — and the closing landscape, with its sun,
   fog, dust and iris stacked full-screen, is the most expensive part of the
   site to paint — stalls the page and then jumps it. Phones never had the
   problem because they were already scrolling natively.

   Native scrolling runs on the compositor: a slow frame can make an effect
   lag by a frame, but it can no longer move the page unevenly.

   ScrollTrigger still drives the hero entrance, and everything else reads
   window.scrollY, which is exactly as correct without Lenis as with it.
   Nothing else in the site depends on `window.__lenis` existing: every call
   is optional (`window.__lenis?.stop()`), and scrollToHash falls back to the
   browser's own smooth scrolling.
   ========================================================================== */
export default function SmoothScroll() {
  useEffect(() => {
    document.documentElement.classList.remove("no-js");

    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.refresh();

    // Media finishing load changes page height — recalculate triggers.
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    /* A single refresh on load is not enough on this page: images, fonts and
       late-rendered media keep changing the document height well after
       `load`, and every trigger below would keep the start position it
       measured against the shorter document. The 80px floor ignores the small
       reflows a refresh itself causes, so this cannot feed itself. */
    let lastH = document.documentElement.scrollHeight;
    let settle = 0;

    const onGrow = () => {
      const h = document.documentElement.scrollHeight;
      if (Math.abs(h - lastH) < 80) return;
      lastH = h;
      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        ScrollTrigger.refresh();
        lastH = document.documentElement.scrollHeight;
      }, 240);
    };

    const ro = new ResizeObserver(onGrow);
    ro.observe(document.body);

    return () => {
      ro.disconnect();
      window.clearTimeout(settle);
      window.removeEventListener("load", onLoad);
    };
  }, []);

  return null;
}

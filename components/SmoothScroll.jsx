"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/* Lenis smooth scrolling, wired into GSAP's ticker so ScrollTrigger stays in
   sync. Disabled entirely when the visitor prefers reduced motion — native
   scrolling is left completely untouched in that case. */
export default function SmoothScroll() {
  useEffect(() => {
    document.documentElement.classList.remove("no-js");

    gsap.registerPlugin(ScrollTrigger);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false, // native momentum on touch feels better than emulation
      touchMultiplier: 1.6,
    });

    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Media finishing load changes page height — recalculate triggers.
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    /* A single refresh on load is not enough on this page. The story pins
       itself only after probing its frames, which adds several viewports of
       runway well after `load`, and every trigger below it — the contact
       crossing especially — would keep the start position it measured against
       the shorter document and sit permanently past its own end.

       Watching the document height catches that, and every other late shift
       (media decoding, font swap) for free. The 80px floor ignores the small
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
      gsap.ticker.remove(raf);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return null;
}

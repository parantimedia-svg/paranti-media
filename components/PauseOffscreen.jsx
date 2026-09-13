"use client";

import { useEffect } from "react";

/* Pauses the CSS animations of any section that is off screen.

   The page has a lot of slow, endless ambient motion — clouds, fog, cameos,
   breathing lights, the logo marquee. A section nobody can see has no reason
   to keep animating it. This marks each section `data-offscreen` while it is
   more than a margin away from the viewport, and the stylesheet pauses every
   animation inside it; they pick up exactly where they left off on return.
   Transitions (the scroll reveals) are unaffected. */
export default function PauseOffscreen() {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;

    const targets = document.querySelectorAll("main > section, footer");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          const off = e.isIntersecting ? "false" : "true";
          if (e.target.dataset.offscreen !== off) e.target.dataset.offscreen = off;
        }),
      { rootMargin: "300px 0px" }
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  return null;
}

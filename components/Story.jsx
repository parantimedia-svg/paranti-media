"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Scene from "./story/Scene";
import StaticHero from "./story/StaticHero";
import { buildStoryTimeline } from "@/lib/story-timeline";

/* ==========================================================================
   THE STORY SECTION
   --------------------------------------------------------------------------
   A pinned, scroll-scrubbed sequence sitting between the hero and the
   showreel. Scroll is the only control: no buttons, no autoplay.

   Reduced motion gets a completely different branch — a single static hero
   illustration with the headline, no pin and no ScrollTrigger at all.
   ========================================================================== */

export default function Story() {
  const rootRef = useRef(null);
  /* Defaults to the animated branch so the server and the first client paint
     agree; reduced-motion users swap to the still frame on mount. */
  const [mode, setMode] = useState("scrub");

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMode(mq.matches ? "static" : "scrub");
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (mode !== "scrub") return;
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);

    let ctx;
    // Build after paint so the SVG has real geometry to measure.
    const raf = requestAnimationFrame(() => {
      ctx = gsap.context(() => {
        const mm = gsap.matchMedia();

        mm.add(
          {
            desktop: "(min-width: 861px)",
            mobile: "(max-width: 860px)",
          },
          (context) => {
            const { mobile } = context.conditions;
            const { tl, cycle } = buildStoryTimeline({ root, mobile });

            const st = ScrollTrigger.create({
              animation: tl,
              trigger: root,
              start: "top top",
              // A shorter runway on phones: same story, less scrolling.
              end: mobile ? "+=250%" : "+=400%",
              pin: root.querySelector(".story__stage"),
              pinSpacing: true,
              anticipatePin: 1,
              scrub: true,
              invalidateOnRefresh: true,
            });

            return () => {
              st.kill();
              tl.kill();
              cycle.kill();
            };
          }
        );
      }, root);
    });

    return () => {
      cancelAnimationFrame(raf);
      ctx?.revert();
    };
  }, [mode]);

  /* Reduced motion: one still frame, no pin, no scrubbing. */
  if (mode === "static") {
    return (
      <section className="story story--static" id="story" ref={rootRef}>
        <div className="story__stage story__stage--static">
          <StaticHero />
          <h2 className="story__headline story__headline--static">
            WE DON&apos;T JUST CREATE CONTENT.
            <br />
            WE CREATE <em className="accent">EXPERIENCES.</em>
          </h2>
        </div>
      </section>
    );
  }

  return (
    <section className="story" id="story" data-mode="scrub" ref={rootRef}>
      <div className="story__stage">
        {/* The scene is decorative; the headline carries the meaning, and is
            in the markup from the first paint for SEO and for no-JS. */}
        <Scene />

        <h2 className="story__headline">
          WE DON&apos;T JUST CREATE CONTENT.
          <br />
          WE CREATE <em className="accent">EXPERIENCES.</em>
        </h2>
      </div>
    </section>
  );
}

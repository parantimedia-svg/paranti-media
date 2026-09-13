"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PROCESS } from "@/data/content";
import Filmmaker from "./Filmmaker";

/* Scroll-driven timeline. A single orange line draws down the steps as you
   scroll and each step lights up as the line passes it. */
export default function Process() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      root.querySelectorAll(".process__step").forEach((s) => s.classList.add("is-on"));
      const line = root.querySelector(".process__line span");
      if (line) line.style.transform = "scaleY(1)";
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".process__line span",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          transformOrigin: "top",
          scrollTrigger: {
            trigger: ".process__steps",
            start: "top 72%",
            end: "bottom 78%",
            scrub: 0.6,
          },
        }
      );

      gsap.utils.toArray(".process__step").forEach((step) => {
        ScrollTrigger.create({
          trigger: step,
          start: "top 74%",
          onEnter: () => step.classList.add("is-on"),
          onLeaveBack: () => step.classList.remove("is-on"),
        });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="section on-ink process" id="process" ref={rootRef}>
      {/* Cameo: the edit suite. Decorative, behind the content. */}
      <Filmmaker spot="edit" />
      <div className="inner">
        <header className="process__head">
          <p className="label reveal">CREATIVE PROCESS</p>
          <h2 className="h-section reveal">
            FROM IDEA TO <em className="accent">FINAL FRAME.</em>
          </h2>
        </header>

        <div className="process__steps">
          <div className="process__line" aria-hidden="true">
            <span />
          </div>

          <ol>
            {PROCESS.map((p) => (
              <li className="process__step" key={p.num}>
                <span className="process__dot" aria-hidden="true" />
                <span className="process__num mono">{p.num}</span>
                <div className="process__content">
                  <h3 className="process__title">{p.title}</h3>
                  <p>{p.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

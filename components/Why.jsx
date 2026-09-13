"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { WHY_STATEMENTS } from "@/data/content";
import Filmmaker from "./Filmmaker";

export default function Why() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.utils.toArray(".why__stmt").forEach((el, i) => {
        const inner = el.querySelector("span");

        // Mask-reveal as it arrives…
        gsap.fromTo(
          inner,
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%" },
          }
        );

        // …then a slow scrubbed drift so the block keeps breathing on scroll.
        gsap.fromTo(
          el,
          { xPercent: i % 2 === 0 ? -2.5 : 2.5 },
          {
            xPercent: i % 2 === 0 ? 2.5 : -2.5,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8,
            },
          }
        );
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="section on-ink why" id="why" ref={rootRef}>
      {/* Cameo: crossing the set. Decorative, behind the content. Rehoused
          here when the behind-the-scenes section was removed — it was the one
          cameo that moves, and it would otherwise have gone with it. */}
      <Filmmaker spot="passing" />
      <div className="inner">
        <div className="why__head">
          <p className="label reveal">WHY PARANTI MEDIA</p>
          <h2 className="why__main reveal">
            PRODUCTION <em className="accent">+</em> STRATEGY.
          </h2>
          <p className="lead reveal" data-reveal-delay="80">
            We combine cinematic production with marketing thinking, creating
            content that isn&apos;t only beautiful — it has a purpose.
          </p>
        </div>

        <ul className="why__list">
          {WHY_STATEMENTS.map((s, i) => (
            <li key={s} className="why__stmt">
              <span>
                <em className="mono why__idx">0{i + 1}</em>
                {s}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

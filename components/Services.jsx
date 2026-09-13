"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { SERVICES } from "@/data/content";
import Filmmaker from "./Filmmaker";

/* ==========================================================================
   SERVICES — the nine disciplines as a contact sheet: frames on strips of
   35mm film, the way a director marks up the takes worth printing.
   Each frame sits undeveloped until it is looked at. On a mouse, hovering
   develops it; on touch, scrolling a frame to the middle of the screen
   develops it and it stays developed, so every note is readable on a phone.
   Keyboard focus develops a frame too.
   ========================================================================== */

/* The hover state is toggled on the element directly rather than through
   className. A React className update rewrites the whole class attribute,
   which would strip the `is-in` the reveal hook added and hide the frame. */
const develop = (el, on) => el?.classList.toggle("is-dev", on);

export default function Services() {
  const sheetRef = useRef(null);
  /* True on touch screens, where a developed frame stays developed. */
  const persist = useRef(false);

  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    persist.current = true;

    /* A plain geometry sweep on scroll, the same approach as the reveal
       hook: a frame develops once any part of it crosses the middle band of
       the screen. It re-checks true positions on every frame the page moves,
       so smooth-scroll jumps can't skip one. */
    let pending = Array.from(sheet.querySelectorAll(".sheet__cell"));
    let raf = 0;

    const sweep = () => {
      raf = 0;
      const top = window.innerHeight * 0.38;
      const bottom = window.innerHeight * 0.62;
      pending = pending.filter((c) => {
        const r = c.getBoundingClientRect();
        if (r.bottom < top || r.top > bottom) return true;
        develop(c, true);
        return false;
      });
      if (!pending.length) stop();
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(sweep);
    };
    const stop = () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    schedule();
    return () => {
      stop();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="section services" id="services">
      {/* Cameo: mid-take. Decorative, behind the content. */}
      <Filmmaker spot="filming" />

      <div className="inner">
        <header className="services__head">
          <p className="label reveal">SERVICES</p>
          <h2 className="h-section reveal">
            WHAT WE <em className="accent">CREATE</em>
          </h2>
          <p className="lead reveal" data-reveal-delay="80">
            Nine disciplines, one production standard. Everything below is
            handled in-house, end to end.
          </p>
        </header>

        <ul className="sheet" ref={sheetRef}>
          {SERVICES.map((s, i) => (
            <li
              key={s.num}
              className="sheet__cell reveal"
              data-reveal-delay={Math.min(i * 60, 330)}
              onPointerEnter={(e) =>
                e.pointerType === "mouse" && develop(e.currentTarget, true)
              }
              onPointerLeave={(e) =>
                e.pointerType === "mouse" && develop(e.currentTarget, false)
              }
            >
              <span className="sheet__perf" aria-hidden="true" />

              <a
                href="#contact"
                className="sheet__frame"
                data-cursor="VIEW"
                aria-label={`${s.title} — enquire`}
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .querySelector("#contact")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                onFocus={(e) => develop(e.currentTarget.parentElement, true)}
                onBlur={(e) =>
                  !persist.current &&
                  develop(e.currentTarget.parentElement, false)
                }
              >
                {/* The still: black-and-white and underexposed until the
                    frame develops, then it comes up in full colour. */}
                {s.image && (
                  <span
                    className={`sheet__photo${s.light ? " sheet__photo--light" : ""}`}
                    aria-hidden="true"
                  >
                    <Image
                      src={s.image}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      style={{ objectPosition: s.focus || "50% 50%" }}
                    />
                  </span>
                )}
                <span className="sheet__ghost" aria-hidden="true">
                  {s.num}
                </span>
                <span className="sheet__top mono" aria-hidden="true">
                  <span className="sheet__num">{s.num}</span>
                  <span className="sheet__print">PRINT →</span>
                </span>
                <span className="sheet__body">
                  <span className="sheet__title">{s.title}</span>
                  <span className="sheet__note">{s.note}</span>
                </span>
                {/* The grease-pencil box an editor draws round a keeper. It
                    runs inside the frame's padding, so it never crosses the
                    words. */}
                <svg
                  className="sheet__mark"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    pathLength="1"
                    d="M3 2.5 C30 1.2, 70 2.2, 97.5 2.8 C98.8 30, 97.8 70, 97.2 97.4 C70 98.8, 30 97.8, 2.6 97.2 C1.2 70, 2.2 30, 2.8 6 C4 2.6, 11 1.6, 19 2.2"
                  />
                </svg>
              </a>

              <span className="sheet__edge mono" aria-hidden="true">
                <span>▸ {s.num}</span>
                <span>PARANTI 400</span>
                <span>{s.num}A</span>
              </span>
              <span className="sheet__perf" aria-hidden="true" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

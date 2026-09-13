"use client";

import { useEffect, useRef } from "react";
import MediaFrame from "./MediaFrame";

/* Immersive case study panel. Opens over the page, restores focus on close.
   Renders only the fields a project actually has — no invented results,
   credits, clients or years. */
export default function CaseStudy({ project, onClose }) {
  const ref = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    if (!project) return;

    const prev = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.__lenis?.stop();
    closeRef.current?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const nodes = ref.current?.querySelectorAll(
          'button, a[href], video, [tabindex]:not([tabindex="-1"])'
        );
        if (!nodes?.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      window.__lenis?.start();
      prev instanceof HTMLElement && prev.focus();
    };
  }, [project, onClose]);

  if (!project) return null;

  const p = project;
  const meta = [
    p.client && { k: "CLIENT", v: p.client },
    p.category && { k: "CATEGORY", v: p.category },
    p.year && { k: "YEAR", v: p.year },
  ].filter(Boolean);

  return (
    <div
      className="case"
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-title"
      ref={ref}
    >
      <div className="case__bar">
        <span className="mono">CASE STUDY</span>
        <button
          type="button"
          className="mono case__close"
          onClick={onClose}
          ref={closeRef}
        >
          CLOSE <span aria-hidden="true">✕</span>
        </button>
      </div>

      <div className="case__scroll">
        <header className="case__head">
          {p.category && <p className="label">{p.category}</p>}
          <h2 className="case__title h-section" id="case-title">
            {p.name}
          </h2>
        </header>

        <MediaFrame
          src={p.thumbnail}
          video={p.video}
          poster={p.poster}
          label={p.placeholder ? "PROJECT MEDIA" : p.name}
          hint={p.placeholder ? "ADD MEDIA IN data/projects.js" : null}
          alt={p.name}
          ratio="16 / 9"
          sizes="(max-width: 900px) 100vw, 90vw"
        />

        <div className="case__body">
          <div className="case__meta">
            {meta.map((m) => (
              <div key={m.k}>
                <span className="mono">{m.k}</span>
                <p>{m.v}</p>
              </div>
            ))}
            {p.credits?.length > 0 && (
              <div className="case__credits">
                <span className="mono">CREDITS</span>
                {p.credits.map((c) => (
                  <p key={c.role}>
                    {c.role} — {c.name}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="case__text">
            <p className="lead">{p.description}</p>

            {p.results?.length > 0 && (
              <ul className="case__results">
                {p.results.map((r) => (
                  <li key={r.label}>
                    <strong>{r.value}</strong>
                    <span className="mono">{r.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="case__cta">
          <a
            href="#contact"
            className="btn btn--solid"
            onClick={(e) => {
              e.preventDefault();
              onClose();
              setTimeout(
                () =>
                  document
                    .querySelector("#contact")
                    ?.scrollIntoView({ behavior: "smooth" }),
                80
              );
            }}
          >
            <span>START A PROJECT LIKE THIS</span>
            <span className="arrow" aria-hidden="true">
              →
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}

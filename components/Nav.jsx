"use client";

import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import { NAV_LINKS, SITE } from "@/data/site";
import { scrollToHash } from "@/lib/motion";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => {
    let queued = false;
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 40);
        queued = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock the page and trap focus while the mobile overlay is open.
  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.__lenis?.stop();

    const panel = panelRef.current;
    const focusables = panel?.querySelectorAll("a, button");
    focusables?.[0]?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== "Tab" || !focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      window.__lenis?.start();
    };
  }, [open]);

  const go = (e, href) => {
    e.preventDefault();
    setOpen(false);
    // Let the overlay finish closing before the scroll starts.
    setTimeout(() => scrollToHash(href), open ? 220 : 0);
  };

  return (
    <>
      <header
        className={`nav ${scrolled ? "is-scrolled" : ""} ${open ? "is-open" : ""}`}
      >
        {/* The real logo, exactly as supplied — it is a complete lockup, so no
            text wordmark is repeated beside it. */}
        <a
          href="#top"
          className="nav__logo"
          aria-label="PARANTI MEDIA — home"
          onClick={(e) => {
            e.preventDefault();
            window.__lenis
              ? window.__lenis.scrollTo(0, { duration: 1.1 })
              : window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          {/* Always tiled: cream-on-cream is invisible over the hero and the
              scrolled bar, and reads as a deliberate stamp on the ink menu. */}
          <Logo size={scrolled ? 60 : 74} priority tile />
        </a>

        <nav className="nav__links" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={(e) => go(e, l.href)}>
              {l.label}
            </a>
          ))}
        </nav>

        <a
          href="#contact"
          className="btn nav__cta"
          onClick={(e) => go(e, "#contact")}
          data-cursor="EXPLORE"
        >
          <span>START A PROJECT</span>
          <span className="arrow" aria-hidden="true">
            →
          </span>
        </a>

        <button
          type="button"
          ref={toggleRef}
          className={`nav__burger ${open ? "is-open" : ""}`}
          aria-expanded={open}
          aria-controls="nav-overlay"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </header>

      {/* Fullscreen cinematic overlay — mobile / tablet */}
      <div
        id="nav-overlay"
        ref={panelRef}
        className={`navpanel ${open ? "is-open" : ""}`}
        inert={!open}
      >
        <ul className="navpanel__list">
          {NAV_LINKS.map((l, i) => (
            <li key={l.href} style={{ "--i": i }}>
              <a href={l.href} onClick={(e) => go(e, l.href)}>
                <span className="navpanel__num mono">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="navpanel__foot">
          <a href="#contact" className="btn btn--solid" onClick={(e) => go(e, "#contact")}>
            <span>START A PROJECT</span>
            <span className="arrow" aria-hidden="true">
              →
            </span>
          </a>
          <div className="navpanel__meta mono">
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            <a href={SITE.instagram} target="_blank" rel="noopener noreferrer">
              {SITE.instagramHandle}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

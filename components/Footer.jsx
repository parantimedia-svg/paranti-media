"use client";

import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import { CameraGlyph, PoleGlyph } from "./Figure";
import { NAV_LINKS, SITE } from "@/data/site";
import { scrollToHash } from "@/lib/motion";

export default function Footer() {
  const year = new Date().getFullYear();
  const footerRef = useRef(null);

  /* The showcase light is switched on when the footer arrives and off again
     when it leaves — so the reader sees it come up, and nothing in it
     animates while it is off screen. */
  const [lit, setLit] = useState(false);

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setLit(entry.isIntersecting),
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <footer
      className="footer on-ink"
      ref={footerRef}
      data-lit={lit ? "true" : "false"}
    >
      {/* ---- THE SHOWCASE ------------------------------------------------
          The last thing on the site: the Paranti monopod on its own, planted
          under a single spotlight like an exhibit. Only the pole and the
          camera — the exact glyphs from the logo, via Figure.jsx, at their
          original proportions and 7° tilt. Decorative, behind the content. */}
      <div className="footer__showcase" aria-hidden="true">
        <span className="footer__lamp" />
        <span className="footer__beam">
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className="footer__pool" />
        <span className="footer__shadow" />
        <span className="footer__plinth" />
        <svg
          className="footer__monopod"
          viewBox="152 6 116 434"
          fill="currentColor"
        >
          <PoleGlyph />
          <CameraGlyph />
        </svg>
      </div>

      <div className="inner">
        <div className="footer__top">
          <div className="footer__brand">
            {/* The real logo again — same untouched file as the nav. */}
            <Logo size={92} className="footer__logo" tile />
            <div>
              <p className="footer__name">PARANTI MEDIA</p>
              <p className="footer__tag mono accent">{SITE.tagline}</p>
            </div>
          </div>

          <nav className="footer__nav" aria-label="Footer">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="link-u"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToHash(l.href);
                }}
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="footer__contact mono">
            <a
              className="link-u"
              href={SITE.instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              {SITE.instagramHandle}
            </a>
            <a className="link-u" href={`mailto:${SITE.email}`}>
              {SITE.email}
            </a>
            <a className="link-u" href={`tel:${SITE.phoneHref}`}>
              {SITE.phoneDisplay}
            </a>
          </div>
        </div>

        <div className="footer__bottom mono">
          <span>© {year} PARANTI MEDIA. ALL RIGHTS RESERVED.</span>
          <span>CREATE. CAPTURE. INSPIRE.</span>
        </div>
      </div>
    </footer>
  );
}

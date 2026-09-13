"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Figure from "./Figure";
import { markReady, introAlreadySeen, rememberIntro } from "@/lib/ready";

/* ==========================================================================
   SIGNATURE ANIMATION (A) — THE MONOPOD PLANT
   --------------------------------------------------------------------------
   The site opens on a near-empty cream stage. The photographer drives the
   monopod into the ground, it bites, the ground line snaps out, the rig
   settles with one damped bounce — then the whole stage wipes up into the hero.

   Kept deliberately short (~1.9s). It is skipped entirely when the visitor
   prefers reduced motion, and after the first view in a session, so repeat
   visitors are never made to wait. Click or press any key to skip.
   ========================================================================== */

export default function Intro() {
  const [mounted, setMounted] = useState(false);
  const [play, setPlay] = useState(false);
  const rootRef = useRef(null);
  const tlRef = useRef(null);

  useEffect(() => {
    setMounted(true);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || introAlreadySeen()) {
      markReady();
      return;
    }

    setPlay(true);
    rememberIntro();
  }, []);

  useEffect(() => {
    if (!play) return;

    const root = rootRef.current;
    if (!root) return;

    // Hold the page at the top while the stage is occupied.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);
    window.__lenis?.stop();

    const finish = () => {
      document.body.style.overflow = prevOverflow;
      window.__lenis?.start();
      markReady();
      setPlay(false);
    };

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: finish });
      tlRef.current = tl;

      const rig = "#pm-rig";
      const ground = "#pm-ground";
      const impact = "#pm-impact";
      const camera = "#pm-camera";

      gsap.set(ground, { scaleX: 0, svgOrigin: "166 420" });
      gsap.set(rig, { y: -190, rotation: -15, svgOrigin: "166 430", opacity: 0 });
      /* `y: 0` clears the 105% that `.line-mask > span` bakes into the CSS
         transform. GSAP reads that as a ~69px y-offset and would otherwise add
         yPercent on top of it, leaving the tagline parked a full mask-height
         low — animated, but never actually visible. */
      gsap.set(".intro__word", { yPercent: 110, y: 0 });

      tl.to(rig, { opacity: 1, duration: 0.12, ease: "none" })
        // the drive — accelerating into the ground
        .to(rig, { y: 0, rotation: 0, duration: 0.44, ease: "power3.in" })

        // …it bites
        .addLabel("plant")
        .to(ground, { scaleX: 1, duration: 0.55, ease: "expo.out" }, "plant")
        .fromTo(
          impact,
          { scale: 0.25, opacity: 0.6, svgOrigin: "166 420" },
          { scale: 1.6, opacity: 0, duration: 0.7, ease: "power2.out" },
          "plant"
        )

        // …and settles: one small kick, then damped to rest
        .to(rig, { y: -13, duration: 0.14, ease: "power2.out" }, "plant")
        .to(rig, { y: 0, duration: 0.55, ease: "elastic.out(1, 0.45)" })
        .to(
          camera,
          { rotation: -8, duration: 0.16, ease: "power2.out", svgOrigin: "213 88" },
          "plant+=0.02"
        )
        .to(
          camera,
          { rotation: 0, duration: 0.8, ease: "elastic.out(1, 0.35)", svgOrigin: "213 88" },
          "plant+=0.18"
        )

        .to(".intro__word", { yPercent: 0, duration: 0.5, ease: "power3.out" }, "plant+=0.2")

        // stage clear
        .to(".intro__stage", { y: -40, opacity: 0, duration: 0.5, ease: "power2.in" }, "+=0.12")
        .to(
          root,
          { yPercent: -100, duration: 0.75, ease: "expo.inOut" },
          "-=0.3"
        );
    }, root);

    // Let anyone bail out of the opening.
    const skip = () => tlRef.current?.progress(1);
    root.addEventListener("click", skip);
    window.addEventListener("keydown", skip);

    return () => {
      root.removeEventListener("click", skip);
      window.removeEventListener("keydown", skip);
      ctx.revert();
      document.body.style.overflow = prevOverflow;
      window.__lenis?.start();
    };
  }, [play]);

  if (!mounted || !play) return null;

  return (
    <div className="intro" ref={rootRef} role="presentation">
      <div className="intro__stage">
        <Figure className="intro__figure" />
        <p className="intro__tag">
          <span className="line-mask">
            <span className="intro__word">CREATE. CAPTURE. INSPIRE.</span>
          </span>
        </p>
      </div>
      <span className="intro__skip mono">CLICK TO SKIP</span>
    </div>
  );
}

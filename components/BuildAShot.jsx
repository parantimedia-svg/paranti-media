"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BodyGlyph, CameraGlyph, PoleGlyph } from "./Figure";

/* ==========================================================================
   BUILD A SHOT
   --------------------------------------------------------------------------
   The visitor steps behind the camera: four decisions — light, lens, angle,
   mood — and a monitor that responds to each the way a real one would.

   THE PREVIEW IS A SCENE, NOT A PHOTOGRAPH.
   A flat image with filters on it cannot answer any of these questions
   honestly. A 24mm and an 85mm do not distort the same picture differently —
   they change the *relationship* between the subject and what is behind it:
   the long lens drags the background forward and makes it huge, the wide lens
   pushes it away to nothing. An angle change moves the horizon, not the
   saturation. So the preview is built from separate layers — sky, sun, ridge,
   ground, subject, cast shadow — and each control moves the layers that the
   real control would move.

   The subject is the Paranti figure itself, composed from the same glyphs the
   scroll rail and the intro use. Nothing here is redrawn.

   HOW IT RENDERS
   Every choice is written as a data attribute on one element. CSS does the
   rest through attribute selectors, so a selection costs one attribute write
   and a handful of GPU-composited transitions — no inline style churn, no
   per-frame JavaScript, and nothing in the loop at all. React re-renders only
   the small control tree.
   ========================================================================== */

const STEPS = [
  {
    key: "light",
    label: "LIGHT",
    /* What each choice does to the scene, in the language of the thing being
       chosen — this is the copy that appears under the option. */
    options: [
      ["SOFT", "Diffused. Shadows open, contrast low."],
      ["HARD", "Direct. Edges crisp, shadows short."],
      ["NATURAL", "Available light, unshaped."],
      ["DRAMATIC", "Low and strong. Long shadows, deep falloff."],
    ],
  },
  {
    key: "lens",
    label: "LENS",
    options: [
      ["24MM", "Wide. The background falls away."],
      ["35MM", "Natural. What the eye sees."],
      ["50MM", "Balanced. Subject and place together."],
      ["85MM", "Long. The background compresses in close."],
    ],
  },
  {
    key: "angle",
    label: "ANGLE",
    options: [
      ["LOW", "Looking up. The subject owns the frame."],
      ["EYE LEVEL", "Level. Honest, unweighted."],
      ["HIGH", "Looking down. The place takes over."],
      ["OVERHEAD", "Above. Ground becomes the frame."],
    ],
  },
  {
    key: "mood",
    label: "MOOD",
    options: [
      ["RAW", "Ungraded. Flat, true, unfinished."],
      ["CINEMATIC", "Warm highlights, cool shadows."],
      ["DARK", "Low key. Held back."],
      ["WARM", "Golden. Everything leans amber."],
    ],
  },
];

/* What the monitor shows before a single choice is made: a real shot, so the
   frame is never an empty box waiting to be filled in. */
const BASE = { light: "NATURAL", lens: "35MM", angle: "EYE LEVEL", mood: "RAW" };

export default function BuildAShot() {
  const [shot, setShot] = useState({
    light: null,
    lens: null,
    angle: null,
    mood: null,
  });
  /* The monitor re-meters for a moment after every change, the way a camera
     does. Purely a tell that something was received. */
  const [adjusting, setAdjusting] = useState(null);
  const timer = useRef(0);

  const complete = STEPS.every((s) => shot[s.key]);

  const choose = useCallback((key, value) => {
    setShot((prev) => (prev[key] === value ? prev : { ...prev, [key]: value }));
    setAdjusting(key);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAdjusting(null), 560);
  }, []);

  const reset = useCallback(() => {
    setShot({ light: null, lens: null, angle: null, mood: null });
    setAdjusting(null);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  /* Falls back to the base shot for anything not yet chosen, so the preview is
     always a coherent frame rather than a half-built one. */
  const v = (k) => shot[k] || BASE[k];

  return (
    <section className="section on-ink bas" id="build-a-shot">
      <div className="inner">
        <header className="bas__head">
          <p className="label reveal">BUILD A SHOT</p>
          <h2 className="h-section reveal" data-reveal-delay="70">
            EVERY FRAME STARTS <em className="accent">WITH A CHOICE.</em>
          </h2>
        </header>

        <div className="bas__layout">
          {/* ---- the monitor ------------------------------------------- */}
          <div className="bas__monitorwrap reveal" data-reveal-delay="140">
            <div
              className="bas__monitor"
              data-light={v("light")}
              data-lens={v("lens")}
              data-angle={v("angle")}
              data-mood={v("mood")}
              data-adjusting={adjusting || "none"}
            >
              {/* The scene. Everything below moves; nothing below is an
                  image file. */}
              <div className="bas__scene" aria-hidden="true">
                {/* The world: every layer that the camera height moves, in
                    one wrapper so they move together. See .bas__world. */}
                <div className="bas__world">
                <span className="bas__sky" />
                <span className="bas__sun" />

                {/* One bird, very small, very far. The signature. */}
                <span className="bas__bird">
                  <svg viewBox="0 0 24 8" width="20" height="7">
                    <path
                      d="M1 6 C5 1.4, 8.4 1.4, 12 5.2 C15.6 1.4, 19 1.4, 23 6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>

                {/* Far plane. Its scale IS the focal length: a long lens makes
                    this large and close, a wide lens makes it small and
                    distant. */}
                <svg
                  className="bas__ridge"
                  viewBox="0 0 3600 300"
                  preserveAspectRatio="none"
                >
                  {/* The original range, tiled three times so the layer can
                      be three frames wide without its peaks stretching. */}
                  <path d="M0 300 L0 196 L88 132 L156 176 L246 96 L330 168 L404 118 L500 200 L566 150 L642 206 L730 128 L812 182 L900 110 L986 174 L1070 140 L1140 190 L1200 196 L1288 132 L1356 176 L1446 96 L1530 168 L1604 118 L1700 200 L1766 150 L1842 206 L1930 128 L2012 182 L2100 110 L2186 174 L2270 140 L2340 190 L2400 196 L2488 132 L2556 176 L2646 96 L2730 168 L2804 118 L2900 200 L2966 150 L3042 206 L3130 128 L3212 182 L3300 110 L3386 174 L3470 140 L3540 190 L3600 152 L3600 300 Z" />
                </svg>

                <span className="bas__haze" />
                <span className="bas__ground" />

                {/* Cast shadow: length, direction, softness and density all
                    come from the light, and it is drawn before the subject so
                    he stands on it. */}
                <span className="bas__cast" />

                <span className="bas__subject">
                  <svg viewBox="0 0 280 445" fill="currentColor">
                    <PoleGlyph />
                    <BodyGlyph />
                    <CameraGlyph />
                  </svg>
                </span>

                </div>

                {/* The grade sits over everything, the way it does — outside
                    the world, because a grade is on the lens, not in the
                    place. */}
                <span className="bas__grade" />
                <span className="bas__vignette" />
              </div>

              {/* ---- monitor furniture -------------------------------- */}
              <div className="bas__osd mono" aria-hidden="true">
                <span className="bas__osdrow bas__osdrow--top">
                  <span>PARANTI MEDIA</span>
                  <span className="bas__rec">
                    REC <i />
                  </span>
                </span>
                <span className="bas__osdrow bas__osdrow--bottom">
                  <span>CAM 01</span>
                  <span>{v("lens")}</span>
                  <span>24 FPS</span>
                </span>
                {/* Frame marks, not a HUD: four corner ticks and nothing
                    else. */}
                <span className="bas__marks">
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
              </div>
            </div>
          </div>

          {/* ---- the controls ------------------------------------------- */}
          <div className="bas__controls">
            {STEPS.map((step, si) => (
              <div
                className="bas__step reveal"
                key={step.key}
                data-reveal-delay={180 + si * 60}
                data-done={shot[step.key] ? "true" : "false"}
              >
                <div className="bas__stephead mono">
                  <span className="bas__stepnum">
                    {String(si + 1).padStart(2, "0")}
                  </span>
                  <span className="bas__steplabel">{step.label}</span>
                  <span className="bas__stepval">{shot[step.key] || "—"}</span>
                </div>

                <div
                  className="bas__options"
                  role="radiogroup"
                  aria-label={step.label}
                >
                  {step.options.map(([value, note]) => {
                    const on = shot[step.key] === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        className="bas__opt"
                        data-on={on ? "true" : "false"}
                        onClick={() => choose(step.key, value)}
                      >
                        <span className="bas__optname">{value}</span>
                        <span className="bas__optnote">{note}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* ---- the slate ------------------------------------------- */}
            <div className="bas__result" data-ready={complete ? "true" : "false"}>
              <p className="bas__resulttitle mono">YOUR SHOT</p>
              <dl className="bas__slate mono">
                {STEPS.map((s) => (
                  <div key={s.key}>
                    <dt>{s.label}</dt>
                    <dd>{shot[s.key] || "—"}</dd>
                  </div>
                ))}
              </dl>

              <p className="bas__ready mono" role="status" aria-live="polite">
                {complete ? "SHOT READY." : ""}
              </p>

              <button
                type="button"
                className="bas__again mono"
                onClick={reset}
                data-cursor="EXPLORE"
              >
                MAKE ANOTHER SHOT <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

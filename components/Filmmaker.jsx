"use client";

import { BodyGlyph, CameraGlyph, PoleGlyph } from "./Figure";

/* ==========================================================================
   THE FILMMAKER — a recurring cameo, not a mascot
   --------------------------------------------------------------------------
   The same photographer who stands on the scroll rail turns up here and there
   in the background of the page: very small, very far off, always doing
   something. The intent is "where is he now?", noticed on a second visit —
   not a cartoon walking across the screen.

   THE CHARACTER IS NOT REDRAWN. This composes the exact same glyphs the rail
   and the intro use (PoleGlyph, BodyGlyph, CameraGlyph from Figure.jsx) at the
   original viewBox, so pose, proportion and tilt are untouched. Only scale,
   position and opacity differ between cameos.

   Every cameo is decorative: aria-hidden, pointer-events:none, and painted
   behind the section's content.

   `spot` picks a scene:
     far      a silhouette on the horizon, barely there
     light    standing beside a soft source, catching its edge
     filming  camera up, mid-take
     edit     sitting in the glow of an editing suite
     passing  crossing the frame slowly, once
   ========================================================================== */

export default function Filmmaker({ spot = "far", className = "" }) {
  return (
    <span
      className={`fm fm--${spot} ${className}`}
      aria-hidden="true"
      data-spot={spot}
    >
      {/* The light he is standing in, where the scene calls for one. Painted
          before the figure so he is always a silhouette against it. */}
      {(spot === "light" || spot === "edit" || spot === "filming") && (
        <span className="fm__source" />
      )}

      <svg className="fm__figure" viewBox="0 0 280 445" fill="currentColor">
        <PoleGlyph />
        <BodyGlyph />
        <CameraGlyph />
      </svg>
    </span>
  );
}

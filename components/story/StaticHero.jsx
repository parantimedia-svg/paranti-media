/* ==========================================================================
   REDUCED-MOTION STILL
   --------------------------------------------------------------------------
   The single frame the sequence resolves to: the avatar in the logo pose with
   the monopod planted. The pose is baked into the SVG markup, so this renders
   correctly with no JavaScript and never animates.

   Placement comes from the same constants the timeline uses, so the still and
   the final frame of the animation can never drift apart.
   ========================================================================== */

import Avatar from "./Avatar";
import { Monopod } from "./Scene";
import { POSE } from "./rig";
import { AV, POLE } from "./stage";

export default function StaticHero() {
  return (
    <svg
      className="story__still"
      viewBox="850 300 460 450"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M880 700 L1290 700"
        stroke="currentColor"
        strokeWidth={2}
        opacity={0.25}
      />

      <g
        transform={`translate(${POLE.planted.x} ${POLE.planted.y}) rotate(${POLE.planted.rot}) scale(${POLE.scale})`}
      >
        <Monopod />
      </g>

      <g transform={`translate(${AV.endX} 700) scale(${AV.scale})`}>
        <Avatar id="avatar-static" pose={POSE.hero} />
      </g>
    </svg>
  );
}

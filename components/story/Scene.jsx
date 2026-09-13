/* ==========================================================================
   THE STORY SCENE
   --------------------------------------------------------------------------
   A single SVG stage, 1600×900, ground line at y=700.

   Layer order is the 2.5D depth stack; each layer is translated at its own
   rate by the timeline to produce parallax:

     #st-bg    distant horizon        (slowest)
     #st-mid   props on the ground
     #st-char  avatar, monster, monopod
     #st-fg    objects passing camera (fastest)

   All four sit inside #st-cam, which is the camera: a single group carrying
   scale + translate. Everything is transform-only, so the whole scene
   composites on the GPU.
   ========================================================================== */

import Avatar from "./Avatar";
import { STAGE } from "./stage";

export { STAGE };

/* --------------------------------------------------------------------------
   THE MONOPOD — the object the story is about.
   Drawn with its origin at the spike tip so "planting" it is just a rotate
   about (0,0). Matches the logo's monopod: slim pole, clamp, DSLR on top.
   -------------------------------------------------------------------------- */
export function Monopod() {
  return (
    <g data-prop="monopod">
      <g data-prop="monopod-inner">
        {/* spike */}
        <path d="M-5 -10 L5 -10 L0 6 Z" />
        {/* shaft */}
        <rect x={-4.5} y={-212} width={9} height={204} />
        {/* clamp */}
        <rect x={-11} y={-120} width={22} height={11} rx={2} />
        {/* camera */}
        <g transform="translate(0 -212)">
          <path d="M-14 -34 h28 a3 3 0 0 1 3 3 v13 h-34 v-13 a3 3 0 0 1 3 -3 z" />
          <path
            d="M-38 -18 h76 a4 4 0 0 1 4 4 v34 a4 4 0 0 1 -4 4 h-76 a4 4 0 0 1 -4 -4 v-34 a4 4 0 0 1 4 -4 z
               M-1.5 -16.5 a16.5 16.5 0 1 0 33 0 a16.5 16.5 0 1 0 -33 0
               M4.5 -10.5 a10.5 10.5 0 1 0 21 0 a10.5 10.5 0 1 0 -21 0"
            fillRule="evenodd"
            transform="translate(-15 15)"
          />
          {/* orange lens glint — one of the few accent moments */}
          <circle
            data-prop="glint"
            cx={0}
            cy={0}
            r={5}
            className="st-accent"
            opacity={0}
          />
        </g>
      </g>
    </g>
  );
}

/* --------------------------------------------------------------------------
   THE MONSTER — rounded, soft and curious. Deliberately not scary: no teeth,
   no claws, wide-set friendly eyes, stubby legs. It is guarding the monopod
   the way a dog guards a stick.
   -------------------------------------------------------------------------- */
function Monster() {
  return (
    <g data-rig="monster">
      <g data-m="root">
        <g data-m="squash">
          {/* stubby legs */}
          <rect x={-64} y={-46} width={40} height={58} rx={20} />
          <rect x={24} y={-46} width={40} height={58} rx={20} />

          {/* body — a soft rounded mass */}
          <path
            d="M0 -250
               C 96 -250 132 -190 132 -128
               C 132 -62 92 -22 0 -22
               C -92 -22 -132 -62 -132 -128
               C -132 -190 -96 -250 0 -250 Z"
          />

          {/* two soft ears */}
          <path d="M-86 -232 c -14 -34 4 -58 26 -50 c 14 6 18 30 10 48 z" />
          <path d="M86 -232 c 14 -34 -4 -58 -26 -50 c -14 6 -18 30 -10 48 z" />

          {/* an orange tuft — the monster's single accent */}
          <path
            className="st-accent"
            d="M0 -258 c -10 -22 6 -34 14 -30 c 10 5 8 22 -2 32 z"
          />

          {/* eyes: cream sclera punched over the body, ink pupils.
              data-m="eyes" is scaled on Y to blink. */}
          <g data-m="eyes">
            <ellipse className="st-eye" cx={-44} cy={-150} rx={30} ry={32} />
            <ellipse className="st-eye" cx={44} cy={-150} rx={30} ry={32} />
            <circle data-m="pupilL" cx={-44} cy={-146} r={13} />
            <circle data-m="pupilR" cx={44} cy={-146} r={13} />
          </g>

          {/* small smile */}
          <path
            data-m="mouth"
            d="M-24 -92 q 24 22 48 0"
            fill="none"
            strokeWidth={7}
            strokeLinecap="round"
            stroke="currentColor"
          />

          {/* holding arm — reaches out past the body edge to grip the
              monopod, then hands it over */}
          <g data-m="armHold" transform="translate(-104 -166)">
            <rect x={-52} y={-13} width={74} height={26} rx={13} />
          </g>

          {/* far arm — waves goodbye at the end */}
          <g data-m="armWave" transform="translate(118 -170)">
            <rect x={-16} y={-13} width={80} height={26} rx={13} />
          </g>
        </g>
      </g>
    </g>
  );
}

/* --------------------------------------------------------------------------
   ENVIRONMENT
   Sparse and editorial — the brand leans on whitespace, so the world is a
   horizon, a ground line and a few marks to give the parallax something to
   read against.
   -------------------------------------------------------------------------- */
function Background() {
  return (
    <g id="st-bg" opacity={0.13}>
      <path d="M-400 700 C 60 612 300 664 620 636 C 940 608 1180 660 2000 606 L 2000 700 Z" />
      <circle cx={1320} cy={214} r={86} opacity={0.5} />
      <path d="M-400 700 C 300 656 900 690 2000 648 L 2000 700 Z" opacity={0.6} />
    </g>
  );
}

function Midground() {
  /* Slim vertical marks — light stands on a distant set. */
  const stands = [220, 520, 760, 1420, 1760, 2100];
  return (
    <g id="st-mid" opacity={0.3}>
      {stands.map((x, i) => (
        <g key={x} transform={`translate(${x} 700) scale(${0.7 + (i % 3) * 0.16})`}>
          <rect x={-2.5} y={-150} width={5} height={150} />
          <path d="M-22 0 L0 -14 L22 0 Z" opacity={0.7} />
          <rect x={-16} y={-172} width={32} height={22} rx={3} />
        </g>
      ))}
      <path d="M-400 700 L 2400 700" stroke="currentColor" strokeWidth={2} fill="none" />
    </g>
  );
}

function Foreground() {
  /* Big soft shapes that sweep past the lens. Low opacity so they read as
     out-of-focus foreground rather than objects in the scene. */
  return (
    <g id="st-fg" opacity={0.1}>
      <ellipse cx={140} cy={880} rx={300} ry={110} />
      <ellipse cx={1180} cy={905} rx={380} ry={120} />
      <ellipse cx={2100} cy={870} rx={300} ry={100} />
    </g>
  );
}

/* -------------------------------------------------------------------------- */
/* preserveAspectRatio is "meet", not "slice": slice would crop the sides on
   portrait viewports and silently push the avatar out of frame. Fitting the
   whole stage letterboxes it instead — and since the bands are the same cream
   as the section, they are invisible. Framing is then controlled entirely by
   the camera, which is what makes it predictable across screen shapes. */
export default function Scene() {
  return (
    <svg
      id="st-stage"
      className="story__svg"
      viewBox={`0 0 ${STAGE.w} ${STAGE.h}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <g id="st-cam">
        <Background />
        <Midground />

        <g id="st-char">
          <Monster />
          <Monopod />
          <Avatar />
          {/* the handoff accent — the one deliberate orange flare */}
          <circle
            data-prop="flash"
            className="st-accent-stroke"
            r={90}
            fill="none"
            strokeWidth={5}
            opacity={0}
          />
        </g>

        <Foreground />
      </g>
    </svg>
  );
}

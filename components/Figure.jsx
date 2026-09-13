/* ==========================================================================
   ANIMATED CHARACTER (SVG)
   --------------------------------------------------------------------------
   IMPORTANT: this is NOT the logo. The real logo is the untouched
   `parantii.png` file, used in the nav, the footer and as the favicon.

   This is a clean, layered re-creation of the photographer + monopod in the
   same black-silhouette style, built only so it can be animated (the
   plant-and-settle intro and the monopod scroll-progress rail).

   Geometry was traced from parantii.png so the pose and proportions match:
   head centre (93,135) r25 · torso (94,175)→(101,272) · monopod tilted 7°
   from (209.5,79) down to (167,418) · ground line at y≈418.

   Every part is a separate node so it can move independently — but the body
   is always drawn as one whole planted figure and is never split.
   ========================================================================== */

/* Circle as a path, so lens rings can be punched out with fill-rule evenodd. */
const c = (cx, cy, r) =>
  `M${cx - r},${cy}a${r},${r} 0 1,0 ${r * 2},0a${r},${r} 0 1,0 ${-r * 2},0`;

/* --------------------------------------------------------------------------
   THE DSLR
   Drawn as one evenodd path so the lens ring is a real hole — it reads
   correctly on cream and on ink without recolouring anything.
   -------------------------------------------------------------------------- */
export function CameraGlyph() {
  /* One outline: hump, stepped body and grip — with the lens ring punched
     straight through so it reads on any background. */
  return (
    <g>
      {/* viewfinder hump */}
      <path d="M197 14h29a3 3 0 0 1 3 3v14h-35V17a3 3 0 0 1 3-3z" />
      {/* body, with the lens ring punched clean through */}
      <path
        d={`M175 30h79a4 4 0 0 1 4 4v37a4 4 0 0 1-4 4h-79a4 4 0 0 1-4-4V34a4 4 0 0 1 4-4z ${c(
          213,
          52,
          17.5
        )} ${c(213, 52, 10.5)}`}
        fillRule="evenodd"
      />
      {/* base plate + mount collar clamping onto the monopod */}
      <path d="M195 75h54v7h-54z" />
      <path d="M205 82h18v9h-18z" />
    </g>
  );
}

/* --------------------------------------------------------------------------
   THE PHOTOGRAPHER — one continuous body, planted in a forward lunge.
   Hands sit on the monopod line at y=133 (high grip) and y=220 (low grip).
   -------------------------------------------------------------------------- */
export function BodyGlyph() {
  return (
    <g>
      {/* limbs: round joints, ends squared off by the feet below */}
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* back leg — thigh into shin, driving back off the ground */}
        <path d="M82 282 L52 354" strokeWidth={38} />
        <path d="M52 354 L34 398" strokeWidth={25} />
        {/* front leg — bent knee, shin dropping beside the monopod */}
        <path d="M124 282 L149 326" strokeWidth={42} />
        <path d="M149 326 L141 398" strokeWidth={23} />
        {/* raised arm — high grip on the pole */}
        <path d="M104 180 L160 172 L202 134" strokeWidth={16} />
        {/* lower arm — bent elbow, low grip */}
        <path d="M103 197 L127 234 L196 221" strokeWidth={17} />
      </g>

      {/* torso — a wedge: rounded shoulders, narrow waist, weighted hips */}
      <path d="M82 166 h26 a13 13 0 0 1 12 14 L115 246 L136 286 L60 286 L67 246 L70 180 a13 13 0 0 1 12 -14 z" />
      {/* neck */}
      <path d="M85 146 L102 146 L104 176 L83 176 Z" />
      {/* head */}
      <circle cx={93} cy={135} r={25} />

      {/* flat feet, planted */}
      <path d="M16 402 L47 398 L49 418 L14 418 Z" />
      <path d="M128 400 L154 400 L157 418 L125 418 Z" />
    </g>
  );
}

/* The monopod, tilted 7° exactly as in the logo. */
export function PoleGlyph() {
  return (
    <g>
      <line
        x1={208.9}
        y1={84}
        x2={168.5}
        y2={408}
        stroke="currentColor"
        strokeWidth={9}
      />
      {/* spike, biting into the ground */}
      <path d="M172.8 402 L163.9 402 L166.5 432 Z" />
      {/* clamp / joint */}
      <path d="M180.4 199.6 L203.2 196.8 L204.6 207.7 L181.8 210.5 Z" />
    </g>
  );
}

/* --------------------------------------------------------------------------
   FULL COMPOSED CHARACTER — used by the intro plant animation.
   Animation handles: #pm-ground · #pm-impact · #pm-rig · #pm-camera
   -------------------------------------------------------------------------- */
export default function Figure({ className = "", titleId }) {
  return (
    <svg
      className={className}
      viewBox="0 0 280 445"
      fill="currentColor"
      role="img"
      aria-labelledby={titleId}
    >
      {titleId && (
        <title id={titleId}>
          A photographer planting a monopod with a camera on top
        </title>
      )}

      {/* the ground the monopod bites into */}
      <path
        id="pm-ground"
        d="M2 422 C70 411 190 409 256 417 C190 415 70 418 2 422 Z"
      />

      {/* impact ripple, flashed once on the plant */}
      <ellipse
        id="pm-impact"
        cx="166"
        cy="420"
        rx="54"
        ry="8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0"
      />

      {/* the rig — body, pole and camera drive down together */}
      <g id="pm-rig">
        <PoleGlyph />
        <BodyGlyph />
        <g id="pm-camera">
          <CameraGlyph />
        </g>
      </g>
    </svg>
  );
}

/* --------------------------------------------------------------------------
   RAIL PIECES
   The rail's pole is a CSS element (so it can span the whole viewport without
   distorting the artwork), so these two SVGs carry no pole of their own.
   RailFigure's viewBox is cropped so its right edge lands exactly on the
   monopod centre line (x=200) — the hands meet the CSS pole precisely.
   -------------------------------------------------------------------------- */
export function RailFigure({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="10 108 190 316"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <BodyGlyph />
    </svg>
  );
}

export function RailCamera({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="170 8 90 80"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <CameraGlyph />
    </svg>
  );
}

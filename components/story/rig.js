/* ==========================================================================
   PARANTI STORY — RIG DEFINITION
   --------------------------------------------------------------------------
   Geometry and pose data for the rigged avatar. Kept as pure data, separate
   from both the SVG markup and the timeline, so the art and the animation
   can be tuned independently.

   COORDINATE SYSTEM
   The avatar is authored in its own local space with the origin ON THE GROUND
   between the feet, +y pointing down (SVG convention). So the head sits at a
   negative y. Placing the avatar in the scene is then just a translate to a
   point on the ground line — no offset maths at the call site.

   BONE CHAIN
   Every bone is drawn from its own joint at (0,0) extending along +y, wrapped
   in a <g> that is translated to the parent's joint. Rotating a bone with
   transformOrigin "0px 0px" therefore pivots it exactly at its joint, and
   child bones inherit the rotation automatically:

     hip ─┬─ thighBack ── shinBack ── footBack
          ├─ thighFront ── shinFront ── footFront
          └─ torso ─┬─ armBack ── forearmBack ── handBack
                    ├─ armFront ── forearmFront ── handFront
                    └─ head
   ========================================================================== */

/* Segment lengths, in avatar-local units. Total height ≈ 311. */
export const BONE = {
  /* Hip height MUST NOT exceed thigh + shin, or the foot can never reach the
     ground and the whole figure floats. Sitting exactly at leg length means a
     straight leg just touches, and any bend lifts the foot naturally. */
  hipY: -138,
  thigh: 70,
  shin: 68,
  foot: 26,
  torso: 102, // hip → shoulder
  arm: 52, // shoulder → elbow
  forearm: 50, // elbow → hand
  neck: 12,
  headR: 26,
};

/* Limb thicknesses — the logo's silhouette is chunky, so these stay heavy. */
export const WIDTH = {
  thigh: 30,
  shin: 23,
  arm: 19,
  forearm: 16,
  torsoTop: 48,
  torsoWaist: 40,
  torsoHip: 52,
};

/* --------------------------------------------------------------------------
   ROTATION CONVENTION — read before touching any number below.

   The avatar faces RIGHT (+x). All values are literal SVG rotation degrees
   (positive = clockwise), so what is written here is what gets applied — no
   sign flipping anywhere in the timeline. Because bones point in different
   directions, "forward" is not the same sign for every bone:

     thigh · shin · arm · forearm   drawn DOWN (+y):  negative = forward swing
     torso · head                   drawn UP  (−y):  positive = lean forward
     foot                           drawn ALONG (+x): positive = toes down

   `bounce` is a y translation, not a rotation: negative = up.
   -------------------------------------------------------------------------- */

/* --------------------------------------------------------------------------
   RUN CYCLE
   One full cycle = two steps. `p` is the phase through the cycle (0→1); the
   back leg/arm reuse the same curves offset by half a cycle, which is what
   makes the gait read as a run rather than a hop.

   Authored as an explicit keyframe list rather than a sine wave because a
   real run is asymmetric: the leg snaps through the swing phase and lingers
   at contact. Scrubbing backwards simply reverses these curves.
   -------------------------------------------------------------------------- */
export const RUN = {
  thigh: [
    { p: 0.0, v: -30 }, // contact — leg reaching forward
    { p: 0.15, v: -13 }, // absorb
    { p: 0.3, v: 10 }, // passing, under the body
    { p: 0.45, v: 33 }, // drive back
    { p: 0.6, v: 19 }, // toe-off, knee folds
    { p: 0.75, v: -18 }, // swing through, knee high
    { p: 0.9, v: -34 }, // reach out
    { p: 1.0, v: -30 },
  ],
  shin: [
    { p: 0.0, v: 18 },
    { p: 0.15, v: 30 },
    { p: 0.3, v: 44 },
    { p: 0.45, v: 12 }, // extended behind
    { p: 0.6, v: 86 }, // heel snaps up toward the hip
    { p: 0.75, v: 94 },
    { p: 0.9, v: 42 },
    { p: 1.0, v: 18 },
  ],
  foot: [
    { p: 0.0, v: -8 }, // toes up on contact
    { p: 0.3, v: -14 },
    { p: 0.45, v: 26 }, // toes down through push-off
    { p: 0.6, v: -6 },
    { p: 0.9, v: -2 },
    { p: 1.0, v: -8 },
  ],
  /* Arms oppose the same-side leg: at contact the front leg is forward, so
     the front arm is back. They stay bent throughout, as in a real run. */
  arm: [
    { p: 0.0, v: 38 },
    { p: 0.25, v: 6 },
    { p: 0.5, v: -32 },
    { p: 0.75, v: -2 },
    { p: 1.0, v: 38 },
  ],
  forearm: [
    { p: 0.0, v: 68 },
    { p: 0.25, v: 84 },
    { p: 0.5, v: 58 },
    { p: 0.75, v: 78 },
    { p: 1.0, v: 68 },
  ],
  /* Two bounces per cycle — the body rises through each passing position. */
  bounce: [
    { p: 0.0, v: 0 },
    { p: 0.25, v: -11 },
    { p: 0.5, v: 0 },
    { p: 0.75, v: -11 },
    { p: 1.0, v: 0 },
  ],
  /* Counter-rotation of the shoulders against the hips. */
  torso: [
    { p: 0.0, v: 2 },
    { p: 0.5, v: -2 },
    { p: 1.0, v: 2 },
  ],
};

/* Shift a keyframe list half a cycle, so one leg leads the other. */
export const offsetPhase = (keys, shift = 0.5) => {
  const wrapped = keys
    .map(({ p, v }) => ({ p: (p + shift) % 1, v }))
    .sort((a, b) => a.p - b.p);

  // Re-close the loop so the cycle starts and ends on the same value.
  const first = wrapped[0];
  const last = wrapped[wrapped.length - 1];
  if (first.p > 0) wrapped.unshift({ p: 0, v: last.v });
  if (last.p < 1) wrapped.push({ p: 1, v: wrapped[0].v });
  return wrapped;
};

/* --------------------------------------------------------------------------
   NAMED POSES
   Static poses the timeline eases between outside the run. Each is a flat map
   of bone → rotation, so a pose can be applied with a single gsap.to().
   -------------------------------------------------------------------------- */
export const POSE = {
  /* Standing at ease, weight on the back leg. Enough stagger in the stance
     and separation in the arms that the silhouette still reads as a person
     rather than a column. */
  idle: {
    thighB: 12,
    shinB: 9,
    footB: -4,
    thighF: -11,
    shinF: 8,
    footF: -5,
    torso: -2,
    armB: 16,
    foreB: 24,
    armF: -14,
    foreF: 30,
    head: -2,
  },

  /* Spots the monopod: head lifts toward it, weight shifts forward. */
  notice: {
    thighB: 9,
    shinB: 10,
    footB: -4,
    thighF: -8,
    shinF: 4,
    footF: -5,
    torso: 5,
    armB: 15,
    foreB: 27,
    armF: -13,
    foreF: 31,
    head: 11,
  },

  /* Braking out of the run: front foot plants, torso rocks back. */
  arrive: {
    thighB: 15,
    shinB: 27,
    footB: 9,
    thighF: -21,
    shinF: 17,
    footF: -6,
    torso: -7,
    armB: 23,
    foreB: 35,
    armF: -19,
    foreF: 41,
    head: 4,
  },

  /* Reaching out for the monopod — front arm extended, body leaning in. */
  reach: {
    thighB: 19,
    shinB: 23,
    footB: 7,
    thighF: -17,
    shinF: 13,
    footF: -5,
    torso: 9,
    armB: 31,
    foreB: 21,
    armF: -96,
    foreF: 9,
    head: 8,
  },

  /* The logo pose: monopod planted, both arms up gripping the pole,
     front leg braced. This is the shot the whole sequence resolves to. */
  hero: {
    thighB: 27,
    shinB: 31,
    footB: 6,
    thighF: -26,
    shinF: 22,
    footF: -4,
    torso: 12,
    /* Both hands land on the pole: the front arm grips high, the back arm
       lower, matching the logo's two-handed hold. */
    armB: -140,
    foreB: 34,
    armF: -152,
    foreF: 28,
    head: 4,
  },
};

/* Bone ids, in the order they are laid out in the SVG. */
export const BONES = [
  "thighB",
  "shinB",
  "footB",
  "thighF",
  "shinF",
  "footF",
  "torso",
  "armB",
  "foreB",
  "armF",
  "foreF",
  "head",
];

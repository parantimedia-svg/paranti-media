/* ==========================================================================
   THE RIGGED AVATAR
   --------------------------------------------------------------------------
   NOT the logo. `parantii.png` is the logo and is used untouched in the nav
   and footer. This is a separate asset: the same photographer, redrawn in the
   same solid-ink silhouette style and proportions, but split into bones so it
   can actually move.

   Each bone is drawn from (0,0) along +y and wrapped in a <g> translated to
   its parent joint, so rotating a bone about "0px 0px" pivots it at the joint
   and children inherit the rotation. See ./rig.js for the chain.
   ========================================================================== */

import { BONE, WIDTH } from "./rig";

/* A limb segment: rounded caps centred exactly on the joints at each end. */
function Capsule({ len, w }) {
  return <rect x={-w / 2} y={-w / 2} width={w} height={len + w} rx={w / 2} />;
}

/* Bone wrapper. `data-bone` is how the timeline finds it.
   When a `pose` map is supplied the rotation is baked straight into the
   markup instead — that is what the reduced-motion still frame uses, so it
   needs no JavaScript at all to render correctly. */
function Bone({ name, children, className = "", pose }) {
  const rot = pose?.[name];
  return (
    <g
      data-bone={name}
      className={className}
      transform={rot ? `rotate(${rot})` : undefined}
    >
      {children}
    </g>
  );
}

/* One leg: thigh → shin → foot. */
function Leg({ side, className, pose }) {
  return (
    <Bone name={`thigh${side}`} className={className} pose={pose}>
      <Capsule len={BONE.thigh} w={WIDTH.thigh} />
      <g transform={`translate(0 ${BONE.thigh})`}>
        <Bone name={`shin${side}`} pose={pose}>
          <Capsule len={BONE.shin} w={WIDTH.shin} />
          <g transform={`translate(0 ${BONE.shin})`}>
            <Bone name={`foot${side}`} pose={pose}>
              {/* foot extends forward from the ankle */}
              <rect x={-9} y={-7} width={35} height={14} rx={7} />
            </Bone>
          </g>
        </Bone>
      </g>
    </Bone>
  );
}

/* One arm: upper → forearm → hand anchor. */
function Arm({ side, className, pose }) {
  return (
    <Bone name={`arm${side}`} className={className} pose={pose}>
      <Capsule len={BONE.arm} w={WIDTH.arm} />
      <g transform={`translate(0 ${BONE.arm})`}>
        <Bone name={`fore${side}`} pose={pose}>
          <Capsule len={BONE.forearm} w={WIDTH.forearm} />
          <g data-hand={side} transform={`translate(0 ${BONE.forearm})`} />
        </Bone>
      </g>
    </Bone>
  );
}

export default function Avatar({ id = "avatar", pose }) {
  const shoulderY = -BONE.torso;

  return (
    <g data-rig={id} className="rig">
      {/* world placement: translate to a point on the ground */}
      <g data-bone="root">
        {/* vertical bounce, driven by the run cycle */}
        <g data-bone="bounce">
          {/* hip joint — everything hangs off this */}
          <g transform={`translate(0 ${BONE.hipY})`}>
            {/* back limbs sit slightly lighter so the gait reads against
                the front ones — still ink, just softened on cream */}
            <Leg side="B" className="rig__back" pose={pose} />

            <Bone name="torso" pose={pose}>
              <path
                d={`M ${-WIDTH.torsoHip / 2} 0
                    C ${-WIDTH.torsoWaist / 2 - 2} -42 ${-WIDTH.torsoTop / 2} -70 ${-WIDTH.torsoTop / 2} ${shoulderY + 10}
                    Q ${-WIDTH.torsoTop / 2} ${shoulderY} ${-WIDTH.torsoTop / 2 + 10} ${shoulderY}
                    L ${WIDTH.torsoTop / 2 - 10} ${shoulderY}
                    Q ${WIDTH.torsoTop / 2} ${shoulderY} ${WIDTH.torsoTop / 2} ${shoulderY + 10}
                    C ${WIDTH.torsoTop / 2} -70 ${WIDTH.torsoWaist / 2 + 2} -42 ${WIDTH.torsoHip / 2} 0 Z`}
              />

              {/* shoulder joint */}
              <g transform={`translate(0 ${shoulderY})`}>
                <Arm side="B" className="rig__back" pose={pose} />

                <Bone name="head" pose={pose}>
                  <rect x={-9} y={-BONE.neck - 2} width={18} height={BONE.neck + 6} rx={7} />
                  <circle cx={0} cy={-BONE.neck - BONE.headR} r={BONE.headR} />
                </Bone>

                <Arm side="F" pose={pose} />
              </g>
            </Bone>

            <Leg side="F" pose={pose} />
          </g>
        </g>
      </g>
    </g>
  );
}

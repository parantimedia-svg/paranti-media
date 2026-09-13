/* ==========================================================================
   PARANTI STORY — SCRUBBED TIMELINE
   --------------------------------------------------------------------------
   One GSAP timeline, 100 units long, driven entirely by scroll progress.
   Nothing here is time-based: there is no autoplay, no repeat-forever, no
   event counting. Every value is a pure function of the master timeline's
   position, so a given scroll offset always renders exactly the same frame,
   forwards, backwards, or jumped to.

   The run cycle is the one place that needs care. It is authored as a small
   self-contained loop timeline which is left PAUSED and never added to the
   master; instead the master eases a proxy value 0→1 and seeks the loop to
   that progress. That gives a cycling gait whose speed can accelerate and
   decelerate, while staying perfectly reversible under scrub.
   ========================================================================== */

import { gsap } from "gsap";
import { POSE, RUN, offsetPhase } from "@/components/story/rig";
import { AV, MONSTER, POLE, STAGE } from "@/components/story/stage";

/* Story beats, as positions on the 100-unit master timeline. */
export const BEAT = {
  idle: 0,
  notice: 10,
  move: 20,
  run: 35,
  reveal: 50,
  approach: 65,
  settle: 72,
  arrive: 78,
  reach: 85,
  handoff: 92,
  hero: 97,
  end: 100,
};

const GROUND = STAGE.ground;

/* Camera: focus a world point at a given zoom. The stage is 1600×900 and
   #st-cam has its origin at 0,0, so this is just "centre this point". */
const camera = (scale, fx, fy) => ({
  scale,
  x: STAGE.w / 2 - fx * scale,
  y: STAGE.h / 2 - fy * scale,
});

/* Lay a keyframe list onto a timeline as a chain of eased tweens. The list
   spans 0→1, so the resulting timeline is exactly 1 unit long. */
function addKeys(tl, el, prop, keys) {
  if (!el) return;
  /* immediateRender:false is essential — a plain set() renders the instant the
     tween is created, which would stamp the run's frame-0 pose onto the rig
     while the avatar is still meant to be standing idle. The loop is only
     ever meant to render when it is explicitly seeked. */
  tl.set(el, { [prop]: keys[0].v, immediateRender: false }, 0);
  for (let i = 1; i < keys.length; i++) {
    const from = keys[i - 1];
    const to = keys[i];
    tl.to(
      el,
      { [prop]: to.v, duration: to.p - from.p, ease: "sine.inOut" },
      from.p
    );
  }
}

/* The bone values at the very start of the run cycle. The master eases the
   avatar into exactly these before handing over to the loop, so there is no
   snap at the moment the run begins. */
function runStartPose() {
  const first = (keys) => keys[0].v;
  const firstOffset = (keys) => offsetPhase(keys)[0].v;
  return {
    thighF: first(RUN.thigh),
    shinF: first(RUN.shin),
    footF: first(RUN.foot),
    armF: first(RUN.arm),
    foreF: first(RUN.forearm),
    thighB: firstOffset(RUN.thigh),
    shinB: firstOffset(RUN.shin),
    footB: firstOffset(RUN.foot),
    armB: firstOffset(RUN.arm),
    foreB: firstOffset(RUN.forearm),
    torso: first(RUN.torso),
    head: 6,
  };
}

/* --------------------------------------------------------------------------
   BUILD
   `root` is the pinned section element. Returns the master timeline (not yet
   attached to a ScrollTrigger — the caller wires that up).
   -------------------------------------------------------------------------- */
export function buildStoryTimeline({ root, mobile = false }) {
  const $ = (sel) => root.querySelector(sel);
  const bone = (name) => root.querySelector(`[data-bone="${name}"]`);
  const mon = (name) => root.querySelector(`[data-m="${name}"]`);

  const cam = $("#st-cam");
  const avatarRoot = bone("root");
  const bounce = bone("bounce");
  const monsterRoot = mon("root");
  const squash = mon("squash");
  const pole = $('[data-prop="monopod"]');
  const glint = $('[data-prop="glint"]');
  const flash = $('[data-prop="flash"]');
  const headline = $(".story__headline");

  /* Pivot an element about its own local (0,0) — its joint.

     This needs care: for SVG, GSAP measures transformOrigin from the element's
     BOUNDING BOX, not its user-space origin, so a naive "0px 0px" pivots from
     the top-left corner of the artwork and every joint ends up offset by half
     a limb width. Offsetting by the negated bbox position puts the pivot back
     exactly on the joint, whatever shape the bone is. */
  const pivotAtOrigin = (el) => {
    if (!el) return;
    const bb = el.getBBox();
    gsap.set(el, { transformOrigin: `${-bb.x}px ${-bb.y}px` });
  };

  const boneNames = [
    "thighB", "shinB", "footB", "thighF", "shinF", "footF",
    "torso", "armB", "foreB", "armF", "foreF", "head",
  ];
  boneNames.forEach((n) => pivotAtOrigin(bone(n)));
  [cam, avatarRoot, bounce, monsterRoot, squash, pole,
   mon("armHold"), mon("armWave")].forEach(pivotAtOrigin);

  /* Shot list. Phones sit tighter because the stage is fitted to width. */
  const SHOT = mobile
    ? {
        wide: camera(1.46, 400, 520),
        notice: camera(1.5, 420, 520),
        track: camera(1.5, 720, 520),
        reveal: camera(1.3, 1040, 505),
        approach: camera(1.52, 1130, 530),
        medium: camera(1.9, 1120, 505),
        close: camera(2.1, 1090, 490),
        hero: camera(1.34, 1045, 520),
      }
    : {
        wide: camera(1.0, 760, 470),
        notice: camera(1.04, 720, 470),
        track: camera(1.06, 900, 470),
        reveal: camera(1.1, 1010, 470),
        approach: camera(1.42, 1120, 500),
        medium: camera(1.85, 1105, 486),
        close: camera(2.0, 1080, 470),
        hero: camera(1.16, 1030, 500),
      };

  /* Apply a whole pose in one tween. */
  const poseTargets = (pose) =>
    Object.entries(pose)
      .map(([name, v]) => ({ el: bone(name), v }))
      .filter((t) => t.el);

  const setPose = (tl, pose, at, duration, ease = "power2.inOut") => {
    poseTargets(pose).forEach(({ el, v }) => {
      tl.to(el, { rotation: v, duration, ease }, at);
    });
  };

  /* ---------------------------------------------------------------- setup */
  gsap.set(avatarRoot, { x: AV.startX, y: GROUND, scale: AV.scale });
  gsap.set(bounce, { y: 0 });
  gsap.set(monsterRoot, { x: MONSTER.x, y: GROUND, scale: MONSTER.scale });
  gsap.set(squash, { scaleY: 0.06, scaleX: 1.22, opacity: 0 });
  gsap.set(pole, {
    x: POLE.distant.x,
    y: POLE.distant.y,
    rotation: POLE.distant.rot,
    scale: POLE.scale,
  });
  gsap.set(cam, SHOT.wide);
  poseTargets(POSE.idle).forEach(({ el, v }) => gsap.set(el, { rotation: v }));
  if (headline) gsap.set(headline, { opacity: 0, y: 40 });
  if (flash) gsap.set(flash, { opacity: 0, scale: 0.2 });

  /* ------------------------------------------------------- the run cycle */
  const cycle = gsap.timeline({ paused: true });
  addKeys(cycle, bone("thighF"), "rotation", RUN.thigh);
  addKeys(cycle, bone("shinF"), "rotation", RUN.shin);
  addKeys(cycle, bone("footF"), "rotation", RUN.foot);
  addKeys(cycle, bone("armF"), "rotation", RUN.arm);
  addKeys(cycle, bone("foreF"), "rotation", RUN.forearm);
  addKeys(cycle, bone("thighB"), "rotation", offsetPhase(RUN.thigh));
  addKeys(cycle, bone("shinB"), "rotation", offsetPhase(RUN.shin));
  addKeys(cycle, bone("footB"), "rotation", offsetPhase(RUN.foot));
  addKeys(cycle, bone("armB"), "rotation", offsetPhase(RUN.arm));
  addKeys(cycle, bone("foreB"), "rotation", offsetPhase(RUN.forearm));
  addKeys(cycle, bone("torso"), "rotation", RUN.torso);
  addKeys(cycle, bounce, "y", RUN.bounce);
  cycle.repeat(mobile ? 4 : 7);

  /* The proxy the master eases. Seeking a paused timeline is deterministic
     in both directions, which is what keeps the gait reversible.

     totalProgress, NOT progress: on a repeating timeline `progress()` is the
     position within the *current iteration*, so using it would collapse every
     repeat into a single stride. */
  const gait = { t: 0 };
  const driveGait = () => cycle.totalProgress(gait.t);

  /* --------------------------------------------------------- the master */
  const tl = gsap.timeline({ defaults: { ease: "none" } });

  /* 0.00 → 0.10  IDLE — a wide, quiet frame. */
  tl.to(cam, { ...SHOT.notice, duration: BEAT.notice }, BEAT.idle);

  /* 0.10  NOTICE — the head comes up, the weight shifts forward. */
  setPose(tl, POSE.notice, BEAT.notice, 6, "power2.out");

  /* 0.20 → 0.72  MOVE + RUN.
     A single ease across the whole run would leave the legs almost static at
     both ends. Instead the run is three explicit phases — accelerate, cruise,
     decelerate — and the gait phase and the avatar's ground position share
     the exact same profile, so the feet never slide against the world. */
  setPose(tl, runStartPose(), BEAT.notice + 6, 4, "power1.inOut");

  const RUN_PHASES = [
    { at: BEAT.move, dur: 12, u: 0.18, ease: "power2.in" }, // push off
    { at: BEAT.move + 12, dur: 30, u: 0.82, ease: "none" }, // steady pace
    { at: BEAT.move + 42, dur: 10, u: 1, ease: "power2.out" }, // pull up
  ];

  RUN_PHASES.forEach(({ at, dur, u, ease }) => {
    tl.to(gait, { t: u, duration: dur, ease, onUpdate: driveGait }, at);
    tl.to(
      avatarRoot,
      { x: AV.startX + (AV.endX - AV.startX) * u, duration: dur, ease },
      at
    );
  });

  /* Forward lean while accelerating, upright again as it settles. */
  tl.to(avatarRoot, { rotation: 5, duration: 14, ease: "power2.out" }, BEAT.move)
    .to(avatarRoot, { rotation: 0, duration: 12, ease: "power2.inOut" }, BEAT.approach);

  /* Camera: track, then push in on the monster and the handoff.
     Phones get their own framing — the stage is letterboxed to fit width, so
     the same scale would leave the character too small to read. */
  tl.to(cam, { ...SHOT.track, duration: BEAT.reveal - BEAT.move }, BEAT.move)
    .to(cam, { ...SHOT.reveal, duration: BEAT.approach - BEAT.reveal }, BEAT.reveal)
    .to(cam, { ...SHOT.approach, duration: BEAT.arrive - BEAT.approach }, BEAT.approach)
    .to(cam, { ...SHOT.medium, duration: BEAT.reach - BEAT.arrive }, BEAT.arrive)
    .to(cam, { ...SHOT.close, duration: BEAT.handoff - BEAT.reach }, BEAT.reach)
    .to(cam, { ...SHOT.hero, duration: BEAT.hero - BEAT.handoff }, BEAT.handoff);

  /* Parallax — each layer drifts at its own rate against the camera. */
  const drift = BEAT.hero - BEAT.move;
  tl.to($("#st-bg"), { x: -70, duration: drift }, BEAT.move)
    .to($("#st-mid"), { x: -230, duration: drift }, BEAT.move);
  if (!mobile) {
    tl.to($("#st-fg"), { x: -640, duration: drift }, BEAT.move);
  }

  /* 0.50  MONSTER REVEAL — rises with a squash, blinks, looks over. */
  tl.to(squash, { opacity: 1, duration: 2 }, BEAT.reveal - 3)
    .to(squash, { scaleY: 1.08, scaleX: 0.95, duration: 5, ease: "back.out(1.9)" }, BEAT.reveal - 3)
    .to(squash, { scaleY: 1, scaleX: 1, duration: 4, ease: "power2.out" }, BEAT.reveal + 2)
    .to(mon("eyes"), { scaleY: 0.12, duration: 0.8, transformOrigin: "50% 50%" }, BEAT.reveal + 7)
    .to(mon("eyes"), { scaleY: 1, duration: 1.2 }, BEAT.reveal + 7.8)
    .to([mon("pupilL"), mon("pupilR")], { x: -12, duration: 4, ease: "power2.out" }, BEAT.approach);

  /* …and scoops up the monopod as it rises. */
  tl.to(pole, {
    x: POLE.held.x,
    y: POLE.held.y,
    rotation: POLE.held.rot,
    duration: 9,
    ease: "power2.inOut",
  }, BEAT.reveal - 1);

  /* 0.72 → 0.85  ARRIVE then REACH. */
  setPose(tl, POSE.arrive, BEAT.settle, 6, "power3.out");
  setPose(tl, POSE.reach, BEAT.arrive, 7, "power2.inOut");

  /* The monster offers the monopod forward. */
  tl.to(mon("armHold"), { rotation: -22, duration: 7 }, BEAT.arrive)
    .to(pole, { x: POLE.held.x - 30, y: POLE.held.y + 14, rotation: -6, duration: 7 }, BEAT.arrive);

  /* 0.85 → 0.92  HANDOFF — the accent moment. */
  tl.to(pole, {
    x: POLE.planted.x,
    y: POLE.planted.y,
    rotation: POLE.planted.rot,
    duration: BEAT.handoff - BEAT.reach,
    ease: "power2.inOut",
  }, BEAT.reach);

  tl.to(mon("armHold"), { rotation: 18, duration: 6, ease: "power2.out" }, BEAT.reach + 1);

  if (flash) {
    tl.set(flash, { x: POLE.planted.x, y: POLE.planted.y - 150 }, BEAT.reach)
      .to(flash, { opacity: 0.9, scale: 0.7, duration: 2, ease: "power2.out" }, BEAT.reach + 2)
      .to(flash, { opacity: 0, scale: 2.1, duration: 4, ease: "power2.out" }, BEAT.reach + 4);
  }
  if (glint) {
    tl.to(glint, { opacity: 1, duration: 2 }, BEAT.handoff - 2)
      .to(glint, { opacity: 0, duration: 4 }, BEAT.hero);
  }

  /* 0.92 → 0.97  HERO — the logo pose. */
  setPose(tl, POSE.hero, BEAT.handoff, 5, "power3.out");
  tl.to(monsterRoot, { x: MONSTER.x + 90, duration: 8, ease: "power2.inOut" }, BEAT.handoff)
    .to(mon("armWave"), { rotation: -34, duration: 1.5, yoyo: true, repeat: 3 }, BEAT.handoff + 1);

  /* 0.97 → 1.00  RESOLVE into the headline. */
  if (headline) {
    tl.to(headline, { opacity: 1, y: 0, duration: BEAT.end - BEAT.hero, ease: "power2.out" }, BEAT.hero);
  }
  tl.to("#st-stage", { opacity: 0.16, duration: BEAT.end - BEAT.hero }, BEAT.hero);

  /* Make sure the master really is 100 units, so BEAT values read as
     percentages of scroll through the pinned section. */
  tl.set({}, {}, BEAT.end);

  return { tl, cycle };
}

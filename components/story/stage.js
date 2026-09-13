/* ==========================================================================
   STAGE MARKS
   --------------------------------------------------------------------------
   Where things stand on the 1600×900 stage. Pure data with no imports, so the
   scene, the still frame and the timeline can all share one source of truth
   without any of them importing each other.
   ========================================================================== */

export const STAGE = { w: 1600, h: 900, ground: 700 };

export const AV = { startX: 250, endX: 1010, scale: 0.9 };

export const MONSTER = { x: 1245, scale: 1.12 };

export const POLE = {
  /* Taller than the avatar, as in the logo, so the camera clears the head
     instead of crowding it. Lengthening the pole does not move the grip
     point — the tip stays planted and it simply extends upward. */
  scale: 1.5,

  /* Standing in the distance at the start — this is what the avatar spots.
     The monster picks it up on the reveal, then hands it over. */
  distant: { x: 1218, y: STAGE.ground, rot: 4 },

  /* Out beyond the monster's left edge, so the holding arm actually reads. */
  held: { x: 1080, y: 548, rot: -16 },

  /* Far enough from the body to read as the logo's silhouette, but still
     within the avatar's arm reach (shoulder ≈ x1029, arm ≈ 92 units). */
  planted: { x: 1071, y: STAGE.ground, rot: 7 },
};

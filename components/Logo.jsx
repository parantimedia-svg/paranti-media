"use client";

import Image from "next/image";

/* ==========================================================================
   THE REAL LOGO — used exactly as supplied.
   --------------------------------------------------------------------------
   Never redrawn, morphed, distorted, recoloured or regenerated. Two files, as
   the brand supplies them, and the only choice made here is which one the
   background calls for:

     paranti-logo.png        ink figure, orange A's — for the cream bar
     paranti-logo-light.png  the white mark          — for ink: the footer,
                             the open mobile menu, the sign-off card

   Both have a real transparent background, so there is no compositing trick
   left in the page. The previous file carried a baked-in cream square, which
   had to be hidden with `mix-blend-mode: darken` on cream and covered with a
   cream plate on ink; both of those are gone, and so is the 1.2MB that file
   weighed — these are 140KB and 164KB.
   ========================================================================== */

const FILES = {
  ink: "/media/logo/paranti-logo.png",
  cream: "/media/logo/paranti-logo-light.png",
};

export default function Logo({
  size = 72,
  className = "",
  priority = false,
  /* Which mark to use: "ink" reads on a light background, "cream" on a dark
     one. Named for the artwork, not the backdrop, so the call site says what
     it wants to see rather than what it is sitting on. */
  variant = "ink",
}) {
  return (
    <span className={`logo-plate ${className}`} style={{ width: size, height: size }}>
      {/* Always requested at one fixed resolution and scaled down by CSS, so
          shrinking the nav on scroll costs no extra network request and the
          preload always matches what the browser actually uses. */}
      <Image
        src={FILES[variant] || FILES.ink}
        alt="PARANTI MEDIA"
        width={200}
        height={200}
        priority={priority}
        quality={90}
      />
    </span>
  );
}

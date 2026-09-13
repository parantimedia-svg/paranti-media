"use client";

import Image from "next/image";

/* ==========================================================================
   THE REAL LOGO — parantii.png, used exactly as supplied.
   --------------------------------------------------------------------------
   Never redrawn, morphed, distorted, recoloured or regenerated. The only
   treatment applied is a compositing one: the file ships with a warm-cream
   background (#FEF1D7), which would otherwise show as a pale square.

   `mix-blend-mode: darken` takes the per-channel minimum against whatever is
   behind, so on any cream backdrop the logo's own background resolves to the
   backdrop exactly, while the ink figure and the orange "A"s — both darker
   than cream in every channel — pass through untouched.

   On ink backgrounds (the footer, the open mobile menu) darken would swallow
   the mark, so `tile` puts it on a brand-cream plate first and it reads as a
   deliberate stamp. Either way the image file itself is untouched.
   ========================================================================== */

export default function Logo({
  size = 72,
  className = "",
  priority = false,
  tile = false,
}) {
  return (
    <span
      className={`logo-plate ${tile ? "logo-plate--tile" : ""} ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Always requested at one fixed resolution and scaled down by CSS, so
          shrinking the nav on scroll costs no extra network request and the
          preload always matches what the browser actually uses. One cached
          file serves the nav, the footer and the mobile menu. */}
      <Image
        src="/parantii.png"
        alt="PARANTI MEDIA"
        width={200}
        height={200}
        priority={priority}
        quality={90}
      />
    </span>
  );
}

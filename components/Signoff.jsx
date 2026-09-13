"use client";

import { useEffect, useState } from "react";
import Logo from "./Logo";
import { usePrefersReducedMotion } from "@/lib/motion";

/* ==========================================================================
   THE SIGN-OFF — what happens when the enquiry lands
   --------------------------------------------------------------------------
   The take is over, so the camera stops:

     the recording light goes out   (the section's [data-sent] does this)
     a short cinematic blackout     (~300ms)
     PARANTI MEDIA · CREATE. CAPTURE. INSPIRE.
     the frame comes back

   The existing logo file is used exactly as it is everywhere else — this
   composes <Logo>, it does not draw anything new.

   It is `pointer-events: none` for its whole life and aria-hidden throughout.
   The form's own status message is what actually announces the result; this
   is atmosphere over the top of it and must never sit between the visitor and
   the page. It also unmounts itself, so nothing is left covering the section.
   ========================================================================== */

/* Reduced motion gets the card without the blackout, and for less time. */
const FULL_MS = 4200;
const REDUCED_MS = 2200;

export default function Signoff({ active, onDone }) {
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!active) return;
    setShown(true);
    const t = window.setTimeout(
      () => {
        setShown(false);
        onDone?.();
      },
      reduced ? REDUCED_MS : FULL_MS
    );
    return () => window.clearTimeout(t);
  }, [active, reduced, onDone]);

  if (!shown) return null;

  return (
    <div
      className="signoff"
      data-still={reduced ? "true" : "false"}
      aria-hidden="true"
    >
      <div className="signoff__card">
        <Logo size={104} className="signoff__logo" tile />
        <p className="signoff__name">PARANTI MEDIA</p>
        <p className="signoff__tag mono">CREATE. CAPTURE. INSPIRE.</p>
      </div>
    </div>
  );
}

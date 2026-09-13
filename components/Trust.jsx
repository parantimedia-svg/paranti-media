"use client";

import Image from "next/image";
import { CLIENTS } from "@/data/projects";

/* Client logos.

   The testimonials block that used to sit under the marquee has been removed.
   `TESTIMONIALS` still exists in data/projects.js and the .trust__quotes
   styles are still in the stylesheet, so the block can be brought back by
   restoring this component's markup — nothing else was deleted. */
export default function Trust() {
  /* Two identical tracks sit side by side and both slide -100% of their own
     width, so the loop closes with no gap and no jump. */
  const track = (dup) =>
    CLIENTS.map((c) => (
      <div className="trust__logo" key={`${c.id}-${dup}`}>
        {c.src ? (
          <Image
            src={c.src}
            alt={dup ? "" : c.name || "Client logo"}
            /* The file's real size, so the box has the logo's true shape
               before the image arrives — see CLIENTS in data/projects.js. */
            width={c.w}
            height={c.h}
          />
        ) : (
          <span className="trust__slot mono">
            {c.name || `CLIENT ${c.id.slice(-2)}`}
          </span>
        )}
      </div>
    ));

  return (
    <section className="section trust" id="clients">
      <div className="inner">
        <p className="label reveal">TRUSTED BY BRANDS</p>
      </div>

      <div className="trust__marquee marquee" aria-label="Client logos">
        <div className="marquee__track">{track(0)}</div>
        <div className="marquee__track" aria-hidden="true">
          {track(1)}
        </div>
      </div>
    </section>
  );
}

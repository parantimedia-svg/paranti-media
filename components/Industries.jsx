"use client";

import { INDUSTRIES } from "@/data/content";
import Filmmaker from "./Filmmaker";

/* Sector marquee. Only the industries Paranti Media genuinely works in. */
export default function Industries() {
  const row = (
    <>
      {INDUSTRIES.map((n) => (
        <span className="industries__item" key={n}>
          {n}
          <em className="accent" aria-hidden="true">
            ●
          </em>
        </span>
      ))}
    </>
  );

  return (
    <section className="industries" aria-labelledby="industries-title">
      {/* Cameo: a silhouette on the far horizon. Decorative. */}
      <Filmmaker spot="far" />
      <div className="inner industries__head">
        <h2 className="label" id="industries-title">
          WE CREATE FOR:
        </h2>
      </div>

      <div className="marquee industries__marquee">
        <div className="marquee__track">{row}</div>
        <div className="marquee__track" aria-hidden="true">
          {row}
        </div>
      </div>
    </section>
  );
}

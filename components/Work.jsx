"use client";

import { useCallback, useState } from "react";
import MediaFrame from "./MediaFrame";
import CaseStudy from "./CaseStudy";
import VideoModal from "./VideoModal";
import { getFeaturedProjects } from "@/data/projects";
import { youTubeId } from "@/lib/youtube";
import Filmmaker from "./Filmmaker";

/* Frame per card size. `film` and `short` are the real YouTube work and hold
   the videos' own aspect ratios — nothing is cropped to fit a card. The other
   three remain for placeholder slots. */
const RATIO = {
  film: "16 / 9",
  short: "9 / 16",
  tall: "3 / 4",
  wide: "16 / 9",
  full: "21 / 9",
};

/* Shown in the card's metadata line, so the format is legible at a glance. */
const FORMAT = { film: "16:9", short: "9:16" };

export default function Work() {
  const projects = getFeaturedProjects();

  const [openId, setOpenId] = useState(null);
  /* The project the modal is showing. Held apart from `openId` because the
     video modal fades out after it is closed — without this it would lose
     its project mid-fade and flash back to an empty 16:9 frame. */
  const [shownId, setShownId] = useState(null);
  const shown = projects.find((p) => p.id === shownId) || null;

  /* Stable, so the modal's scroll-lock effect doesn't tear down and rebuild
     on every render while it is open. */
  const close = useCallback(() => setOpenId(null), []);

  /* When every project is real YouTube work, the grid switches to the reel
     layout — the film on its own row, the Shorts side by side. */
  const reel = projects.length > 0 && projects.every((p) => p.youtube);

  return (
    <section className="section work" id="work">
      {/* Cameo: standing beside a light. Decorative, behind the content. */}
      <Filmmaker spot="light" />
      <div className="inner">
        <header className="work__head">
          <div>
            <p className="label reveal">SELECTED WORK</p>
            <h2 className="h-section reveal">THE WORK</h2>
          </div>
          <p className="lead reveal" data-reveal-delay="80">
            A selection of films, campaigns and stills. Every frame is made
            in-house — from the first treatment to the final grade.
          </p>
        </header>

        <ul className={`work__grid ${reel ? "work__grid--reel" : ""}`}>
          {projects.map((p, i) => (
            <li
              key={p.id}
              className={`work__item work__item--${p.size} reveal`}
              data-reveal-delay={Math.min(i * 70, 350)}
            >
              <button
                type="button"
                className="work__card"
                onClick={() => {
                  setShownId(p.id);
                  setOpenId(p.id);
                }}
                data-cursor={p.youtube ? "PLAY" : "VIEW"}
                aria-label={
                  p.youtube
                    ? `Play ${p.name} — ${p.category}`
                    : `Open case study: ${p.name}`
                }
              >
                <MediaFrame
                  src={p.thumbnail}
                  poster={p.poster}
                  label={p.placeholder ? "PROJECT MEDIA" : p.name}
                  hint={p.placeholder ? `SLOT ${p.id.slice(-2)}` : null}
                  alt={p.category ? `${p.name} — ${p.category}` : p.name}
                  ratio={RATIO[p.size] || "4 / 3"}
                  sizes={
                    p.size === "film"
                      ? "(max-width: 860px) 100vw, 90vw"
                      : "(max-width: 860px) 50vw, (max-width: 1100px) 33vw, 20vw"
                  }
                  zoom
                />

                <span className="work__index mono">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {p.youtube && <span className="work__play" aria-hidden="true" />}

                <span className="work__reveal">
                  <span className="work__name">{p.name}</span>
                  <span className="work__cat mono">
                    {[p.client, p.category, p.year, FORMAT[p.size]]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <p className="work__note mono reveal">
          MORE WORK ADDED CONTINUOUSLY — <a href="#contact">ASK FOR THE FULL PORTFOLIO</a>
        </p>
      </div>

      {/* Projects without a YouTube link keep the existing case-study panel. */}
      <CaseStudy
        project={openId && shown && !shown.youtube ? shown : null}
        onClose={close}
      />

      <VideoModal
        open={openId !== null && Boolean(shown?.youtube)}
        onClose={close}
        youtubeId={shown?.youtube ? youTubeId(shown.youtube) : null}
        label={shown ? `${shown.name} — ${shown.category}` : "Video"}
        vertical={shown?.size === "short"}
      />
    </section>
  );
}

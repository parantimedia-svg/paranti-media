"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import MediaFrame from "./MediaFrame";
import VideoModal from "./VideoModal";
import { APPROACH, FOUNDERS } from "@/data/content";
import { youTubeId } from "@/lib/youtube";

/* The studio film — a YouTube Short whose own title is "WE CRAFT THE STORY.",
   the same line this section closes its heading on. Nothing is downloaded:
   the frame shows YouTube's native 9:16 thumbnail (oardefault — hqdefault
   would be a letterboxed 4:3), and the film itself plays in the site's video
   lightbox, the same one the Work section's Shorts open in. */
const STUDIO_FILM = {
  youtube: "https://youtube.com/shorts/YmNFRF5F9aY",
  thumbnail: "https://i.ytimg.com/vi/YmNFRF5F9aY/oardefault.jpg",
};

export default function About() {
  const [open, setOpen] = useState(false);
  /* Stable, so the lightbox's scroll lock isn't torn down and rebuilt on
     every render while the film is playing. */
  const close = useCallback(() => setOpen(false), []);

  return (
    <section className="section about" id="about">
      <div className="inner">
        <div className="about__top">
          <p className="label reveal">THE STUDIO</p>
          <h2 className="h-section about__title">
            <span className="line-mask reveal">
              <span>WE DON&apos;T JUST COVER</span>
            </span>
            <span className="line-mask reveal" data-reveal-delay="90">
              <span>THE MOMENT.</span>
            </span>
            <span className="line-mask reveal" data-reveal-delay="180">
              <span>
                WE CRAFT THE <em className="accent">STORY.</em>
              </span>
            </span>
          </h2>
        </div>

        <div className="about__body">
          <div className="about__media about__media--film reveal">
            <button
              type="button"
              className="about__film"
              onClick={() => setOpen(true)}
              data-cursor="PLAY"
              aria-label="Play the Paranti Media studio film — We craft the story"
            >
              <MediaFrame
                src={STUDIO_FILM.thumbnail}
                label="STUDIO / ON SET"
                alt="Paranti Media on set — We craft the story"
                ratio="9 / 16"
                sizes="(max-width: 900px) 90vw, 400px"
                zoom
              />
              <span className="about__filmplay" aria-hidden="true" />
            </button>
            {/* The section's original label, kept as the frame's caption. */}
            <p className="about__filmmeta mono">
              <span>STUDIO / ON SET</span>
              <span>9:16</span>
            </p>
          </div>

          <div className="about__text">
            <p className="lead reveal">
              Paranti Media transforms ideas, products and brands into cinematic
              visual experiences.
            </p>
            <p className="about__p reveal" data-reveal-delay="70">
              We work as one team across direction, production and post — so the
              idea that gets approved is the idea that reaches the screen. Every
              project is built around a story worth telling and finished to a
              standard worth showing.
            </p>

            <div className="about__approach reveal" data-reveal-delay="140">
              <p className="mono about__approachlabel">OUR APPROACH</p>
              <ol className="about__steps">
                {APPROACH.map((a) => (
                  <li key={a.num}>
                    <span className="mono">{a.num}</span>
                    <span className="about__step">{a.title}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        <div className="about__people">
          <p className="label reveal">THE PEOPLE BEHIND PARANTI</p>
          <ul className="about__founders">
            {FOUNDERS.map((f, i) => (
              <li
                key={f.name}
                className="reveal"
                data-reveal-delay={i * 90}
              >
                {/* The photograph appears on its own once the file exists —
                    until then the card is name, title and role, which reads as
                    finished rather than as a missing image. */}
                {f.photo && (
                  <span className="about__portrait">
                    {/* Through the image optimiser: the source PNGs are
                        0.7–1.6MB, served as a card-sized AVIF/WebP instead.
                        The stylesheet sizes the frame; width/height only
                        give the optimiser a shape to work from. */}
                    <Image
                      src={f.photo}
                      alt={f.name}
                      width={600}
                      height={800}
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />
                  </span>
                )}
                <span className="about__founder">{f.name}</span>
                {f.role && <span className="about__role mono">{f.role}</span>}
                {f.bio && <span className="about__bio">{f.bio}</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <VideoModal
        open={open}
        onClose={close}
        youtubeId={youTubeId(STUDIO_FILM.youtube)}
        label="Paranti Media — We craft the story"
        vertical
      />
    </section>
  );
}

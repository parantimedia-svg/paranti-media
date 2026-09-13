"use client";

import { useState } from "react";
import MediaFrame from "./MediaFrame";
import VideoModal from "./VideoModal";
import { SHOWREEL } from "@/data/projects";
import { youTubeId } from "@/lib/youtube";

export default function Showreel() {
  const [open, setOpen] = useState(false);

  /* Resolved once, here, so both the button label and the modal agree on
     whether there is a film to play at all. */
  const yt = youTubeId(SHOWREEL.youtube);

  return (
    <section className="section on-ink showreel" id="showreel">
      <div className="inner">
        <p className="label reveal">SHOWREEL</p>

        {/* The story section immediately above resolves on "WE DON'T JUST
            CREATE CONTENT. WE CREATE EXPERIENCES.", so this heading picks up
            from there instead of repeating it. */}
        <h2 className="h-section showreel__title">
          <span className="line-mask reveal">
            <span>SEE IT</span>
          </span>
          <span className="line-mask reveal" data-reveal-delay="90">
            <span>
              IN <em className="accent">MOTION.</em>
            </span>
          </span>
        </h2>

        <button
          type="button"
          className="showreel__stage reveal"
          onClick={() => setOpen(true)}
          data-cursor="PLAY"
          aria-label="Play the Paranti Media showreel"
        >
          {/* 16:9, matching the master exactly. The reel carries burned-in
              subtitles along the bottom of the frame, so the 2.39:1 letterbox
              this stage used to run would have cropped them straight off. */}
          <MediaFrame
            video={SHOWREEL.horizontal.src}
            poster={SHOWREEL.horizontal.poster}
            label={SHOWREEL.horizontal.label}
            hint="ADD /media/showreel-preview.mp4"
            alt="Paranti Media showreel"
            ratio="16 / 9"
            sizes="100vw"
            zoom
          />
          <span className="showreel__play" aria-hidden="true">
            <span className="showreel__playicon" />
            <span className="mono">PLAY REEL</span>
          </span>
        </button>

        <div className="showreel__meta mono reveal">
          <span>01 / SHOWREEL</span>
          <span>CINEMATIC · 2:49</span>
          <span>PARANTI MEDIA</span>
        </div>
      </div>

      {/* The modal plays the full film from YouTube. Nothing self-hosted is
          passed as a fallback: `horizontal.src` is the 14-second silent
          preview, and quietly serving that as "the showreel" would be worse
          than the coming-soon notice. */}
      <VideoModal
        open={open}
        onClose={() => setOpen(false)}
        youtubeId={yt}
        poster={SHOWREEL.horizontal.poster}
        label="Paranti Media showreel"
      />
    </section>
  );
}

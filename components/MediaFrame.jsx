"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { IS_DEV } from "@/lib/env";
import { usePrefersReducedMotion } from "@/lib/motion";

/* ==========================================================================
   MEDIA FRAME
   One component for every image/video slot on the site. When the real asset
   hasn't been supplied yet it renders a clean, clearly-labelled placeholder
   instead of a broken file — so the build is never blocked waiting on media.

   Pass `src` (image) or `video` and the placeholder disappears automatically.
   ========================================================================== */

/* Videos live in their own component so the hooks below never run for the
   image and placeholder branches. */
function FrameVideo({
  video,
  videoMobile,
  mobileMaxWidth,
  poster,
  alt,
  label,
  fit,
  position,
}) {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const reduced = usePrefersReducedMotion();

  /* Which cut to fetch. Deliberately null until the client has measured:
     `media` on a <source> inside <video> is not honoured the way it is inside
     <picture>, and it never re-evaluates on resize, so the only way to
     guarantee exactly one file is downloaded is to decide here and render a
     single element. The frame already reserves its space via aspect-ratio, so
     waiting one tick costs no layout shift. */
  const [src, setSrc] = useState(null);

  useEffect(() => {
    if (!videoMobile) {
      setSrc(video);
      return;
    }

    const mq = window.matchMedia(`(max-width: ${mobileMaxWidth}px)`);
    const pick = () => {
      const next = mq.matches ? videoMobile : video;
      setSrc((prev) => {
        if (prev !== next) {
          setReady(false);
          setFailed(false);
        }
        return next;
      });
    };

    pick();
    mq.addEventListener("change", pick);
    return () => mq.removeEventListener("change", pick);
  }, [video, videoMobile, mobileMaxWidth]);

  useEffect(() => {
    const el = ref.current;
    if (!el || failed || !src) return;

    /* A cached file can reach HAVE_CURRENT_DATA before React attaches
       onLoadedData, and the missed event would leave the frame faded out at
       opacity 0 forever. Catch up to whatever already happened. */
    if (el.readyState >= 2) setReady(true);

    /* Reduced motion: hold a still frame rather than loop. Nudging currentTime
       makes the browser paint an actual frame, so the slot still shows the
       film even with no poster supplied. */
    if (reduced) {
      el.pause();
      const paintStill = () => {
        try {
          el.currentTime = 0.05;
        } catch {
          /* seeking unsupported before data arrives — the poster covers it */
        }
      };
      if (el.readyState >= 1) paintStill();
      else el.addEventListener("loadedmetadata", paintStill, { once: true });
      return;
    }

    /* Play only while on screen. autoPlay alone would keep a decoder running
       for a hero that scrolled away ten sections ago. */
    let onScreen = true;

    const tryPlay = () => {
      if (onScreen) el.play().catch(() => {});
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) {
          tryPlay();
        } else if (entry.boundingClientRect.height > 0) {
          /* Height guard: the very first observation can land before the frame
             has been laid out, and pausing then would cancel the browser's own
             pending autoplay and strand the hero on a still. Only pause a
             frame that genuinely scrolled away. */
          el.pause();
        }
      },
      { threshold: 0.05 }
    );
    io.observe(el);

    /* A play() attempted before the file had data rejects silently, so retry
       once there is something to show. */
    el.addEventListener("loadeddata", tryPlay);
    el.addEventListener("canplay", tryPlay);

    return () => {
      io.disconnect();
      el.removeEventListener("loadeddata", tryPlay);
      el.removeEventListener("canplay", tryPlay);
    };
  }, [reduced, failed, src]);

  /* A missing or unplayable file falls back to the labelled placeholder
     instead of a broken video element. */
  if (failed) {
    return (
      <div className="ph">
        <span className="ph__brackets" aria-hidden="true" />
        <div className="ph__inner">
          <span className="ph__label">{label}</span>
        </div>
      </div>
    );
  }

  /* Nothing chosen yet — the frame's ink ground holds the space. */
  if (!src) return null;

  return (
    <video
      /* Remount on a breakpoint crossing so the new cut loads and plays from
         its own first frame rather than inheriting the old one's position. */
      key={src}
      ref={ref}
      className="media__video"
      src={src}
      poster={poster || undefined}
      muted
      loop
      playsInline
      autoPlay={!reduced}
      preload="metadata"
      aria-label={alt || label}
      data-ready={ready ? "true" : "false"}
      onLoadedData={() => setReady(true)}
      onError={() => setFailed(true)}
      style={{ objectFit: fit, objectPosition: position }}
    />
  );
}

export default function MediaFrame({
  src = null,
  video = null,
  videoMobile = null,
  mobileMaxWidth = 768,
  poster = null,
  alt = "",
  label = "MEDIA",
  hint = null,
  ratio = "16 / 9",
  sizes = "100vw",
  priority = false,
  className = "",
  zoom = false,
  fit = "cover",
  position = "center",
}) {
  /* Exposed as a custom property rather than a hard aspect-ratio so media
     queries can re-crop a frame for small screens without !important. */
  const style = { "--ratio": ratio };

  if (video) {
    return (
      <div
        className={`media ${zoom ? "media--zoom" : ""} ${className}`}
        style={style}
      >
        <FrameVideo
          video={video}
          videoMobile={videoMobile}
          mobileMaxWidth={mobileMaxWidth}
          poster={poster}
          alt={alt}
          label={label}
          fit={fit}
          position={position}
        />
      </div>
    );
  }

  if (src) {
    return (
      <div
        className={`media ${zoom ? "media--zoom" : ""} ${className}`}
        style={style}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          style={{ objectFit: fit, objectPosition: position }}
        />
      </div>
    );
  }

  return (
    <div className={`media ${className}`} style={style}>
      <div className="ph">
        <span className="ph__brackets" aria-hidden="true" />
        <div className="ph__inner">
          <span className="ph__label">{label}</span>
          {hint && IS_DEV && <span className="ph__hint">{hint}</span>}
        </div>
      </div>
    </div>
  );
}

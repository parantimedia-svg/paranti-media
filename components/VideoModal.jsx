"use client";

import { useEffect, useRef, useState } from "react";
import { IS_DEV } from "@/lib/env";
import { youTubeEmbed, ytCommand, ytListen, YT_ORIGIN } from "@/lib/youtube";

/* Fullscreen cinematic video modal. Traps focus, closes on Escape or backdrop
   click, and degrades to a clearly-labelled notice when no reel has been
   supplied yet.

   Three sources, in order: a YouTube id, a self-hosted file, then the notice.
   YouTube is first because it is where the finished reel lives — this site
   only has to open the player.

   `vertical` switches the stage to 9:16 for YouTube Shorts, so a vertical
   video fills its frame instead of sitting pillarboxed inside a 16:9 box. */

/* How long the backdrop takes to fade out. Kept in step with the
   vmodalOut keyframes in the stylesheet. */
const CLOSE_MS = 260;

export default function VideoModal({
  open,
  onClose,
  src,
  poster,
  label,
  youtubeId,
  vertical = false,
}) {
  const closeRef = useRef(null);
  const dialogRef = useRef(null);
  const frameRef = useRef(null);

  /* Only ever set from the player's own report that it is muted — never
     guessed. A "TAP FOR SOUND" prompt over a reel that is already audible
     would be worse than no prompt at all. */
  const [muted, setMuted] = useState(false);

  /* ---------------------------------------------------------------------
     CLOSING SMOOTHLY
     The previous `open` is tracked during render (React's "adjust state when
     a prop changes" pattern) rather than in an effect. An effect runs after
     the commit, so the first render with open=false would already have
     returned null — the modal would vanish, then reappear to fade. Adjusting
     during render means that first committed frame is already the fade.
     --------------------------------------------------------------------- */
  const [prevOpen, setPrevOpen] = useState(open);
  const [closing, setClosing] = useState(false);
  if (prevOpen !== open) {
    setPrevOpen(open);
    setClosing(!open);
  }

  useEffect(() => {
    if (!closing) return;
    const t = window.setTimeout(() => setClosing(false), CLOSE_MS);
    return () => window.clearTimeout(t);
  }, [closing]);

  /* ---------------------------------------------------------------------
     GETTING THE SOUND ON
     The browser mutes a cross-origin iframe that starts playing the instant
     it appears, so the reel opens silent. The click on PLAY REEL is real
     consent, so the fix is simply to ask the player to unmute — repeatedly
     for the first few seconds, because the player is not listening yet when
     the iframe first mounts. If it never obeys, the viewer gets a prompt.
     --------------------------------------------------------------------- */
  useEffect(() => {
    if (!open || !youtubeId) return;

    const frame = frameRef.current;
    if (!frame) return;

    let audible = false;

    const onMessage = (e) => {
      if (e.origin !== YT_ORIGIN || e.source !== frame.contentWindow) return;

      let data;
      try {
        data = JSON.parse(e.data);
      } catch {
        return; // the player also emits non-JSON chatter
      }

      const isMuted = data?.info?.muted;
      if (typeof isMuted !== "boolean") return;

      setMuted(isMuted);
      /* Stop pushing unMute the moment sound is confirmed, so a viewer who
         deliberately mutes in the first few seconds isn't overridden. */
      if (!isMuted) audible = true;
    };

    window.addEventListener("message", onMessage);

    let tries = 0;
    const ask = () => {
      ytListen(frame);
      if (!audible) {
        ytCommand(frame, "unMute");
        ytCommand(frame, "setVolume", [100]);
      }
      if (++tries >= 14) window.clearInterval(timer); // ~5.5s of trying
    };
    const timer = window.setInterval(ask, 400);
    ask();

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("message", onMessage);
      setMuted(false);
    };
  }, [open, youtubeId]);

  useEffect(() => {
    if (!open) return;

    const prev = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.__lenis?.stop();
    closeRef.current?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const nodes = dialogRef.current?.querySelectorAll(
          "button, video, iframe, a[href]"
        );
        if (!nodes?.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      window.__lenis?.start();
      prev instanceof HTMLElement && prev.focus();
    };
  }, [open, onClose]);

  if (!open && !closing) return null;

  return (
    <div
      className="vmodal"
      role="dialog"
      aria-modal="true"
      aria-label={label || "Showreel"}
      ref={dialogRef}
      data-closing={closing ? "true" : "false"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        type="button"
        className="vmodal__close mono"
        onClick={onClose}
        ref={closeRef}
      >
        CLOSE <span aria-hidden="true">✕</span>
      </button>

      <div
        className={`vmodal__stage ${youtubeId ? "vmodal__stage--yt" : ""} ${
          vertical ? "vmodal__stage--vertical" : ""
        }`}
      >
        {youtubeId ? (
          /* The player is removed the instant the modal starts closing, so
             the sound stops with the click rather than playing on under the
             fade. */
          open ? (
            <iframe
              ref={frameRef}
              src={youTubeEmbed(youtubeId, {
                /* The modal only ever renders after a click, so window is
                   always there by now — but guard anyway rather than risk a
                   render-time crash. */
                origin:
                  typeof window === "undefined" ? null : window.location.origin,
              })}
              title={label || "Showreel"}
              /* `autoplay` in the allow-list is what lets the film start on
                 its own — the modal only ever opens from a click, so this is
                 a user-initiated play, not an ambush. */
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : null
        ) : src ? (
          <video
            src={src}
            poster={poster || undefined}
            controls
            autoPlay
            playsInline
            preload="metadata"
          />
        ) : (
          <div className="vmodal__empty">
            <p className="mono">SHOWREEL COMING SOON</p>
            {IS_DEV && (
              <p className="vmodal__hint mono">
                PASTE THE YOUTUBE LINK INTO SHOWREEL.youtube
                <br />
                IN data/projects.js
              </p>
            )}
          </div>
        )}

        {/* Last resort. If the browser refused the unmute request, a click on
            this one is unambiguous consent and always gets through. It only
            appears while the player has actually told us it is muted. */}
        {muted && open && (
          <button
            type="button"
            className="vmodal__sound mono"
            onClick={() => {
              ytCommand(frameRef.current, "unMute");
              ytCommand(frameRef.current, "setVolume", [100]);
              setMuted(false);
            }}
          >
            <span aria-hidden="true">🔊</span> TAP FOR SOUND
          </button>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   YOUTUBE
   --------------------------------------------------------------------------
   The showreel plays from YouTube rather than from this site: the master is a
   200MB file, and YouTube already does the adaptive-bitrate, global-CDN,
   works-on-every-connection part properly. All this site has to do is open the
   right player.

   Whoever updates data/projects.js should never have to care *which* of the
   several YouTube link formats they happened to copy, so `youTubeId` takes any
   of them — a watch URL, a youtu.be short link, an /embed/, /shorts/ or /live/
   URL, or the bare 11-character id — and returns just the id.

   Anything unrecognised returns null rather than throwing, which is what lets
   the modal fall back cleanly instead of embedding a broken player.
   ========================================================================== */

/* YouTube ids are exactly eleven characters of [A-Za-z0-9_-]. */
const ID = /^[\w-]{11}$/;

export function youTubeId(input) {
  if (!input) return null;

  const raw = String(input).trim();
  if (ID.test(raw)) return raw;

  /* A pasted link often arrives without a scheme ("youtu.be/abc..."). Without
     this, URL() would resolve it against a base as a *path* and quietly
     produce nonsense rather than failing. */
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  let url;
  try {
    url = new URL(withScheme);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return ID.test(id) ? id : null;
  }

  /* Only YouTube's own hosts. Anything else is either a mistake or someone
     trying to get an arbitrary iframe onto the page. */
  if (host !== "youtube.com" && host !== "youtube-nocookie.com") return null;

  const v = url.searchParams.get("v");
  if (v && ID.test(v)) return v;

  const path = url.pathname.match(/^\/(?:embed|shorts|v|live)\/([\w-]{11})/);
  return path ? path[1] : null;
}

export const YT_ORIGIN = "https://www.youtube-nocookie.com";

export function youTubeEmbed(id, { autoplay = true, origin = null } = {}) {
  const params = new URLSearchParams({
    autoplay: autoplay ? "1" : "0",
    playsinline: "1",
    /* Keep the end screen inside Paranti's own film rather than handing the
       viewer off to whatever YouTube feels like recommending. */
    rel: "0",
    modestbranding: "1",
    color: "white",
    /* Captions off. The reel carries its own burned-in subtitles, so YouTube's
       auto-generated ones sit directly on top of them — two overlapping lines
       of the same sentence, one of them machine-transcribed. The viewer can
       still switch them on from the player's own CC button. */
    cc_load_policy: "0",
    /* Opens the postMessage control channel to the player.
       This is load-bearing, not a nicety: a cross-origin iframe that appears
       and starts playing immediately is forced to mute by the browser's
       autoplay policy — the click that opened the modal happened in *this*
       document, not inside YouTube's frame, so it doesn't count as consent
       there. Without a channel to the player there is then no way to turn the
       sound back on, and the reel plays silently. `unMute` over this channel
       is what fixes that. */
    enablejsapi: "1",
  });

  /* YouTube will only accept commands from the origin it was told to expect. */
  if (origin) params.set("origin", origin);

  /* -nocookie: YouTube sets no tracking cookie until the film is actually
     played, so simply opening the modal doesn't tag the visitor. */
  return `${YT_ORIGIN}/embed/${id}?${params}`;
}

/* Both helpers are no-ops until the player has booted, which is why the modal
   repeats them for the first few seconds rather than firing once on load. */

/* Subscribe to the player's own state broadcasts (`infoDelivery` messages
   carrying muted / volume / playerState). */
export function ytListen(frame) {
  frame?.contentWindow?.postMessage(
    JSON.stringify({ event: "listening", id: 1, channel: "widget" }),
    YT_ORIGIN
  );
}

export function ytCommand(frame, func, args = []) {
  frame?.contentWindow?.postMessage(
    JSON.stringify({ event: "command", func, args, id: 1, channel: "widget" }),
    YT_ORIGIN
  );
}

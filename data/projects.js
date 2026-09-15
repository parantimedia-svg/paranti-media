/* ==========================================================================
   PARANTI MEDIA — PORTFOLIO DATA
   --------------------------------------------------------------------------
   This is the single source of truth for the WORK section and every case study.
   To publish a real project, fill in a slot below.

   FIELD REFERENCE
     id          string   unique slug, used in the URL hash (required)
     name        string   project title, shown huge (required)
     client      string   client name — leave "" until you have permission
     category    string   e.g. "COMMERCIAL" / "CORPORATE FILM" / "PHOTOGRAPHY"
     year        string   e.g. "2025"
     thumbnail   string   "/media/work/name.jpg"  (put files in public/media/work/)
     video       string   "/media/work/name.mp4"  or a YouTube/Vimeo embed URL
     youtube     string   YouTube link — watch, youtu.be or /shorts/ all work.
                          When set, the card plays it in a lightbox.
     size        string   "film" (16:9, its own row) or "short" (9:16) for
                          YouTube work; tall / wide / standard / full remain
                          for placeholder slots.
     poster      string   still frame shown before the video plays
     description string   1–3 sentences about the project
     credits     array    [{ role: "DIRECTOR", name: "..." }]
     results     array    ONLY real, verified numbers. Leave [] if you don't have any.
                          e.g. [{ value: "2.4M", label: "VIEWS" }]
     featured    boolean  show it in the WORK grid
     placeholder boolean  true = renders the clearly-labelled empty slot styling.
                          Set to false the moment you add real media.
   ========================================================================== */

export const PROJECTS = [
  /* Real work. Every title is the video's own YouTube title, uppercased to
     match the section — nothing here is invented. The Shorts are filed as
     SOCIAL because that is what their format establishes; no more specific
     category is claimed than the videos themselves make clear.

     Thumbnails come straight from YouTube's image CDN, so nothing is
     downloaded or hosted:
       maxresdefault  1280x720 — the short film's own 16:9 frame
       oardefault     the Shorts' native 9:16 frame. hqdefault, the usual
                      choice, is a 4:3 image with the vertical video
                      letterboxed inside it. */
  {
    id: "vibraksha",
    name: "VIBRAKSHA",
    client: "",
    category: "SHORT FILM",
    year: "",
    youtube: "https://youtu.be/tIL-XqjfXNk",
    thumbnail: "https://i.ytimg.com/vi/tIL-XqjfXNk/maxresdefault.jpg",
    video: null,
    poster: null,
    description: "",
    credits: [],
    results: [],
    featured: true,
    placeholder: false,
    size: "film",
  },
  {
    id: "tirunageswaram-temple",
    name: "TIRUNAGESWARAM TEMPLE",
    client: "",
    category: "SOCIAL",
    year: "",
    youtube: "https://youtube.com/shorts/yeOMvtxDUhQ",
    thumbnail: "https://i.ytimg.com/vi/yeOMvtxDUhQ/oardefault.jpg",
    video: null,
    poster: null,
    description: "",
    credits: [],
    results: [],
    featured: true,
    placeholder: false,
    size: "short",
  },
  {
    id: "ai-video",
    name: "AI VIDEO",
    client: "",
    category: "SOCIAL",
    year: "",
    youtube: "https://youtube.com/shorts/nPPcyUo0lWI",
    thumbnail: "https://i.ytimg.com/vi/nPPcyUo0lWI/oardefault.jpg",
    video: null,
    poster: null,
    description: "",
    credits: [],
    results: [],
    featured: true,
    placeholder: false,
    size: "short",
  },
  {
    id: "restaurant",
    name: "RESTAURANT",
    client: "",
    category: "SOCIAL",
    year: "",
    youtube: "https://youtube.com/shorts/W5VDf2vDBVU",
    thumbnail: "https://i.ytimg.com/vi/W5VDf2vDBVU/oardefault.jpg",
    video: null,
    poster: null,
    description: "",
    credits: [],
    results: [],
    featured: true,
    placeholder: false,
    size: "short",
  },
  {
    id: "dental",
    name: "DENTAL",
    client: "",
    category: "SOCIAL",
    year: "",
    youtube: "https://youtube.com/shorts/gSCSmU3L91c",
    thumbnail: "https://i.ytimg.com/vi/gSCSmU3L91c/oardefault.jpg",
    video: null,
    poster: null,
    description: "",
    credits: [],
    results: [],
    featured: true,
    placeholder: false,
    size: "short",
  },
  {
    id: "kukke-subramanya-temple",
    name: "KUKKE SUBRAMANYA TEMPLE",
    client: "",
    category: "SOCIAL",
    year: "",
    youtube: "https://youtube.com/shorts/okJnf9PFl4g",
    thumbnail: "https://i.ytimg.com/vi/okJnf9PFl4g/oardefault.jpg",
    video: null,
    poster: null,
    description: "",
    credits: [],
    results: [],
    featured: true,
    placeholder: false,
    size: "short",
  },
  {
    id: "new-look",
    name: "NEW LOOK",
    client: "",
    category: "SOCIAL",
    year: "",
    youtube: "https://youtube.com/shorts/1PNRAIeTXtU",
    thumbnail: "https://i.ytimg.com/vi/1PNRAIeTXtU/oardefault.jpg",
    video: null,
    poster: null,
    description: "",
    credits: [],
    results: [],
    featured: true,
    placeholder: false,
    size: "short",
  },
  {
    id: "cheluvu",
    name: "CHELUVU",
    client: "",
    category: "SOCIAL",
    year: "",
    youtube: "https://youtube.com/shorts/EtzqNnadaqw",
    thumbnail: "https://i.ytimg.com/vi/EtzqNnadaqw/oardefault.jpg",
    video: null,
    poster: null,
    description: "",
    credits: [],
    results: [],
    featured: true,
    placeholder: false,
    size: "short",
  },
  {
    id: "restaurant-2",
    name: "RESTAURANT 2",
    client: "",
    category: "SOCIAL",
    year: "",
    youtube: "https://youtube.com/shorts/9urfSzYyeLw",
    thumbnail: "https://i.ytimg.com/vi/9urfSzYyeLw/oardefault.jpg",
    video: null,
    poster: null,
    description: "",
    credits: [],
    results: [],
    featured: true,
    placeholder: false,
    size: "short",
  },
];

export const getFeaturedProjects = () => PROJECTS.filter((p) => p.featured);
export const getProject = (id) => PROJECTS.find((p) => p.id === id) || null;

/* --------------------------------------------------------------------------
   SHOWREEL

   Two different jobs, deliberately served by two different files:

     `youtube`   WHERE THE FILM ACTUALLY PLAYS. Pressing PLAY REEL opens the
                 full reel in an embedded YouTube player. Paste the link in any
                 form you happen to copy — watch URL, youtu.be short link, or
                 the bare id — lib/youtube.js normalises all of them.

     `preview`   The silent 14-second loop that sits behind the PLAY REEL
                 button. 1080p and roughly 1MB, cut from the master with a fade
                 at each end so the loop reads as a beat rather than a jump.

   The 200MB master (public/media/showreel.mov, PCM audio, 2:48) is the source
   both were cut from and the file to upload to YouTube. It is never served —
   .vercelignore keeps it out of the deploy.
   -------------------------------------------------------------------------- */
export const SHOWREEL = {
  youtube: "https://youtu.be/QlhymF7-sus",
  horizontal: {
    src: "/media/showreel-preview.mp4",
    poster: "/media/showreel-poster.jpg",
    label: "SHOWREEL — 16:9",
  },
  vertical: {
    src: null, // e.g. "/media/reel-vertical.mp4"
    poster: null,
    label: "REEL — 9:16",
  },
};

/* --------------------------------------------------------------------------
   HERO MEDIA — one still or short muted loop. Leave null for the placeholder.
   -------------------------------------------------------------------------- */
export const HERO_MEDIA = {
  image: null, // optional still; the video below takes precedence
  /* The vertical 1080x1920 cut, used at every width. The hero frame is 9:16 to
     match it exactly, so the film is never cropped — the landscape hero.mp4
     lost ~58% of its width to the portrait frame. Set `videoMobile` to a
     separate cut if a phone-specific edit is ever supplied; MediaFrame will
     switch sources at `mobileMaxWidth` and download only the one it needs. */
  video: "/media/mobilelogo.mp4",
  videoMobile: null,
  poster: null, // add "/media/hero-poster.jpg" to cover the first-load moment
  label: "HERO FRAME",
};

/* --------------------------------------------------------------------------
   CLIENT LOGOS

   Twelve real client marks, each its own file in public/media/logos/. They
   were supplied as a single 4x3 contact sheet; that sheet is split into
   individual files so every logo keeps its own aspect ratio and the marquee
   can size them independently — one flattened image would have stretched to
   whatever box it was given.

   Names below are what each mark actually reads, which differs from the
   supplied list in two places: "Kavitha's" (listed as Kaithra's) and
   "Jhonson's Academy" (listed as Johnson's).

   `w` and `h` are each file's real pixel size. The marquee needs every logo's
   box to be the same width before and after its image loads — otherwise the
   two looping tracks end up different widths and slide into each other.
   -------------------------------------------------------------------------- */
export const CLIENTS = [
  { id: "client-01", name: "Shuchi Coconut Oil", src: "/media/logos/shuchi-coconut-oil.png", w: 230, h: 230 },
  { id: "client-02", name: "Vipra Productions", src: "/media/logos/vipra-productions.png", w: 265, h: 230 },
  { id: "client-03", name: "Prime Dental & Aesthetic Clinic", src: "/media/logos/prime-dental.png", w: 334, h: 230 },
  { id: "client-04", name: "AyuSynk", src: "/media/logos/ayusynk.png", w: 307, h: 230 },
  { id: "client-05", name: "Cheluvu", src: "/media/logos/cheluvu.png", w: 274, h: 215 },
  { id: "client-06", name: "GLAM Family Beauty Salon", src: "/media/logos/glam-family-beauty-salon.png", w: 291, h: 215 },
  { id: "client-07", name: "Kavitha's", src: "/media/logos/kavithas.png", w: 284, h: 215 },
  { id: "client-08", name: "RMC Advanced Regenerative Medicine Centre", src: "/media/logos/rmc-regenerative-medicine.png", w: 242, h: 215 },
  { id: "client-09", name: "Jnana Chethana Education Trust", src: "/media/logos/jnana-chethana-education-trust.png", w: 205, h: 271 },
  { id: "client-10", name: "Jhonson's Academy", src: "/media/logos/jhonsons-academy.png", w: 185, h: 271 },
  { id: "client-11", name: "Ambara Gardenia", src: "/media/logos/ambara-gardenia.png", w: 218, h: 271 },
  { id: "client-12", name: "KAYA Healthcare Diagnostics", src: "/media/logos/kaya-healthcare-diagnostics.png", w: 309, h: 271 },
];

/* --------------------------------------------------------------------------
   TESTIMONIALS — replace the placeholder copy with real, approved quotes only.
   -------------------------------------------------------------------------- */
export const TESTIMONIALS = [
  {
    id: "t1",
    quote: "Client testimonial goes here.",
    name: "CLIENT NAME",
    role: "", // e.g. "MARKETING HEAD"
    placeholder: true,
  },
  {
    id: "t2",
    quote: "Client testimonial goes here.",
    name: "CLIENT NAME",
    role: "",
    placeholder: true,
  },
  {
    id: "t3",
    quote: "Client testimonial goes here.",
    name: "CLIENT NAME",
    role: "",
    placeholder: true,
  },
];

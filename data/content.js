/* ==========================================================================
   PARANTI MEDIA — SECTION CONTENT
   ========================================================================== */

/* `image` is the still behind each contact-sheet frame (web-sized copies in
   public/media/services). `focus` is the object-position that keeps the
   subject in frame when the photo is cropped to the frame's shape. `light`
   marks a pale image that needs holding down so the words stay readable. */
export const SERVICES = [
  { num: "01", title: "VIDEO PRODUCTION", note: "End-to-end film production, from concept to final grade.", image: "/media/services/video-production.jpg", focus: "50% 50%" },
  { num: "02", title: "COMMERCIAL ADS", note: "Short-form commercial work built to sell and to be remembered.", image: "/media/services/commercial-ads.jpg", focus: "50% 45%" },
  { num: "03", title: "COMMERCIAL FILMS", note: "Company films, culture pieces and leadership storytelling.", image: "/media/services/corporate-films.jpg", focus: "50% 30%" },
  { num: "04", title: "DOCUMENTARIES", note: "Long-form, real stories told with patience and craft.", image: "/media/services/documentaries.jpg", focus: "50% 50%" },
  { num: "05", title: "PRODUCT VIDEOS", note: "Studio-controlled product film that makes objects desirable.", image: "/media/services/product-videos.jpg", focus: "50% 55%" },
  { num: "06", title: "WEBSITE DEVELOPMENT", note: "Fast, considered websites that carry the brand through.", image: "/media/services/website-development-illustration.jpg", focus: "50% 50%", light: true },
  { num: "07", title: "EVENT COVERAGE", note: "Full multi-camera coverage with same-week turnarounds.", image: "/media/services/event-coverage.jpg", focus: "50% 55%" },
  { num: "08", title: "PHOTOGRAPHY", note: "Campaign, product, editorial and event photography.", image: "/media/services/photography.jpg", focus: "50% 30%" },
  { num: "09", title: "DIGITAL MARKETING", note: "Distribution and strategy so the work actually gets seen.", image: "/media/services/digital-marketing.jpg", focus: "50% 55%" },
];

export const APPROACH = [
  { num: "01", title: "CONCEPT" },
  { num: "02", title: "PRODUCTION" },
  { num: "03", title: "EDITING" },
  { num: "04", title: "STORYTELLING" },
  { num: "05", title: "DELIVERY" },
];

export const PROCESS = [
  {
    num: "01",
    title: "DISCOVER",
    body: "We start with the brief behind the brief — the audience, the objective and what has to change after someone watches.",
  },
  {
    num: "02",
    title: "CONCEPT",
    body: "Direction, references, treatment and shot logic. Nothing goes on a call sheet before the idea is sharp.",
  },
  {
    num: "03",
    title: "PRODUCE",
    body: "Crew, location, lighting, sound, direction. A controlled set that protects the idea on the day.",
  },
  {
    num: "04",
    title: "EDIT",
    body: "Story-first assembly, sound design, colour and finish — cut for the platform it will actually live on.",
  },
  {
    num: "05",
    title: "DELIVER",
    body: "Master files, platform-ready versions, verticals and cutdowns. Handed over ready to publish.",
  },
];

/* --------------------------------------------------------------------------
   FOUNDERS

   `photo` paths must match the files on disk exactly, capital letter included:
   a web server is case-sensitive where macOS is not, so a path that resolves
   locally can still 404 in production. All four are portrait headshots framed
   the same way, which is why a single 3:4 crop suits every card.
   -------------------------------------------------------------------------- */
export const FOUNDERS = [
  {
    name: "DHANUSH SHETTY",
    role: "FOUNDER & HEAD OF FINANCE AND SALES",
    bio: "Leads Business Strategy, Finance, Client Relationships, Sales, And Overall Business Development.",
    photo: "/media/founders/Dhanush.png",
  },
  {
    name: "SWASTIK SHETTY",
    role: "CO-FOUNDER & HEAD OF IT, PLANNING & VIDEOGRAPHY",
    bio: "Leads Technology, Project Planning, Production Workflow, And Videography Operations.",
    photo: "/media/founders/Swasthik.png",
  },
  {
    name: "JEEVAN SHETTIGAR",
    role: "CO-FOUNDER & HEAD OF CREATIVE & POST-PRODUCTION",
    bio: "Leads Creative Direction, Content Development, Video Editing, And Post-Production.",
    photo: "/media/founders/Jeevan.png",
  },
  {
    name: "SHASHANK V S",
    role: "HEAD OF WEBSITE DESIGN & DEVELOPMENT",
    bio: "",
    photo: "/media/founders/Shashank.png",
  },
];

export const WHY_STATEMENTS = [
  "BUILT FOR STORIES.",
  "DESIGNED FOR ATTENTION.",
  "MADE TO BE REMEMBERED.",
];

export const INDUSTRIES = [
  "HEALTHCARE",
  "HOSPITALITY",
  "EDUCATION",
  "REAL ESTATE",
  "RETAIL",
  "BEAUTY & WELLNESS",
  "EVENTS",
  "FOOD",
  "STARTUPS",
];

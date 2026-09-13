/* ==========================================================================
   PARANTI MEDIA — GLOBAL SITE CONFIG
   Everything a non-developer needs to change lives in this file.
   ========================================================================== */

export const SITE = {
  name: "PARANTI MEDIA",
  tagline: "CREATE. CAPTURE. INSPIRE.",
  title: "PARANTI MEDIA — Creative Production Studio",
  description:
    "Paranti Media is a creative production studio crafting cinematic stories, brand experiences and content that people remember. Video production, photography, social content, creative direction, branding and digital experiences.",
  /* Canonical URL used for SEO, Open Graph, sitemap and structured data.
     On Vercel this resolves automatically from the deployment URL; set
     NEXT_PUBLIC_SITE_URL (or edit the fallback) once a custom domain is live. */
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : "https://parantimedia.com"),
  email: "parantimedia@gmail.com",
  phoneDisplay: "+91 88618 78285",
  // Full E.164 form, leading "+" included — use as-is in tel: links and
  // structured data. Don't prepend another "+".
  phoneHref: "+918861878285",
  whatsapp: "https://wa.me/918861878285",
  instagramHandle: "@parantimedia",
  instagram: "https://instagram.com/parantimedia",
  // TODO: add your city once confirmed, e.g. "Mangaluru, India". Left blank on purpose.
  location: "",
};

/* --------------------------------------------------------------------------
   CONTACT FORM WIRING  —  READ THIS
   --------------------------------------------------------------------------
   The form is already coded and validated. It just needs ONE key/endpoint.
   Pick either option (Web3Forms is the fastest — no account dashboard needed):

   OPTION A — WEB3FORMS (recommended, free)
     1. Go to https://web3forms.com
     2. Enter parantimedia@gmail.com and press "Create Access Key"
     3. Check that inbox for the access key (a UUID like 1a2b3c4d-...)
     4. Either:
        · set it on Vercel as an env var  NEXT_PUBLIC_WEB3FORMS_KEY   (preferred —
          no code change, and you can rotate it later), or
        · paste it below as `web3formsAccessKey`

   OPTION B — FORMSPREE (free tier)
     1. Go to https://formspree.io, create a form pointed at parantimedia@gmail.com
     2. Copy the endpoint (looks like https://formspree.io/f/abcdwxyz)
     3. Either set env var NEXT_PUBLIC_FORMSPREE_ENDPOINT, or paste it below.

   Until one of these is filled in, the form falls back to opening the visitor's
   email client with every field pre-filled, so no enquiry is ever lost.

   NOTE: these are public, client-side keys by design — that is how no-backend
   form services work, and it is why the form also carries a honeypot field.
   -------------------------------------------------------------------------- */
const PLACEHOLDER_KEY = "PASTE_YOUR_WEB3FORMS_ACCESS_KEY_HERE";

export const FORM = {
  web3formsAccessKey:
    process.env.NEXT_PUBLIC_WEB3FORMS_KEY || PLACEHOLDER_KEY,
  formspreeEndpoint: process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT || "",
};

export const isFormWired = () =>
  Boolean(
    (FORM.formspreeEndpoint && FORM.formspreeEndpoint.startsWith("http")) ||
      (FORM.web3formsAccessKey && FORM.web3formsAccessKey !== PLACEHOLDER_KEY)
  );

export const NAV_LINKS = [
  { label: "WORK", href: "#work" },
  { label: "SERVICES", href: "#services" },
  { label: "ABOUT", href: "#about" },
  { label: "CONTACT", href: "#contact" },
];

export const PROJECT_TYPES = [
  "Video Production",
  "Commercial Ad",
  "Commercial Film",
  "Documentary",
  "Product Video",
  "Photography",
  "Event Coverage",
  "Website Development",
  "Digital Marketing",
  "Other",
];

export const BUDGET_RANGES = [
  "Under ₹50,000",
  "₹50,000 – ₹1,00,000",
  "₹1,00,000 – ₹3,00,000",
  "₹3,00,000 – ₹5,00,000",
  "₹5,00,000+",
  "Not sure yet",
];

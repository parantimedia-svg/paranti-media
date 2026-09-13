# PARANTI MEDIA — Creative Production Studio

Cinematic one-page site. **Cream `#F3EAD3` · Ink `#16130F` · Orange `#E1541E`**,
Bebas Neue / Inter / IBM Plex Mono.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

---

## 1. Wire up the contact form (do this first)

The form is fully built and validated — it just needs one key. Nothing else
about it needs changing.

**Fastest route (Web3Forms, free):**

1. Go to <https://web3forms.com>, enter **parantimedia@gmail.com**, press
   *Create Access Key*.
2. The key arrives in that inbox (a UUID like `1a2b3c4d-…`).
3. On Vercel: **Project → Settings → Environment Variables** → add

   | Name | Value |
   | --- | --- |
   | `NEXT_PUBLIC_WEB3FORMS_KEY` | your key |

   Then redeploy. (Locally: put the same line in a `.env.local` file.)

Prefer Formspree? Create a form pointed at parantimedia@gmail.com and set
`NEXT_PUBLIC_FORMSPREE_ENDPOINT` instead.

You can also paste either value directly into `data/site.js → FORM` if you'd
rather not use environment variables.

**Until a key is set**, the form opens the visitor's mail app with every field
pre-filled and addressed to parantimedia@gmail.com — so no enquiry is ever
lost. If a send fails, pressing send again does the same thing.

---

## 2. Add your real content

Everything editable lives in `data/`. No component files need touching.

### `data/projects.js`

| What | Where |
| --- | --- |
| **Portfolio projects** | `PROJECTS` — 6 ready slots. Fill in `name`, `client`, `category`, `year`, `thumbnail`, `video`, `description`, then set `placeholder: false`. `results` accepts real, verified numbers only — leave `[]` if you don't have any. |
| **Showreel** | `SHOWREEL.horizontal.src` (16:9, used in the big section + modal) and `SHOWREEL.vertical.src` (9:16). Add a `poster` still for each. |
| **Hero frame** | `HERO_MEDIA.image` or `.video` |
| **Client logos** | `CLIENTS` — 13 empty slots for the marquee. Add `name` + `src`. |
| **Testimonials** | `TESTIMONIALS` — replace the placeholder quotes with real, approved ones. |
| **Behind the scenes** | `BTS` — six stills. |

Put media in `public/media/` (e.g. `public/media/work/`, `public/media/clients/`,
`public/media/bts/`) and reference it as `/media/…`.

Any slot without media renders a clean, clearly-labelled placeholder — the site
never shows a broken image, so you can add things one at a time.

### `data/site.js`
Contact details, nav links, project-type and budget dropdowns, SEO copy.

### `data/content.js`
Services list, approach steps, process steps, founders, industries, the three
"why" statements.

---

## 3. Media guidance

- **Video**: MP4 (H.264), and always set a `poster` still — the poster is what
  people see before playback.
- **Images**: upload at roughly 2× their display size. Next.js converts them to
  AVIF/WebP and serves the right size automatically.
- Keep the showreel under ~10 MB if you can; large files are the single biggest
  thing that will slow the site down.

---

## 4. How the brand pieces work

**The logo** — `parantii.png` is used exactly as supplied in the nav, the footer
and the favicon. It is never redrawn or recoloured. It ships with a warm-cream
background, so `components/Logo.jsx` composites it with `mix-blend-mode: darken`
over a brand-cream plate: the background resolves to `#F3EAD3` while the ink
figure and the orange "A"s pass through untouched. That's also why it reads
correctly as a cream stamp on the ink footer.

**The animated photographer** (`components/Figure.jsx`) is a *separate* layered
SVG, traced from the logo so the pose and proportions match. It exists only so
it can move, and it drives the two signature animations:

- **The plant** (`components/Intro.jsx`) — on first load the monopod is driven
  into the ground and settles with one damped bounce, then the stage wipes up
  into the hero. ~1.9s, skipped after the first view in a session, skipped
  entirely on reduced motion, and click/keypress skips it.
- **The scroll rail** (`components/ScrollRail.jsx`) — the monopod down the left
  edge is the scroll-progress indicator. The photographer stays whole and
  planted; only the camera travels up the pole, trailing an orange fill, until
  it reaches the top at the end of the page. Driven by a single CSS custom
  property so only transforms ever animate.

---

## 5. Accessibility & motion

`prefers-reduced-motion` is respected throughout, and the "everything visible"
fallbacks are enforced in CSS rather than JavaScript — so content can never be
stranded behind an animation that didn't run. Keyboard navigation, focus rings,
a skip link, focus trapping in the menu and both modals, and ARIA labelling are
all in place.

---

## 6. Deploying

Hosted on Vercel. Pushing to the connected Git branch redeploys, or run
`npx vercel --prod` from this folder.

After connecting a custom domain, set `NEXT_PUBLIC_SITE_URL` to it (e.g.
`https://parantimedia.com`) so canonical URLs, Open Graph tags, the sitemap and
the structured data all point at the right place.

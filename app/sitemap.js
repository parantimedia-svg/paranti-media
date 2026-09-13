import { SITE } from "@/data/site";

/* Single-page site — the sections are anchors on "/", so one canonical entry
   is the honest sitemap. Add real routes here if case studies ever get their
   own pages. */
export default function sitemap() {
  return [
    {
      url: SITE.url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}

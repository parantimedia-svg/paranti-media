/* Build-time flag, inlined by Next.
   Placeholder *labels* ("HERO FRAME", "PROJECT SLOT 01") always render — they
   read as deliberate holding art. The build *instructions* that go with them
   ("ADD /media/hero.jpg", "SITE OWNER: paste a form key…") are for whoever is
   filling the site in, so they only appear while running locally and never
   reach a visitor on the live site. */
export const IS_DEV = process.env.NODE_ENV === "development";

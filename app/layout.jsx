import { Bebas_Neue, IBM_Plex_Mono, Inter } from "next/font/google";
import { SITE } from "@/data/site";
import "./globals.css";
import "./components.css";
/* Optional camera layer. Self-contained: nothing in here applies until
   <html data-director="on"> exists. See components/DirectorMode.jsx. */
import "./director.css";
/* The Build A Shot section. Self-contained, same as above. */
import "./build-a-shot.css";

/* Self-hosted via next/font — same three brand faces, zero render-blocking
   requests to Google and no layout shift. */
const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bebas",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

const plexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    template: "%s — PARANTI MEDIA",
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "creative production studio",
    "video production",
    "commercial ads",
    "corporate films",
    "documentaries",
    "product videos",
    "photography",
    "social media content",
    "event coverage",
    "real estate videography",
    "branding",
    "digital marketing",
    "Paranti Media",
  ],
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  openGraph: {
    type: "website",
    url: SITE.url,
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
    images: [
      {
        url: "/parantii.png",
        width: 1254,
        height: 1254,
        alt: "PARANTI MEDIA — Create. Capture. Inspire.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
    images: ["/parantii.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: "/" },
};

export const viewport = {
  themeColor: "#F3EAD3",
  colorScheme: "light",
};

/* Structured data — only facts we actually hold. No invented awards,
   ratings, addresses or client counts. */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: SITE.name,
  alternateName: "Paranti Media",
  description: SITE.description,
  slogan: SITE.tagline,
  url: SITE.url,
  logo: `${SITE.url}/parantii.png`,
  image: `${SITE.url}/parantii.png`,
  email: SITE.email,
  telephone: SITE.phoneHref,
  sameAs: [SITE.instagram],
  makesOffer: [
    "Video Production",
    "Commercial Ads",
    "Commercial Films",
    "Documentaries",
    "Product Videos",
    "Photography",
    "Event Coverage",
    "Website Development",
    "Digital Marketing",
  ].map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s } })),
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`no-js ${bebas.variable} ${inter.variable} ${plexMono.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}

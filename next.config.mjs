/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 82, 90],
    /* YouTube's thumbnail CDN, for the Work section. Scoped to /vi/ — the
       only path video thumbnails live under — rather than the whole host. */
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
    ],
  },
};

export default nextConfig;

import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  ssr: true,
  // Static assets live under src/public (e.g. src/public/banner/*.webp),
  // served from the site root — /banner/banner-1.webp.
  publicDir: "./src/public",
  server: {
    routeRules: {
      // The homepage was server-rendered fresh on every request
      // (x-vercel-cache: MISS, 784ms TTFB). Its content is a featured/premium
      // project rail and a city list -- none of it per-visitor, and lead
      // attribution is captured client-side from window.location, so nothing
      // visitor-specific is baked into the HTML. A 60s window keeps it current
      // while serving almost every request from the edge.
      "/": { isr: { expiration: 60 } },
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});

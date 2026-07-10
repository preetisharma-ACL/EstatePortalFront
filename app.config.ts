import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  ssr: true,
  // Static assets live under src/public (e.g. src/public/banner/*.jpg),
  // served from the site root — /banner/banner-1.jpg.
  publicDir: "./src/public",
  vite: {
    plugins: [tailwindcss()],
  },
});

// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";

/**
 * Origin that serves backend media. 32 of the 37 images on the homepage come
 * from here, all of them lazy, so the first one to enter the viewport pays a
 * cold DNS + TCP + TLS handshake (~170ms measured) before a byte arrives.
 * Warming the connection up front removes that from the first scroll.
 *
 * Derived from the API base rather than hardcoded so it follows the
 * environment instead of silently pointing at production from a preview build.
 * No crossorigin attribute: these images are fetched as ordinary
 * non-CORS subresources, and a mismatched preconnect opens a second,
 * unused connection instead of warming the one that gets used.
 */
const MEDIA_ORIGIN = (() => {
  const base = (import.meta as any).env?.VITE_API_BASE_URL;
  try {
    return base ? new URL(base).origin : null;
  } catch {
    return null;
  }
})();

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta
            name="google-site-verification"
            content="pozMz1gV_tRrQWj3sI8dFa8khjsy0MOOjgTCfvVu828"
          />
          {MEDIA_ORIGIN && <link rel="preconnect" href={MEDIA_ORIGIN} />}
          <link rel="icon" type="image/png" href="/logo/aajneeti-favicon.png" />
          <link rel="apple-touch-icon" href="/logo/aajneeti-favicon.png" />

          {/* Google tag (gtag.js) — site-wide analytics */}
          <script async src="https://www.googletagmanager.com/gtag/js?id=G-DJCMEPXJS2" />
          <script
            innerHTML={`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', 'G-DJCMEPXJS2');`}
          />
          {/* Fonts are self-hosted (see scripts/fetch-fonts.mjs). The
              @font-face rules ride in the bundled CSS, so there is no
              render-blocking request to fonts.googleapis.com and no second
              origin to resolve before first paint.

              Only the two faces used by above-the-fold text are preloaded:
              Manrope carries body copy and Fraunces the headings. Italic
              Fraunces and IBM Plex Mono are left to load normally -- font-display
              swap covers them, and preloading everything would just recreate the
              bandwidth contention this change removes. */}
          <link
            rel="preload"
            href="/fonts/manrope-400-700-normal.woff2"
            as="font"
            type="font/woff2"
            crossorigin="anonymous"
          />
          <link
            rel="preload"
            href="/fonts/fraunces-400-600-normal.woff2"
            as="font"
            type="font/woff2"
            crossorigin="anonymous"
          />
          {assets}
        </head>
        <body>
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));

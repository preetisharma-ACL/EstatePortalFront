// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";

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

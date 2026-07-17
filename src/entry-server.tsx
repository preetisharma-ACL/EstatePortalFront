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
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossorigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..600;1,9..144,400..600&family=Manrope:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap"
            rel="stylesheet"
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

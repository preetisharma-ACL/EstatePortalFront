/**
 * Meta (Facebook) Pixel, per project.
 *
 * Unlike the Google Ads account, pixels are NOT shared: each one belongs to a
 * client's own ad account, so a pixel only goes on the pages of the project it
 * was issued for — its landing page and the /thank-you page its enquiries
 * redirect to (`?project=<slug>`). Loading it anywhere else would hand that
 * client page views from visitors who never saw their project.
 */
const META_PIXEL_BY_SLUG: Record<string, string> = {
  "saya-raj-nagar-extension": "1103841375880142",
};

export function metaPixelFor(slug: string | undefined): string | undefined {
  return slug ? META_PIXEL_BY_SLUG[slug] : undefined;
}

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  push: Fbq;
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
    /** Pixel ids already `init`'d in this document — Meta warns on a second init. */
    __metaPixelInit?: Record<string, true>;
    /**
     * Set by the server-rendered snippet to the URL it tracked a PageView for,
     * so the onMount fallback does not send a second one on a direct load.
     */
    __metaPixelPageView?: Record<string, string>;
  }
}

/** Meta's own loader stub, unchanged in behaviour: defines fbq and loads fbevents.js once. */
function loadFbq(): Fbq {
  if (window.fbq) return window.fbq;
  const n = function (...args: unknown[]) {
    if (n.callMethod) n.callMethod(...args);
    else n.queue.push(args);
  } as Fbq;
  window.fbq = n;
  if (!window._fbq) window._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = "2.0";
  n.queue = [];
  const t = document.createElement("script");
  t.async = true;
  t.src = "https://connect.facebook.net/en_US/fbevents.js";
  const s = document.getElementsByTagName("script")[0];
  s.parentNode!.insertBefore(t, s);
  return n;
}

/**
 * Tracks a PageView for this pixel, initialising it if needed. Called from
 * <MetaPixel>'s onMount; a no-op when the server-rendered snippet already
 * tracked this exact URL (direct load). On a client-side navigation that
 * snippet is inserted but never executed, so this does the work instead.
 */
export function trackMetaPageView(id: string): void {
  if (typeof window === "undefined") return;
  const sent = window.__metaPixelPageView;
  if (sent?.[id] === location.href) {
    // Consume it, so a later client-side return to this URL still counts.
    delete sent[id];
    return;
  }
  const fbq = loadFbq();
  const inited = (window.__metaPixelInit ||= {});
  if (!inited[id]) {
    fbq("init", id);
    inited[id] = true;
  }
  fbq("track", "PageView");
}

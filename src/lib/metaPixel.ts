/**
 * Meta (Facebook) pixel reporting, per project.
 *
 * The opposite model to Google Ads. There is no shared account: each pixel
 * belongs to a client's own ad account, arrives as `meta_pixel` on the project
 * and on the lead response, and `null` means there is no pixel — never "use
 * someone else's". There is no site-wide pixel and no default to fall back to.
 *
 * Four things this module exists to get right:
 *
 *   1. No pixel, no script. fbevents.js is loaded only by ensureMetaPixel, and
 *      only ever for a configured pixel, so the ~370 projects without one carry
 *      no Facebook connection at all.
 *   2. Events reach ONE pixel. `fbq('track')` broadcasts to every pixel
 *      initialised in the document, and a visitor who browses project A then
 *      enquires on project B has both — so a plain `track` would hand B's lead
 *      to A's client. Everything here goes through `trackSingle`, and Meta's own
 *      broadcasting features (SPA PageViews, automatic events) are switched off.
 *   3. The fire survives the redirect to /thank-you — stashMetaLead /
 *      takeStashedMetaLead, same as the Ads conversion.
 *   4. It fires exactly once per lead. A duplicate Lead is as invisible and as
 *      costly as a duplicate Ads conversion.
 */

import type { MetaPixelConfig } from "./types";

export type { MetaPixelConfig };

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  push: Fbq;
  loaded: boolean;
  version: string;
  /** Read by fbevents.js: stops it auto-firing a PageView, to EVERY pixel, on pushState. */
  disablePushState?: boolean;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

/* ------------------------------------------------------------------------- *
 * Initialisation
 * ------------------------------------------------------------------------- */

/**
 * Pixels already `init`'d in this document. Module-level, so it resets on a
 * full page load and persists across client-side navigations — exactly the
 * lifetime of the fbq queue it guards. Meta warns on a second init of an id.
 */
const initialised = new Set<string>();

/** Meta's loader stub, unchanged in behaviour: defines fbq and loads fbevents.js once. */
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
  // Set before fbevents.js arrives, which is when it reads the flag. Each
  // project page sends its own PageView to its own pixel instead.
  n.disablePushState = true;
  if (!document.querySelector('script[src*="connect.facebook.net/"][src*="/fbevents.js"]')) {
    const t = document.createElement("script");
    t.async = true;
    t.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(t);
  }
  return n;
}

/**
 * Initialises a Meta pixel on this page, loading fbevents.js if needed.
 * Idempotent — safe to call before every fire.
 *
 * Whether a pixel is initialised is a property of the DOCUMENT, so the payload
 * makes no claim about it and this decides: the set above for the init, the
 * DOM for the loader. Commands queue on the stub until the script arrives, so
 * there is nothing to wait for.
 */
export function ensureMetaPixel(pixelId: string): Fbq | null {
  if (!pixelId || typeof window === "undefined") return null;
  const fbq = loadFbq();
  if (!initialised.has(pixelId)) {
    initialised.add(pixelId);
    // Automatic events (button clicks, page metadata) go to every initialised
    // pixel, which is the cross-client leak rule 2 above exists to prevent.
    // Must precede the init.
    fbq("set", "autoConfig", false, pixelId);
    fbq("init", pixelId);
  }
  return fbq;
}

/** A PageView for one pixel — the landing page's own, never broadcast. */
export function trackMetaPageView(pixelId: string): void {
  ensureMetaPixel(pixelId)?.("trackSingle", pixelId, "PageView");
}

/* ------------------------------------------------------------------------- *
 * Surviving the redirect to /thank-you
 * ------------------------------------------------------------------------- */

const STASH_KEY = "ep_pending_meta_lead";

export type PendingMetaLead = { leadId: number | null; pixel: MetaPixelConfig };

/** Parks the lead event for /thank-you. See stashConversion for why sessionStorage. */
export function stashMetaLead(leadId: number | null, pixel: MetaPixelConfig): void {
  try {
    sessionStorage.setItem(STASH_KEY, JSON.stringify({ leadId, pixel }));
  } catch {
    // Storage blocked — the event is simply lost, same as an ad blocker.
  }
}

/**
 * Reads and REMOVES the parked event, so a back-navigation to /thank-you does
 * not find it again; the fired-guard below covers a refresh.
 */
export function takeStashedMetaLead(): PendingMetaLead | null {
  try {
    const raw = sessionStorage.getItem(STASH_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(STASH_KEY);
    const parsed = JSON.parse(raw) as PendingMetaLead;
    return parsed?.pixel?.pixel_id ? parsed : null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------------- *
 * Firing
 * ------------------------------------------------------------------------- */

const firedKey = (leadId: number) => `ep_meta_fired_${leadId}`;

/**
 * Has this lead's Meta event already been sent in this session? Separate from
 * the Ads guard, so neither fire can suppress the other. Storage unavailable
 * answers "no" — a duplicate beats a miss, and the eventID lets a future
 * Conversions API integration dedupe.
 */
function alreadyFired(leadId: number | null): boolean {
  if (leadId == null) return false;
  try {
    return sessionStorage.getItem(firedKey(leadId)) !== null;
  } catch {
    return false;
  }
}

function markFired(leadId: number | null): void {
  if (leadId == null) return;
  try {
    sessionStorage.setItem(firedKey(leadId), "1");
  } catch {
    // Ignored — see alreadyFired.
  }
}

/**
 * Sends the lead's Meta event to the lead's own pixel, once.
 *
 * `null` sends nothing and loads nothing — there is no other pixel to try.
 * The guard is marked BEFORE the fire, so two calls in one tick cannot both
 * get through.
 *
 * @returns whether the event was sent.
 */
export function fireMetaLead(
  leadId: number | null,
  pixel: MetaPixelConfig | null | undefined,
): boolean {
  if (typeof window === "undefined" || !pixel?.pixel_id) return false;
  if (alreadyFired(leadId)) return false;
  markFired(leadId);

  ensureMetaPixel(pixel.pixel_id)?.(
    "trackSingle",
    pixel.pixel_id,
    pixel.event,
    // Only when configured with a value: adding one to a pixel that never
    // carried one rewrites its history rather than continuing it.
    pixel.value != null && pixel.currency ? { value: pixel.value, currency: pixel.currency } : {},
    // The key a server-side Conversions API would dedupe on, matching the
    // transaction_id the Ads conversion carries.
    leadId != null ? { eventID: String(leadId) } : undefined,
  );
  return true;
}

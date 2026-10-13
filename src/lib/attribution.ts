// Marketing attribution — capture UTM / click IDs on landing and persist them
// across navigation (sessionStorage) so every lead payload carries them.

import { isServer } from "solid-js/web";
import type { LeadPayload } from "./types";

const KEY = "ep_attribution";

type Attribution = Pick<
  LeadPayload,
  | "utm_source" | "utm_medium" | "utm_campaign" | "utm_term" | "utm_content"
  | "gclid" | "fbclid" | "landing_page" | "submitted_page"
>;

const PARAM_KEYS = [
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "gclid", "fbclid",
] as const;

/**
 * Read attribution params from the current URL and merge into sessionStorage
 * (first-touch wins for any given field). Call once on landing (client only).
 * Always stamps landing_page to the first page seen this session.
 */
export function captureAttribution(): Attribution {
  if (isServer || typeof window === "undefined") return {};
  const stored = read();
  const url = new URL(window.location.href);
  const incoming: Attribution = {};
  for (const k of PARAM_KEYS) {
    const v = url.searchParams.get(k);
    if (v) (incoming as Record<string, string>)[k] = v;
  }
  const merged: Attribution = { ...incoming, ...stored };
  if (!merged.landing_page) merged.landing_page = window.location.href;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(merged));
  } catch {
    /* storage unavailable (private mode) — non-fatal */
  }
  return merged;
}

/**
 * Current stored attribution, or {} on the server / when empty. Called at
 * submit time, so it also stamps `submitted_page` — the page the lead was
 * actually sent from, which is what the backend attributes and routes on.
 * `landing_page` is first-touch and stays that way; the two differ whenever the
 * visitor moved between pages, and conflating them once risked delivering a
 * lead to the wrong client. Never persisted — it is per-submit, not per-session.
 */
export function getAttribution(): Attribution {
  if (isServer || typeof window === "undefined") return {};
  const stored = read();
  if (!stored.landing_page) stored.landing_page = window.location.href;
  stored.submitted_page = window.location.href;
  return fitToApi(stored);
}

/**
 * The lead API's column limits (OPTIONS /api/v1/leads/). A value over its limit
 * gets the WHOLE lead rejected with a 400 — and ad landings are exactly where
 * that happens: a Google Ads URL with gclid, gbraid and utm params runs ~290
 * chars against a 200-char `landing_page`. Every enquiry from a paid click was
 * being lost while direct visits went through.
 */
const URL_MAX = 200;
const FIELD_MAX: Partial<Record<keyof Attribution, number>> = {
  utm_source: 120, utm_medium: 120,
  utm_campaign: 160, utm_term: 160, utm_content: 160,
  gclid: 255, fbclid: 255,
};

/**
 * A page URL that fits the column. The query string goes first: the click ids
 * and utm values in it are already sent as fields of their own, and CRM routing
 * matches on the path (see lead-attribution notes), so origin + path is what
 * must survive. Only a path that is itself too long is cut.
 */
function fitUrl(href: string | undefined): string | undefined {
  if (!href || href.length <= URL_MAX) return href;
  try {
    const u = new URL(href);
    const bare = u.origin + u.pathname;
    if (bare.length <= URL_MAX) return bare;
  } catch {
    /* not a parseable URL — fall through to a plain cut */
  }
  return href.slice(0, URL_MAX);
}

function fitToApi(a: Attribution): Attribution {
  const out: Attribution = { ...a };
  out.landing_page = fitUrl(a.landing_page);
  out.submitted_page = fitUrl(a.submitted_page);
  for (const [k, max] of Object.entries(FIELD_MAX) as [keyof Attribution, number][]) {
    const v = out[k];
    if (v && v.length > max) out[k] = v.slice(0, max);
  }
  return out;
}

function read(): Attribution {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Attribution) : {};
  } catch {
    return {};
  }
}

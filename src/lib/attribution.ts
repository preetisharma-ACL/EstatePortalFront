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
  return stored;
}

function read(): Attribution {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Attribution) : {};
  } catch {
    return {};
  }
}

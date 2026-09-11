/**
 * Google Ads conversion reporting for a completed enquiry.
 *
 * The conversion action a lead reports to is decided by the BACKEND and arrives
 * on the lead-create response (`LeadResponse.conversion`). That copy is the
 * authoritative one: it reflects the project the lead was actually attributed
 * to, which is not always the project whose page the visitor was on. Never
 * reconstruct it by refetching the project.
 *
 * `conversion: null` means fire nothing. It is not an error — most leads have
 * no project (homepage, township, city and search enquiries), and a project
 * with no label configured reports nothing either.
 *
 * Three things this module exists to get right:
 *
 *   1. The account must be registered on the page before an event can carry a
 *      `send_to` for it — see ensureAdsAccount below.
 *   2. The fire happens on a different page from the submit (the forms that
 *      redirect), so the payload has to survive that navigation — see
 *      stashConversion/takeStashedConversion.
 *   3. It must fire exactly once per lead. Every duplicate is a fake conversion
 *      in the Ads account and feeds Smart Bidding a number that never happened.
 */

import type { ConversionConfig } from "./types";

export type { ConversionConfig };

/** The shared Google Ads account. Campaigns differ by label, not by account. */
export const ADS_ACCOUNT_ID = "AW-16454201362";

/* ------------------------------------------------------------------------- *
 * Base tag
 * ------------------------------------------------------------------------- */

/**
 * Accounts already registered in this document. Module-level, so it resets on a
 * full page load and persists across client-side navigations — exactly the
 * lifetime of the `dataLayer` it guards.
 */
const configured = new Set<string>();

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}

/** gtag.js requires the raw `arguments` object, exactly as its own snippet pushes it. */
function pushGtag(..._args: unknown[]) {
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}

/**
 * Registers a Google Ads account on this page, loading gtag.js for it if needed.
 * Idempotent — safe to call before every fire.
 *
 * WHY THIS IS THE FRONTEND'S JOB:
 *
 * Whether an account is registered is a property of the DOCUMENT, so only code
 * running in the document can answer it. The lead payload deliberately makes no
 * claim either way — it names the account in `conversion_id` and leaves the
 * decision here. (An earlier version of the API did carry a `needs_base_tag`
 * hint, computed from the assumption that AW-16454201362 was loaded site-wide.
 * It is not: src/entry-server.tsx loads only the GA4 tag (G-DJCMEPXJS2), and
 * the Ads account is loaded per page by <GoogleAdsTag>. The field has since
 * been removed from the API.)
 *
 * This registry is correct in both directions. It cannot double-load an account
 * — which is what double-counts conversions — because it checks this set AND
 * the DOM for an existing loader, including the one <GoogleAdsTag> renders into
 * the server-side <head>. And it cannot leave an account unregistered on a page
 * that needs one, which is the worse failure of the two: Google Ads drops such
 * an event silently, so it looks like success.
 *
 * @param scriptAlreadyPresent set by <GoogleAdsTag>, which renders its own
 *   loader through useHead and only needs the `config` half done here.
 */
export function ensureAdsAccount(
  id: string,
  opts: { scriptAlreadyPresent?: boolean } = {},
): void {
  if (!id || typeof window === "undefined" || configured.has(id)) return;
  configured.add(id);

  const alreadyLoaded =
    opts.scriptAlreadyPresent ||
    !!document.querySelector(`script[src*="gtag/js?id=${id}"]`);

  if (!alreadyLoaded) {
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(s);
  }

  // Pushed onto dataLayer rather than called through window.gtag: this works
  // whether or not gtag.js has finished loading, so there is nothing to wait for.
  pushGtag("js", new Date());
  pushGtag("config", id);
}

/* ------------------------------------------------------------------------- *
 * Local fallback — DELETE once labels are configured in the admin
 * ------------------------------------------------------------------------- */

/**
 * Conversion labels hardcoded here before the backend served them.
 *
 * TEMPORARY. Zero projects currently have a label set in the admin, so the
 * backend returns `conversion: null` for every lead. Removing these outright
 * would take the campaigns that do convert down to nothing until the Ads team
 * fills the admin in. The backend value WINS whenever it is present, so each
 * entry becomes dead the moment its project gets a label — at which point this
 * whole block, VITE_GADS_CONVERSION_LABEL and its note in src/global.d.ts
 * should go.
 *
 * Scope matters: this fallback applies ONLY on the campaign path (see
 * campaignConversion). Reaching for it on every lead would start reporting
 * conversions for homepage and township enquiries that have never reported one
 * — traffic the campaigns did not produce, which is precisely the noise
 * Smart Bidding must not be fed.
 */
const LEGACY_LABELS: Record<string, { label: string; value?: number; currency?: string }> = {
  // "Lead - Form Submit SKA"
  "ska-imperia-wave-city": { label: "47LoCJKvhvMcEJLg_KU9", value: 1.0, currency: "INR" },
  // "RG Pal Submit Form"
  "rg-pleiaddes": { label: "1sBICJjskvMcEJLg_KU9", value: 1.0, currency: "INR" },
};

/** Generic enquiry label, for campaign projects without one of their own. */
const LEGACY_DEFAULT_LABEL = import.meta.env.VITE_GADS_CONVERSION_LABEL;

const legacyConversion = (slug: string | undefined): ConversionConfig | null => {
  const entry =
    (slug ? LEGACY_LABELS[slug] : undefined) ??
    (LEGACY_DEFAULT_LABEL ? { label: LEGACY_DEFAULT_LABEL } : undefined);
  if (!entry) return null;
  return {
    send_to: `${ADS_ACCOUNT_ID}/${entry.label}`,
    value: entry.value ?? null,
    currency: entry.currency ?? "INR",
    conversion_id: ADS_ACCOUNT_ID,
  };
};

/**
 * The conversion to report for a lead raised on a CAMPAIGN page — one that
 * redirects to /thank-you because an ad is pointed at it.
 *
 * The backend's value wins. The legacy hardcoded label stands in only while the
 * admin has none, which keeps the campaigns that convert today converting.
 *
 * Every other lead path uses `lead.conversion` directly and reports nothing
 * when it is null. That is the backend's contract — a lead with no project, or
 * a project with no label, has no conversion to report — and it is also the
 * behaviour those paths have always had.
 */
export const campaignConversion = (
  fromApi: ConversionConfig | null | undefined,
  projectSlug: string | undefined,
): ConversionConfig | null => fromApi ?? legacyConversion(projectSlug);

/* ------------------------------------------------------------------------- *
 * Surviving the redirect to /thank-you
 * ------------------------------------------------------------------------- */

const STASH_KEY = "ep_pending_conversion";

export type PendingConversion = { leadId: number | null; conversion: ConversionConfig };

/**
 * Parks a conversion for the page the visitor is about to be redirected to.
 *
 * sessionStorage rather than router state: it survives a full document load, so
 * it does not matter whether /thank-you is reached by client-side navigation or
 * by the browser reloading the URL. Storage being unavailable (private mode,
 * blocked cookies) costs us that one conversion and nothing else.
 */
export function stashConversion(leadId: number | null, conversion: ConversionConfig): void {
  try {
    sessionStorage.setItem(STASH_KEY, JSON.stringify({ leadId, conversion }));
  } catch {
    // Storage blocked — the conversion is simply lost, same as an ad blocker.
  }
}

/**
 * Reads and REMOVES the parked conversion. Removing on read is what stops a
 * back-navigation to /thank-you from finding it again; the fired-guard below
 * covers a plain refresh, where the stash is still there.
 */
export function takeStashedConversion(): PendingConversion | null {
  try {
    const raw = sessionStorage.getItem(STASH_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(STASH_KEY);
    const parsed = JSON.parse(raw) as PendingConversion;
    return parsed?.conversion?.send_to ? parsed : null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------------- *
 * Firing
 * ------------------------------------------------------------------------- */

const firedKey = (leadId: number) => `ep_conv_fired_${leadId}`;

/**
 * Has this lead's conversion already been sent in this session?
 *
 * Keyed on the lead id, so a refresh or a back-button return to /thank-you is
 * recognised as the same lead. When storage is unavailable this answers "no"
 * and we send — a duplicate beats a miss, and Google Ads still dedupes
 * server-side on the transaction_id we attach.
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
 * Sends the Google Ads conversion event for one lead.
 *
 * Distinct from registering the account: a `config` alone reports a page view,
 * never a conversion. Google Ads counts nothing until an event with `send_to`
 * arrives, which is what this sends.
 *
 * The guard is marked BEFORE the push, so two calls in the same tick cannot
 * both get through.
 *
 * @returns whether the event was sent.
 */
export function fireConversion(
  leadId: number | null,
  conversion: ConversionConfig | null | undefined,
): boolean {
  if (typeof window === "undefined") return false;
  if (!conversion?.send_to) return false;
  if (alreadyFired(leadId)) return false;
  markFired(leadId);

  ensureAdsAccount(conversion.conversion_id || ADS_ACCOUNT_ID);

  pushGtag("event", "conversion", {
    send_to: conversion.send_to,
    // Value and currency move together — Google Ads rejects a value with no
    // currency. Both come from the payload: they are per project and editable
    // in the admin.
    ...(conversion.value != null && conversion.currency
      ? { value: conversion.value, currency: conversion.currency }
      : {}),
    // Lets Google Ads dedupe server-side too, as a backstop to the guard above.
    ...(leadId != null ? { transaction_id: String(leadId) } : {}),
  });
  return true;
}

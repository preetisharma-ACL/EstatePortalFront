/**
 * Which Google Ads conversion action a completed enquiry reports to.
 *
 * /thank-you is shared by every campaign project, but Google Ads issues a
 * separate conversion action — and so a separate label — per campaign. Keying
 * the label by project is what keeps one project's leads out of another's
 * conversion count. A project without an entry falls back to the generic
 * enquiry action in the environment.
 */

/** The Google Ads account. The label below completes a `send_to`. */
export const ADS_ACCOUNT_ID = "AW-16454201362";

export type AdsConversionAction = {
  /** Conversion label — the half after the slash in `send_to`. */
  label: string;
  /** Only for actions set up to report a value; omitted, Google Ads counts the conversion alone. */
  value?: number;
  /** ISO currency for `value`; required by Google Ads whenever a value is sent. */
  currency?: string;
};

/**
 * Generic enquiry action, for campaign projects without one of their own.
 * Vite inlines this at BUILD time — see src/global.d.ts.
 */
const DEFAULT_LABEL = import.meta.env.VITE_GADS_CONVERSION_LABEL;

/**
 * Projects with their own conversion action, keyed by the slug /thank-you
 * receives as `?project=`. Straight from the event snippet Google Ads shows
 * under the action's Tag setup. Adding a project is one entry here.
 */
const PROJECT_CONVERSIONS: Record<string, AdsConversionAction> = {
  // "Lead - Form Submit SKA"
  "ska-imperia-wave-city": { label: "47LoCJKvhvMcEJLg_KU9", value: 1.0, currency: "INR" },
  // "RG Pal Submit Form"
  "rg-pleiaddes": { label: "1sBICJjskvMcEJLg_KU9", value: 1.0, currency: "INR" },
};

/** The action for a project slug, or undefined if there is nothing to send. */
export const adsConversionForProject = (
  slug: string | undefined,
): AdsConversionAction | undefined =>
  (slug ? PROJECT_CONVERSIONS[slug] : undefined) ??
  (DEFAULT_LABEL ? { label: DEFAULT_LABEL } : undefined);

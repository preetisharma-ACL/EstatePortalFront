// Canonical URL construction.
//
// Deliberately a hardcoded production origin, not an env var. A canonical must
// name the ONE URL we want indexed, so a preview deploy or staging domain
// rendering this page should still point Google at production — deriving it
// from the request host would have each preview declare itself canonical.
//
// Relative canonicals ("/township/wave-city") resolve against the page URL and
// work today, but Google documents absolute as the recommendation and relative
// ones break under a <base> tag or a proxy that changes the origin.

export const SITE_URL = "https://realestate.aajneeti.social";

/** Absolute canonical for a root-relative path ("/search" -> "https://…/search"). */
export const canonical = (path: string) => `${SITE_URL}${path}`;

/**
 * Absolute form of an asset URL, for social meta tags.
 *
 * og:image MUST be absolute — Facebook, WhatsApp and X resolve it against
 * nothing, not against the page, so a relative path yields no preview card.
 * Backend media arrives absolute already; assets we serve from src/public do
 * not, so they get the site origin. Applied to every og:image regardless of
 * source, since which one a given field carries can change.
 */
export const absoluteUrl = (url: string) =>
  /^https?:\/\//i.test(url) ? url : `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;

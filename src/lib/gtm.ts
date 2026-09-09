/**
 * Google Tag Manager containers, keyed by project slug.
 *
 * GTM is per-project rather than site-wide: the site-wide GA4 tag in
 * entry-server.tsx already covers every other page, and a campaign container
 * has no tags for projects it wasn't set up for — loading it everywhere would
 * only mix other projects' traffic into this campaign's numbers.
 *
 * A project listed here also gets the /thank-you handoff on its enquiry forms
 * (see routes/project/[slug].tsx), because a tag platform counts conversions by
 * URL and an in-place confirmation never changes the URL. /thank-you then loads
 * the same container off its `?project=` slug, so the conversion lands in the
 * container that owns the campaign.
 *
 * Adding a project is one entry here.
 */
const GTM_CONTAINERS: Record<string, string> = {
  "ska-imperia-wave-city": "GTM-KRQSMVLM",
};

/** The container id for a project slug, or undefined if it has none. */
export const gtmContainerFor = (slug: string | undefined): string | undefined =>
  slug ? GTM_CONTAINERS[slug] : undefined;

// Configuration for the /<city>/<type> landing pages and their /<type> hubs.
//
// These exist because the header's Residential and Commercial links used to
// point at /search?project_type=… — query-string result pages that are now
// noindex, leaving two main nav destinations unindexable. Real routes give
// those intents a crawlable page.

import type { ProjectType } from "./types";

/**
 * A /<city>/<type> page needs at least this many projects to be worth
 * indexing. Below it the page still renders and still works — it just carries
 * noindex, so a city with one project can't become a thin-content liability.
 * The hubs link only to cities at or above this bar, and the backend drives the
 * sitemap section off the same rule.
 */
export const MIN_INDEXABLE = 3;

export interface TypePage {
  /** URL segment, and the API's project_type value. */
  slug: Extract<ProjectType, "residential" | "commercial">;
  /** "Residential" — used in headings and breadcrumbs. */
  label: string;
  /** Hub page H1 and eyebrow copy. */
  hubTitle: string;
  hubIntro: string;
  /** Builds the per-city page's meta description. */
  metaDescription: (city: string) => string;
  /** Short blurb under the per-city H1. */
  intro: (city: string) => string;
}

export const TYPE_PAGES: Record<string, TypePage> = {
  residential: {
    slug: "residential",
    label: "Residential",
    hubTitle: "Residential property across India",
    hubIntro:
      "RERA-verified apartments, villas, floors and plots — browse by city, with verified pricing and possession timelines on every project.",
    metaDescription: (city) =>
      `RERA-verified residential projects in ${city}. Compare apartments, villas and plots by budget, configuration and possession date.`,
    intro: (city) =>
      `Every RERA-verified residential project we track in ${city} — apartments, villas, floors and plots, with verified pricing and possession timelines.`,
  },
  commercial: {
    slug: "commercial",
    label: "Commercial",
    hubTitle: "Commercial property across India",
    hubIntro:
      "RERA-verified offices, retail, showrooms and co-working — browse by city, with verified pricing and yield-relevant detail on every project.",
    metaDescription: (city) =>
      `RERA-verified commercial projects in ${city}. Compare offices, retail and showroom space by budget, size and possession date.`,
    intro: (city) =>
      `Every RERA-verified commercial project we track in ${city} — offices, retail, showrooms and co-working, with verified pricing and possession timelines.`,
  },
};

export const getTypePage = (slug: string): TypePage | null =>
  TYPE_PAGES[slug] ?? null;

// Shared city resolution for the lead forms.
//
// The lead endpoint stores a city *slug* tied to a real city record — there is
// no free-text city field on it. So whatever a user types has to be matched back
// to a known city; anything unrecognised is carried in `message` rather than
// being silently dropped. Both lead forms show the same three fields, so they
// share this rule instead of each keeping its own copy.

import type { CityList } from "./types";

/** Lowercase, collapse punctuation/whitespace — "New  Delhi!" -> "new-delhi". */
export const normalizeCity = (s: string) =>
  s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export interface ResolvedCity {
  city_slug: string | undefined;
  /** Set only when the typed city matched nothing — preserves what was entered. */
  message: string | undefined;
}

/**
 * Match a typed city against known city records.
 * `fallbackSlug` is the page's own city (a project's or township's), used when
 * the field is blank or the entry can't be matched.
 */
export function resolveCity(
  typed: string | undefined,
  cities: CityList[],
  fallbackSlug?: string,
): ResolvedCity {
  if (!typed) return { city_slug: fallbackSlug, message: undefined };
  const key = normalizeCity(typed);
  const hit = cities.find((c) => c.slug === key || normalizeCity(c.name) === key);
  return hit
    ? { city_slug: hit.slug, message: undefined }
    : { city_slug: fallbackSlug, message: `City entered by user: ${typed}` };
}

// Cached query wrappers for route preload + createAsync().
// query() dedupes a fetch per-request (SSR) and caches on the client.

import { query } from "@solidjs/router";
import * as api from "./api";
import { ApiError } from "./api";
import type { TownshipSource } from "./townships";
import type { Locality, ProjectFilters, ProjectListItem, ProjectDetail } from "./types";

// A 404 on a detail lookup means "no such slug" — resolve to null instead of
// throwing, so the route renders a graceful NotFound. A rejected deferStream
// resource cannot be recovered from and would crash the SSR stream.
async function orNull404<T>(p: Promise<T>): Promise<T | null> {
  try {
    return await p;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export const projectsQuery = query(
  (filters: ProjectFilters) => api.getProjects(filters),
  "projects",
);

/**
 * A township's inventory.
 *
 * Preferred path — `source.township`: one ?township= request. Membership is a
 * database relationship spanning the township and its descendant sectors, so
 * it is exact.
 *
 * Fallback path — `source.terms`: one `search` request per term, merged and
 * deduplicated by slug, minus `source.exclude`. Only for townships the backend
 * has no locality record for yet; `search` is fuzzy and pulls in neighbours.
 *
 * Either way this fetches one large page rather than following pagination —
 * townships run to a couple of dozen projects. A township exceeding 100 would
 * silently truncate, which is worth revisiting if one ever gets that big.
 */
export const townshipProjectsQuery = query(
  async (source: TownshipSource, filters: ProjectFilters) => {
    const base = { ...filters, page: undefined, page_size: 100 };

    if (source.township) {
      const page = await api.getProjects({ ...base, township: source.township });
      return page.results;
    }

    const pages = await Promise.all(
      (source.terms ?? []).map((search) => api.getProjects({ ...base, search })),
    );
    const exclude = new Set(source.exclude ?? []);
    const seen = new Set<string>();
    const results: ProjectListItem[] = [];
    for (const p of pages.flatMap((page) => page.results)) {
      if (exclude.has(p.slug) || seen.has(p.slug)) continue;
      seen.add(p.slug);
      results.push(p);
    }
    return results;
  },
  "township-projects",
);

/**
 * Project count per city for one project type, for the /<type> hub.
 *
 * There is no aggregate endpoint, so this walks the type's projects and tallies
 * by city. page_size is capped at 100 server-side, so page 1 establishes the
 * total and the remaining pages are fetched in parallel rather than in series.
 * ~300 residential projects is 4 requests; commercial is 1.
 */
export const cityTypeCountsQuery = query(
  async (projectType: "residential" | "commercial") => {
    const first = await api.getProjects({ project_type: projectType, page_size: 100 });
    const pages = Math.ceil(first.count / 100);
    const rest = await Promise.all(
      Array.from({ length: Math.max(0, pages - 1) }, (_, i) =>
        api.getProjects({ project_type: projectType, page: i + 2, page_size: 100 }),
      ),
    );

    const counts = new Map<string, { slug: string; name: string; count: number }>();
    for (const p of [first, ...rest].flatMap((r) => r.results)) {
      const { city_slug, city } = p.location;
      const hit = counts.get(city_slug) ?? { slug: city_slug, name: city, count: 0 };
      hit.count += 1;
      counts.set(city_slug, hit);
    }
    return [...counts.values()].sort((a, b) => b.count - a.count);
  },
  "city-type-counts",
);

/**
 * Every list field on the project detail payload.
 *
 * The page reads sixteen of these with `.length`, `.filter` or `.map`, and a
 * field that leaves the payload becomes undefined rather than empty — so
 * `.length` throws and the whole page renders the error boundary instead of one
 * missing section. That is not hypothetical: considerations_list was removed
 * from the API and took all 361 project pages down until the frontend caught up.
 *
 * A dropped LIST is strictly worse than a dropped scalar, which merely degrades
 * to falsy and hides its section. Defaulting them here turns that outage into
 * exactly the same graceful hide, in one place rather than sixteen.
 *
 * This does not hide a genuine problem: the section disappears, and the backend's
 * nightly sweep checks each page still renders its own name, so a page gutted by
 * a contract change is still caught.
 *
 * A NEW list field needs adding here — until then it is only as safe as the
 * optional chaining at its call site.
 */
const PROJECT_LIST_FIELDS = [
  "highlights_list", "amenities", "configurations", "rera_registrations",
  "media", "documents", "location_advantages", "key_features", "faqs",
  "updates", "specifications", "investment_points", "buyer_profiles",
  "nearby_projects", "why_choose_points",
] as const;

function withProjectLists(p: ProjectDetail | null): ProjectDetail | null {
  if (!p) return p;
  for (const field of PROJECT_LIST_FIELDS) {
    if (!Array.isArray(p[field])) (p as unknown as Record<string, unknown>)[field] = [];
  }
  return p;
}

export const projectQuery = query(
  async (slug: string) => withProjectLists(await orNull404(api.getProject(slug))),
  "project",
);

export const developersQuery = query(
  (params: { search?: string; ordering?: string; page?: number }) =>
    api.getDevelopers(params),
  "developers",
);

export const developerQuery = query(
  (slug: string) => orNull404(api.getDeveloper(slug)),
  "developer",
);

export const citiesQuery = query(
  (params: { state?: string; tier?: number; search?: string; page?: number }) =>
    api.getCities(params),
  "cities",
);

export const cityQuery = query(
  (slug: string) => orNull404(api.getCity(slug)),
  "city",
);

export const localitiesQuery = query(
  (params: { city?: string; state?: string; search?: string; page?: number }) =>
    api.getLocalities(params),
  "localities",
);

/**
 * One locality by slug, or null when it doesn't exist.
 *
 * Resolving to null (rather than leaving the component to infer "missing" from
 * an undefined list) lets the route render NotFound on its FIRST pass, so the
 * 404 status and <title> are committed before the response is flushed.
 *
 * ALWAYS pass the city. Locality slugs are unique per city, not globally —
 * eleven are shared across cities (sector-76 is both a Gurugram and a Noida
 * locality) — so a bare slug is ambiguous, and the API answers 400 rather than
 * guessing. Leaving it off took three locality pages to a 500 in production.
 *
 * The API filters on it, so a slug that exists under a different city comes back
 * 404 and never resolves under the wrong one.
 *
 * Both arguments form the cache key, so every caller must pass the SAME pair to
 * share one request — the header and the route beneath it do.
 */
export const localityQuery = query(
  (slug: string, city: string) => orNull404(api.getLocality(slug, city)),
  "locality",
);

export const amenitiesQuery = query(
  (category?: string) => api.getAmenities(category ? { category } : {}),
  "amenities",
);

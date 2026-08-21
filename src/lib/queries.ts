// Cached query wrappers for route preload + createAsync().
// query() dedupes a fetch per-request (SSR) and caches on the client.

import { query } from "@solidjs/router";
import * as api from "./api";
import { ApiError } from "./api";
import type { TownshipSource } from "./townships";
import type { Locality, ProjectFilters, ProjectListItem } from "./types";

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

export const projectQuery = query(
  (slug: string) => orNull404(api.getProject(slug)),
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
 * Every locality in a city, following pagination so a locality sitting on a
 * later page can never be mistaken for a 404.
 */
async function fetchAllLocalities(city: string): Promise<Locality[]> {
  const all: Locality[] = [];
  for (let page = 1; page <= 50; page++) {
    const res = await api.getLocalities({ city, page });
    all.push(...res.results);
    if (!res.next) break;
  }
  return all;
}

/**
 * Resolve one locality by slug within a city, or null when it doesn't exist.
 * Resolving to null (rather than leaving the component to infer "missing" from
 * an undefined list) lets the route render NotFound on its FIRST pass, so the
 * 404 status and <title> are committed before the response is flushed.
 */
export const localityQuery = query(
  async (city: string, slug: string) =>
    (await fetchAllLocalities(city)).find((l) => l.slug === slug) ?? null,
  "locality",
);

export const amenitiesQuery = query(
  (category?: string) => api.getAmenities(category ? { category } : {}),
  "amenities",
);

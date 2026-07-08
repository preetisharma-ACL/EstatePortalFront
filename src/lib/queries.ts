// Cached query wrappers for route preload + createAsync().
// query() dedupes a fetch per-request (SSR) and caches on the client.

import { query } from "@solidjs/router";
import * as api from "./api";
import { ApiError } from "./api";
import type { Locality, ProjectFilters } from "./types";

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

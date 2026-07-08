// Cached query wrappers for route preload + createAsync().
// query() dedupes a fetch per-request (SSR) and caches on the client.

import { query } from "@solidjs/router";
import * as api from "./api";
import { ApiError } from "./api";
import type { ProjectFilters } from "./types";

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

export const amenitiesQuery = query(
  (category?: string) => api.getAmenities(category ? { category } : {}),
  "amenities",
);

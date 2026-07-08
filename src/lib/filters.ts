// Map URL query params <-> ProjectFilters. Filters live in the URL so results
// are shareable and SSR-able; the grid reads filters back from the URL.

import type { ProjectFilters, ProjectType, ProjectStatus, ConfigSubType } from "./types";

type Params = Record<string, string | string[] | undefined>;

const PROJECT_TYPES = new Set(["residential", "commercial", "mixed"]);
const STATUSES = new Set([
  "prelaunch", "under_construction", "ready_to_move", "completed",
]);
const ORDERINGS = new Set([
  "price_min", "-price_min", "created_at", "-created_at",
  "possession_date", "-possession_date",
]);

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const numOr = (v: string | string[] | undefined) => {
  const s = first(v);
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
};

/** Build a ProjectFilters object from route search params. */
export function filtersFromParams(params: Params, overrides: Partial<ProjectFilters> = {}): ProjectFilters {
  const f: ProjectFilters = {};
  const type = first(params.project_type);
  if (type && PROJECT_TYPES.has(type)) f.project_type = type as ProjectType;
  const status = first(params.status);
  if (status && STATUSES.has(status)) f.status = status as ProjectStatus;

  const s = (k: keyof ProjectFilters, v?: string) => {
    if (v) (f as Record<string, unknown>)[k] = v;
  };
  s("city", first(params.city));
  s("state", first(params.state));
  s("locality", first(params.locality));
  s("developer", first(params.developer));
  s("amenity", first(params.amenity));
  s("search", first(params.search));
  if (first(params.sub_type)) f.sub_type = first(params.sub_type) as ConfigSubType;

  const bhk = numOr(params.bhk);
  if (bhk !== undefined) f.bhk = bhk;
  const minP = numOr(params.min_price);
  if (minP !== undefined) f.min_price = minP;
  const maxP = numOr(params.max_price);
  if (maxP !== undefined) f.max_price = maxP;
  const minA = numOr(params.min_area);
  if (minA !== undefined) f.min_area = minA;
  const maxA = numOr(params.max_area);
  if (maxA !== undefined) f.max_area = maxA;

  if (first(params.is_featured) === "true") f.is_featured = true;

  const ordering = first(params.ordering);
  if (ordering && ORDERINGS.has(ordering)) f.ordering = ordering as ProjectFilters["ordering"];

  const page = numOr(params.page);
  if (page && page > 1) f.page = page;

  return { ...f, ...overrides };
}

/** Count active user-facing filters (for a "clear" affordance / badge). */
export function activeFilterCount(f: ProjectFilters): number {
  const keys: (keyof ProjectFilters)[] = [
    "project_type", "status", "bhk", "sub_type",
    "min_price", "max_price", "min_area", "max_area", "amenity",
  ];
  return keys.filter((k) => f[k] !== undefined).length;
}

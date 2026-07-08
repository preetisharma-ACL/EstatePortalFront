// EstatePortal API client - typed, SSR-safe fetch wrapper.
// Works on both the SolidStart server (SSR/preload) and the client.

import type {
  Paginated, Country, State, CityList, CityDetail, Locality,
  DeveloperList, DeveloperDetail, Amenity,
  ProjectListItem, ProjectDetail, ProjectFilters,
  AutocompleteResponse, LeadPayload, LeadResponse,
} from "./types";

const API_BASE =
  (typeof process !== "undefined" && process.env && process.env.API_BASE_URL) ||
  (import.meta as any).env?.VITE_API_BASE_URL ||
  "http://localhost:8000";

const API_V1 = `${API_BASE}/api/v1`;

export class ApiError extends Error {
  status: number;
  detail: unknown;
  constructor(status: number, detail: unknown) {
    super(`API error ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

function qs(params: Record<string, unknown> = {}): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") sp.append(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

async function getJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_V1}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    let detail: unknown = undefined;
    try { detail = await res.json(); } catch { /* non-JSON error body */ }
    throw new ApiError(res.status, detail);
  }
  return (await res.json()) as T;
}

export const getProjects = (filters: ProjectFilters = {}) =>
  getJSON<Paginated<ProjectListItem>>(`/projects/${qs(filters as Record<string, unknown>)}`);

export const getProject = (slug: string) =>
  getJSON<ProjectDetail>(`/projects/${encodeURIComponent(slug)}/`);

export const getDevelopers = (
  params: { search?: string; ordering?: string; page?: number } = {},
) => getJSON<Paginated<DeveloperList>>(`/developers/${qs(params)}`);

export const getDeveloper = (slug: string) =>
  getJSON<DeveloperDetail>(`/developers/${encodeURIComponent(slug)}/`);

export const getCities = (
  params: { state?: string; country?: string; tier?: number; search?: string; page?: number } = {},
) => getJSON<Paginated<CityList>>(`/cities/${qs(params)}`);

export const getCity = (slug: string) =>
  getJSON<CityDetail>(`/cities/${encodeURIComponent(slug)}/`);

export const getLocalities = (
  params: { city?: string; state?: string; locality_type?: string; search?: string; page?: number } = {},
) => getJSON<Paginated<Locality>>(`/localities/${qs(params)}`);

export const getStates = (params: { country__slug?: string } = {}) =>
  getJSON<Paginated<State>>(`/states/${qs(params)}`);

// countries and amenities have pagination disabled on the backend -> PLAIN ARRAYS.
export const getCountries = () => getJSON<Country[]>(`/countries/`);
export const getAmenities = (params: { category?: string } = {}) =>
  getJSON<Amenity[]>(`/amenities/${qs(params)}`);

export const autocomplete = (q: string) =>
  getJSON<AutocompleteResponse>(`/search/autocomplete/${qs({ q })}`);

export const submitLead = (payload: LeadPayload) =>
  getJSON<LeadResponse>(`/leads/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

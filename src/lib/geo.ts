import { num } from "./format";

/** Generous bounding box for India, including the islands. */
const INDIA = { minLat: 6, maxLat: 37.5, minLon: 67, maxLon: 98 };

export type LatLon = { lat: number; lon: number };

/**
 * A usable map position, or null.
 *
 * Every project on this portal is in India — RERA is Indian law, and the site
 * says so on its own tin — so a pin outside the country is certainly a data
 * error, and this box is a far tighter test than a valid-latitude one. It
 * subsumes the 0,0 null-island case and catches swapped lat/long, which is the
 * more dangerous of the two: a swap produces a confident pin in Xinjiang rather
 * than an obvious tell.
 *
 * Not hypothetical. m3m-the-line was stored as 0.285700 rather than 28.570000 —
 * a shifted decimal that put the pin in the Indian Ocean and rendered as a
 * confident, completely wrong location. A plausible wrong pin on a property page
 * is worse than no pin, because nobody re-checks a map that looks fine.
 *
 * THIS IS THE ONLY COORDINATE TEST. Anything deciding whether to show map-related
 * content must ask this rather than testing the raw fields — a section gated on
 * "are there coordinates?" and a map gated on "are they usable?" disagree the
 * moment a value is present but invalid, and the section then renders its
 * heading over nothing. That is exactly what happened when the guard was first
 * added and the two tests were separate.
 *
 * Widen the box if the portal ever lists outside India.
 */
export function mapCoords(
  latitude: string | number | null | undefined,
  longitude: string | number | null | undefined,
): LatLon | null {
  const lat = num(latitude ?? null);
  const lon = num(longitude ?? null);
  if (lat === null || lon === null) return null;
  if (lat < INDIA.minLat || lat > INDIA.maxLat) return null;
  if (lon < INDIA.minLon || lon > INDIA.maxLon) return null;
  return { lat, lon };
}

/** Whether a map would render — the gate for any map-related section. */
export const hasMapCoords = (
  latitude: string | number | null | undefined,
  longitude: string | number | null | undefined,
): boolean => mapCoords(latitude, longitude) !== null;

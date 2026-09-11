import { Show, createMemo } from "solid-js";
import { num } from "~/lib/format";

/** Generous bounding box for India, including the islands. */
const INDIA = { minLat: 6, maxLat: 37.5, minLon: 67, maxLon: 98 };

/**
 * The project's position on a map, plus a link out to Google Maps.
 *
 * WHY OPENSTREETMAP RATHER THAN GOOGLE: the Google Maps Embed API needs an API
 * key and is billable, and no key exists in this project — so picking it would
 * mean committing the client to a cost they have not agreed to, and shipping a
 * section that renders nothing until someone provisions one. OSM's embed needs
 * no key, costs nothing, adds no library to the bundle, and draws the same pin.
 *
 * The "View on Google Maps" link covers the familiar experience — directions,
 * Street View, saving the place — and needs no key either, so the visitor loses
 * nothing. If the client does want Google's tiles inline, this component is the
 * only thing that changes.
 *
 * An iframe rather than Leaflet for the same reason the rest of this page is
 * server-rendered: it is one lazy-loaded element far down a long page, and a
 * mapping library would cost every visitor bundle weight most never scroll to.
 *
 * Renders nothing without BOTH coordinates — 157 of 361 projects have none, so
 * that is the common path rather than an edge case.
 */
export default function ProjectMap(props: {
  latitude: string | null;
  longitude: string | null;
  name: string;
}) {
  const coords = createMemo(() => {
    const lat = num(props.latitude);
    const lon = num(props.longitude);
    if (lat === null || lon === null) return null;
    // Every project on this portal is in India — RERA is Indian law, and the
    // site says so on its own tin. So a pin outside the country is certainly a
    // data error, and this box is a far tighter test than a valid-latitude one.
    //
    // It is not hypothetical: m3m-the-line was stored as 0.285700 rather than
    // 28.570000, a shifted decimal that put the pin in the Indian Ocean and
    // rendered as a confident, completely wrong location. A plausible wrong pin
    // on a property page is worse than no pin — nobody checks a map that looks
    // fine — and it took a hand audit of 204 pairs to find. This catches that
    // whole class of error, including 0,0, without one.
    //
    // Widen the box if the portal ever lists outside India.
    if (lat < INDIA.minLat || lat > INDIA.maxLat) return null;
    if (lon < INDIA.minLon || lon > INDIA.maxLon) return null;
    return { lat, lon };
  });

  /** A small box around the pin — roughly a kilometre across at this latitude. */
  const bbox = (lat: number, lon: number) => {
    const d = 0.008;
    return [lon - d, lat - d, lon + d, lat + d].map((v) => v.toFixed(6)).join(",");
  };

  const embedSrc = () => {
    const c = coords()!;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox(c.lat, c.lon)}&layer=mapnik&marker=${c.lat},${c.lon}`;
  };

  const googleHref = () => {
    const c = coords()!;
    return `https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lon}`;
  };

  return (
    <Show when={coords()}>
      <div class="mx-auto max-w-5xl">
        <div class="overflow-hidden rounded-[14px] border border-line bg-card">
          <iframe
            src={embedSrc()}
            title={`Map showing the location of ${props.name}`}
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            class="block h-[380px] w-full border-0 sm:h-[440px]"
          />
        </div>

        <div class="mt-5 flex justify-center">
          <a
            href={googleHref()}
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 rounded-[var(--radius-btn)] border border-navy/25 bg-card px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" class="shrink-0" aria-hidden="true">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            View on Google Maps
          </a>
        </div>
      </div>
    </Show>
  );
}

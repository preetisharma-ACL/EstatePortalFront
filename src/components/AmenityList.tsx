import { For, Show, createMemo, type JSX } from "solid-js";
import type { Amenity, AmenityCategory } from "~/lib/types";

/**
 * Sort order, not display grouping.
 *
 * The API returns amenities in insertion order, which differs between projects
 * — the same two amenities can swap places from one page to the next. Sorting
 * by category then name makes the grid stable across the catalogue, and keeps
 * related amenities adjacent without spending a heading on each group. At a
 * median of eight per project most groups would hold one or two items, and a
 * column of near-empty headings reads worse than a flat grid.
 */
const CATEGORY_ORDER: AmenityCategory[] = [
  "leisure", "sports", "convenience", "safety", "environment", "connectivity",
];

const rank = (c: AmenityCategory) => {
  const i = CATEGORY_ORDER.indexOf(c);
  return i === -1 ? CATEGORY_ORDER.length : i;
};

/**
 * Icons for the whole amenity vocabulary — 14 items across 6 categories, closed
 * and small enough to hand-map.
 *
 * Keyed by the backend's `icon` slug where it supplies one, and by the amenity's
 * own `slug` for the six that have none. The two key spaces do not overlap, so
 * one map serves both: iconFor() tries `icon` first, then `slug`. Anything
 * added to the vocabulary later falls through to a check mark, which reads as
 * "included" rather than as a missing asset.
 *
 * Paths are 24x24 and stroked, matching the icons already inline in the routes.
 */
const ICONS: Record<string, JSX.Element> = {
  // --- by backend `icon` slug -------------------------------------------
  metro: (
    <>
      <rect x="5" y="3" width="14" height="13" rx="3" />
      <path d="M5 10h14" />
      <path d="M9 16l-2 4M15 16l2 4" />
    </>
  ),
  power: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
  tree: (
    <>
      <circle cx="12" cy="9" r="6" />
      <path d="M12 15v7" />
    </>
  ),
  clubhouse: (
    <>
      <path d="M3 10 12 3l9 7" />
      <path d="M5 10v11h14V10" />
      <path d="M10 21v-6h4v6" />
    </>
  ),
  play: (
    <>
      <path d="M12 14a5 6 0 1 0 0-12 5 6 0 0 0 0 12Z" />
      <path d="M12 14v3" />
      <path d="M10.5 20a1.5 1.5 0 0 1 3 0" />
    </>
  ),
  pool: (
    <>
      <path d="M2 14c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2 2.5-2 5-2" />
      <path d="M2 19c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2 2.5-2 5-2" />
      <path d="M8 12V5a2 2 0 1 1 4 0" />
    </>
  ),
  shield: <path d="M12 2 4 6v6c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V6l-8-4Z" />,
  gym: (
    <>
      <path d="M6.5 6.5v11M17.5 6.5v11" />
      <path d="M3.5 9v6M20.5 9v6" />
      <path d="M6.5 12h11" />
    </>
  ),

  // --- by amenity slug, for the six the backend has no icon for ---------
  "ample-parking": (
    <>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M9.5 17V7h3.2a3 3 0 0 1 0 6H9.5" />
    </>
  ),
  "high-footfall-retail-frontage": (
    <>
      <path d="M3 6h18l-1 4H4L3 6Z" />
      <path d="M4 10v10h16V10" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  "multipurpose-hall": (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  "wide-internal-roads": (
    <>
      <path d="M4 21 8 3" />
      <path d="M20 21 16 3" />
      <path d="M12 6v3M12 12v3M12 18v2" />
    </>
  ),
  "badminton-court": (
    <>
      <circle cx="9.5" cy="9.5" r="5.5" />
      <path d="M13.5 13.5 20 20" />
    </>
  ),
  "sports-courts": (
    <>
      <rect x="2" y="5" width="20" height="14" rx="1" />
      <path d="M12 5v14" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
};

/** Generic "included" mark — only reached by an amenity added after this map. */
const FALLBACK_ICON = <path d="M20 6 9 17l-5-5" />;

const iconFor = (a: Amenity): JSX.Element =>
  ICONS[a.icon] ?? ICONS[a.slug] ?? FALLBACK_ICON;

/**
 * The amenity grid for a project.
 *
 * Renders nothing at all when the project has none — three projects in the
 * catalogue, and an "available on request" placeholder would be a promise the
 * page cannot keep.
 */
export default function AmenityList(props: { amenities: Amenity[] }) {
  const sorted = createMemo(() =>
    [...props.amenities].sort(
      (a, b) => rank(a.category) - rank(b.category) || a.name.localeCompare(b.name),
    ),
  );

  return (
    <Show when={props.amenities.length}>
      <ul class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <For each={sorted()}>
          {(a) => (
            <li class="card-lift flex items-center gap-3 rounded-[12px] border border-line bg-card px-4 py-3.5">
              <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold/12 text-gold">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  {iconFor(a)}
                </svg>
              </span>
              <span class="text-sm font-medium leading-snug text-navy/85">{a.name}</span>
            </li>
          )}
        </For>
      </ul>
    </Show>
  );
}

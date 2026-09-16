import { For, Show, type JSX } from "solid-js";
import type { LocationAdvantage } from "~/lib/types";

/**
 * Landmark icons, matched against the label text.
 *
 * `category` cannot drive this: it is a five-way split the backend uses to
 * choose which of the two tables a row lands in, and in practice most rows come
 * back "connectivity" regardless of what they name — schools and malls included.
 * The label is the only field that distinguishes a metro from an airport.
 *
 * Patterns were drawn from the labels actually in the catalogue (660 of them
 * across 70 projects); the frequent nouns are metro, station, expressway,
 * hospital, airport, school, road, mall and golf, so those earn a glyph and
 * everything else falls through to a map pin — which reads as "a place",
 * not as a missing asset.
 */
const LANDMARKS: { test: RegExp; icon: JSX.Element }[] = [
  // Plane
  { test: /airport|\bigi\b|terminal|aerocity/i,
    icon: <path d="M10.5 20.5 12 15l-7 1.5v-2l7-4V5a1.5 1.5 0 0 1 3 0v5.5l7 4v2L15 15l1.5 5.5-2.25-1.5h-1.5Z" /> },
  // Metro car
  { test: /metro|\brrts\b|rapid rail/i,
    icon: <><rect x="5" y="3" width="14" height="13" rx="3" /><path d="M5 10h14" /><path d="M9 16l-2 4M15 16l2 4" /></> },
  // Train
  { test: /railway|\btrain\b|junction/i,
    icon: <><rect x="6" y="3" width="12" height="11" rx="2" /><path d="M6 9h12M9 18l-2 3M15 18l2 3M8 14h.01M16 14h.01M9 18h6" /></> },
  // Bus
  { test: /\bbus\b|isbt|depot/i,
    icon: <><rect x="4" y="4" width="16" height="12" rx="2" /><path d="M4 11h16M7 20v-2M17 20v-2M8 16h.01M16 16h.01" /></> },
  // Road
  { test: /expressway|highway|peripheral|\bnh[- ]?\d|\broad\b|marg|flyover|flyway|corridor|chowk|\bbypass\b/i,
    icon: <><path d="M6 21 9 3M18 21l-3-18" /><path d="M12 5v3M12 11v3M12 17v3" /></> },
  // Hospital cross
  { test: /hospital|medical|clinic|medanta|fortis|apollo|speciality|healthcare|nursing/i,
    icon: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M12 9v6M9 12h6" /></> },
  // Graduation cap
  { test: /school|college|university|academy|vidyalaya|institute|education|campus|\bdps\b/i,
    icon: <><path d="M12 4 2 9l10 5 10-5-10-5Z" /><path d="M6 11.5V16c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4.5" /></> },
  // Shopping bag
  { test: /mall|shopping|market|retail|commercial|plaza|entertainment|bazaar/i,
    icon: <><path d="M6 7h12l-1 13H7L6 7Z" /><path d="M9 7V5a3 3 0 0 1 6 0v2" /></> },
  // Golf flag
  { test: /golf/i,
    icon: <><path d="M7 21V3l9 4-9 4" /><path d="M7 21h8" /></> },
  // Tree
  { test: /\bpark\b|garden|forest|\bgreen\b|biodiversity/i,
    icon: <><path d="M12 3 6 12h3l-3 5h12l-3-5h3L12 3Z" /><path d="M12 17v4" /></> },
  // Office tower
  { test: /cyber|business|corporate|\boffice|tech|\bhub\b|\bsez\b|industrial|udyog|\bimt\b/i,
    icon: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01M9 15h.01M15 15h.01" /></> },
];

/** Map pin — the fallback, and deliberately not a question mark. */
const PIN: JSX.Element = (
  <><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z" /><circle cx="12" cy="10" r="2.6" /></>
);

/**
 * The glyph whose keyword appears EARLIEST in the label.
 *
 * Labels routinely name two things — "Schools & Hospitals", "Golf Course Road"
 * — and taking the first rule in list order would let the table's icon contradict
 * the phrase's own subject. Position picks the noun the label leads with.
 */
function iconFor(label: string): JSX.Element {
  let best: { at: number; icon: JSX.Element } | null = null;
  for (const { test, icon } of LANDMARKS) {
    const at = label.search(test);
    if (at !== -1 && (best === null || at < best.at)) best = { at, icon };
  }
  return best ? best.icon : PIN;
}

/**
 * Distances and travel times to landmarks, as a table.
 *
 * Used twice on the project page, split on `category`: connectivity goes in
 * "Connectivity & Accessibility", and schools/hospitals/shopping/employment in
 * "Nearby Infrastructure".
 *
 * EVERY UNVERIFIED FIGURE CARRIES ITS PROVENANCE. A developer's "5 min" becomes
 * "5 min" plus a "marketing estimate" tag — the wording comes from
 * `source_display`, and it is never dropped to tidy the table. That tag is the
 * whole difference between a claim and a measurement, and a buyer planning a
 * commute deserves to know which one they are reading. It is set apart from the
 * figure rather than trailing it in grey, so it cannot be skimmed as part of
 * the number.
 *
 * `time_or_distance` is the older single free-text field, kept as the fallback
 * for records written before distance and travel_time were split apart.
 */
export default function LocationTable(props: { items: LocationAdvantage[] }) {
  const hasDistance = () => props.items.some((i) => i.distance?.trim());
  const hasTime = () => props.items.some((i) => i.travel_time?.trim() || i.time_or_distance?.trim());

  return (
    <div class="mx-auto max-w-4xl overflow-x-auto rounded-[14px] border border-line bg-card">
      <table class="w-full min-w-[380px] border-collapse text-sm">
        <thead>
          <tr class="border-b border-line bg-paper">
            <Th>Landmark</Th>
            <Show when={hasDistance()}><Th>Distance</Th></Show>
            <Show when={hasTime()}><Th>Travel time</Th></Show>
          </tr>
        </thead>
        <tbody>
          <For each={props.items}>
            {(a) => (
              <tr class="border-b border-line transition-colors last:border-b-0 hover:bg-paper/60">
                <td class="px-5 py-3.5">
                  <span class="flex items-center gap-3">
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
                        {iconFor(a.label)}
                      </svg>
                    </span>
                    <span class="font-semibold text-navy">{a.label}</span>
                  </span>
                </td>
                <Show when={hasDistance()}>
                  <td class="px-5 py-3.5 text-slate">{a.distance?.trim() || "—"}</td>
                </Show>
                <Show when={hasTime()}>
                  <td class="px-5 py-3.5 text-slate">
                    <span class="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span class="font-medium text-navy/90">
                        {a.travel_time?.trim() || a.time_or_distance?.trim() || "—"}
                      </span>
                      {/* Never omitted — see the note above the component. */}
                      <Show when={a.source && a.source !== "verified" && a.source_display}>
                        <span class="whitespace-nowrap rounded-full border border-line bg-paper px-2 py-0.5 text-[11px] leading-[1.6] text-slate">
                          {a.source_display.toLowerCase()}
                        </span>
                      </Show>
                    </span>
                  </td>
                </Show>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
}

function Th(props: { children: JSX.Element }) {
  return (
    <th class="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate">
      {props.children}
    </th>
  );
}

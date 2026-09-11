import { For, Show } from "solid-js";
import type { LocationAdvantage } from "~/lib/types";

/**
 * Distances and travel times to landmarks, as a table.
 *
 * Used twice on the project page, split on `category`: connectivity goes in
 * "Connectivity & Accessibility", and schools/hospitals/shopping/employment in
 * "Nearby Infrastructure".
 *
 * EVERY UNVERIFIED FIGURE CARRIES ITS PROVENANCE. A developer's "5 min" becomes
 * "5 min (marketing estimate)" — the wording comes from `source_display`, and
 * it is never dropped to tidy the table. That suffix is the whole difference
 * between a claim and a measurement, and a buyer planning a commute deserves to
 * know which one they are reading.
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
            <th class="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate">
              Landmark
            </th>
            <Show when={hasDistance()}>
              <th class="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate">
                Distance
              </th>
            </Show>
            <Show when={hasTime()}>
              <th class="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate">
                Travel time
              </th>
            </Show>
          </tr>
        </thead>
        <tbody>
          <For each={props.items}>
            {(a) => (
              <tr class="border-b border-line last:border-b-0">
                <td class="px-5 py-3.5">
                  <span class="font-semibold text-navy">{a.label}</span>
                </td>
                <Show when={hasDistance()}>
                  <td class="px-5 py-3.5 text-slate">{a.distance?.trim() || "—"}</td>
                </Show>
                <Show when={hasTime()}>
                  <td class="px-5 py-3.5 text-slate">
                    <span class="flex flex-wrap items-baseline gap-x-1.5">
                      <span>{a.travel_time?.trim() || a.time_or_distance?.trim() || "—"}</span>
                      {/* Never omitted — see the note above the component. */}
                      <Show when={a.source && a.source !== "verified" && a.source_display}>
                        <span class="whitespace-nowrap text-[11px] text-slate/80">
                          ({a.source_display.toLowerCase()})
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

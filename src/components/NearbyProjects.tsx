import { A } from "@solidjs/router";
import { For, Show } from "solid-js";
import type { NearbyProject } from "~/lib/types";
import { priceRangeDisplay } from "~/lib/format";

/**
 * Comparable projects nearby.
 *
 * Read from the real project records rather than authored copy, so every row
 * links to that project's page. Their prices obey the same verification rule as
 * this project's — a comparison built on unverified figures presented as firm
 * would be worse than no comparison.
 */
export default function NearbyProjects(props: { projects: NearbyProject[] }) {
  return (
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <For each={props.projects}>
        {(n) => (
          <A
            href={`/project/${n.slug}`}
            class="card-lift flex flex-col rounded-[14px] border border-line bg-card p-6 transition-colors hover:border-gold"
          >
            <h3 class="font-display text-lg font-semibold leading-snug text-navy">{n.name}</h3>
            <p class="mt-1 text-sm text-slate">
              {[n.locality, n.city].filter(Boolean).join(", ")}
            </p>

            <Show when={n.configurations_summary?.length}>
              <ul class="mt-3.5 flex flex-wrap gap-1.5">
                <For each={n.configurations_summary}>
                  {(c) => (
                    <li class="rounded-full border border-line bg-paper px-2.5 py-1 text-[11px] font-medium text-slate">
                      {c}
                    </li>
                  )}
                </For>
              </ul>
            </Show>

            <div class="mt-auto flex items-end justify-between gap-3 pt-5">
              <div class="min-w-0">
                <p class="eyebrow text-slate">Price</p>
                <p
                  class={`mt-0.5 text-[15px] ${
                    n.price_status === "verified"
                      ? "font-semibold text-navy"
                      : "italic text-slate"
                  }`}
                >
                  {priceRangeDisplay(n.price_min, n.price_max, n.price_status, n.price_status_display)}
                </p>
              </div>
              <Show when={n.status_display}>
                <span class="shrink-0 rounded-full border border-navy/20 bg-paper px-2.5 py-1 text-[11px] font-semibold text-navy/80">
                  {n.status_display}
                </span>
              </Show>
            </div>
          </A>
        )}
      </For>
    </div>
  );
}

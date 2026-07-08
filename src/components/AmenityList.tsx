import { For, Show, createMemo } from "solid-js";
import type { Amenity, AmenityCategory } from "~/lib/types";
import { titleCase } from "~/lib/format";

const CATEGORY_ORDER: AmenityCategory[] = [
  "safety", "convenience", "sports", "leisure", "environment", "connectivity",
];

export default function AmenityList(props: { amenities: Amenity[] }) {
  const grouped = createMemo(() => {
    const by = new Map<AmenityCategory, Amenity[]>();
    for (const a of props.amenities) {
      if (!by.has(a.category)) by.set(a.category, []);
      by.get(a.category)!.push(a);
    }
    return CATEGORY_ORDER.filter((c) => by.has(c)).map((c) => ({
      category: c,
      items: by.get(c)!,
    }));
  });

  return (
    <Show
      when={props.amenities.length}
      fallback={<p class="text-sm text-slate">Amenity details available on request.</p>}
    >
      <div class="space-y-6">
        <For each={grouped()}>
          {(group) => (
            <div>
              <h4 class="eyebrow mb-3 text-gold">{titleCase(group.category)}</h4>
              <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <For each={group.items}>
                  {(a) => (
                    <div class="flex items-center gap-2 rounded-lg border border-line bg-card px-3 py-2 text-sm text-navy/85">
                      <span class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold/12 text-gold">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </span>
                      {a.name}
                    </div>
                  )}
                </For>
              </div>
            </div>
          )}
        </For>
      </div>
    </Show>
  );
}

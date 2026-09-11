import { For, createMemo } from "solid-js";
import type { Specification } from "~/lib/types";

/**
 * Specifications — fit-and-finish, grouped by room or trade.
 *
 * Grouped rather than flat, unlike the amenity grid: these are sentences, not
 * chips, and several usually share a category, so the heading earns its space
 * here where it would not there. Categories appear in the order the backend
 * sends them, and `category_display` is used verbatim.
 */
export default function ProjectSpecifications(props: { specifications: Specification[] }) {
  const groups = createMemo(() => {
    const by = new Map<string, { label: string; items: Specification[] }>();
    for (const s of props.specifications) {
      const key = s.category || s.category_display;
      if (!by.has(key)) by.set(key, { label: s.category_display || s.category, items: [] });
      by.get(key)!.items.push(s);
    }
    return [...by.values()];
  });

  return (
    <div class="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2">
      <For each={groups()}>
        {(g) => (
          <div class="rounded-[14px] border border-line bg-card p-6">
            <h3 class="font-display text-lg font-semibold text-navy">{g.label}</h3>
            <div class="gold-rule my-3" />
            <ul class="space-y-2.5">
              <For each={g.items}>
                {(s) => (
                  <li class="flex items-start gap-2.5 text-[15px] leading-relaxed text-slate">
                    <span class="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                    <span>{s.detail}</span>
                  </li>
                )}
              </For>
            </ul>
          </div>
        )}
      </For>
    </div>
  );
}

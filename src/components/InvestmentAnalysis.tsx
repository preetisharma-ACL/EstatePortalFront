import { For, Show, createMemo } from "solid-js";
import type { InvestmentPoint } from "~/lib/types";

/**
 * Risks and the conclusion are part of the set on purpose.
 *
 * They get their own treatment — cautionary and summarising respectively —
 * rather than being dropped or styled as though they were selling points. A
 * balanced analysis that quietly loses its risks is worse than no analysis,
 * because it looks balanced. Matched loosely on the aspect key so a rename on
 * the backend degrades to ordinary styling rather than to silence.
 */
const isRisk = (p: InvestmentPoint) => /risk/i.test(p.aspect);
const isConclusion = (p: InvestmentPoint) => /conclusion/i.test(p.aspect);

export default function InvestmentAnalysis(props: { points: InvestmentPoint[] }) {
  // Risks and the conclusion move to the end — last word, not buried mid-grid —
  // but every point renders, whatever the list length.
  const ordinary = createMemo(() => props.points.filter((p) => !isRisk(p) && !isConclusion(p)));
  const risks = createMemo(() => props.points.filter(isRisk));
  const conclusions = createMemo(() => props.points.filter(isConclusion));

  return (
    <div class="mx-auto max-w-5xl space-y-4">
      <Show when={ordinary().length}>
        <div class="grid gap-4 sm:grid-cols-2">
          <For each={ordinary()}>
            {(p) => (
              <div class="rounded-[14px] border border-line bg-card p-6">
                <h3 class="font-display text-lg font-semibold text-navy">{p.aspect_display}</h3>
                <div class="gold-rule my-3" />
                <p class="text-[15px] leading-relaxed text-slate">{p.detail}</p>
              </div>
            )}
          </For>
        </div>
      </Show>

      {/* Amber, bordered, full width — it should be as hard to skim past as the
          positives above it. */}
      <For each={risks()}>
        {(p) => (
          <div class="rounded-[14px] border border-amber-500/40 bg-amber-500/[0.06] p-6">
            <h3 class="flex items-center gap-2.5 font-display text-lg font-semibold text-navy">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-amber-600" aria-hidden="true">
                <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
                <path d="M12 9v4M12 17h.01" />
              </svg>
              {p.aspect_display}
            </h3>
            <p class="mt-3 text-[15px] leading-relaxed text-navy/80">{p.detail}</p>
          </div>
        )}
      </For>

      <For each={conclusions()}>
        {(p) => (
          <div class="rounded-[14px] border border-navy/20 bg-navy p-6 sm:p-7">
            <h3 class="font-display text-lg font-semibold text-gold">{p.aspect_display}</h3>
            <p class="mt-3 text-[15px] leading-relaxed text-white/85">{p.detail}</p>
          </div>
        )}
      </For>
    </div>
  );
}

import { For, Show } from "solid-js";
import type { BuyerProfile } from "~/lib/types";

/**
 * Who the project suits — and who it does not.
 *
 * `is_suitable: false` is the section doing its job, not an error to hide. A
 * studio development saying "not suited to families" is exactly the kind of
 * thing a buyer needs before a site visit, so a poor fit is rendered as
 * plainly as a good one and is visibly distinct from it: different mark,
 * different border, neutral rather than green.
 *
 * Not styled as a warning either. "Not the right fit for you" is useful
 * guidance, not a defect in the project.
 */
export default function BuyerProfiles(props: { profiles: BuyerProfile[] }) {
  return (
    <div class="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2">
      <For each={props.profiles}>
        {(b) => (
          <div
            class={`rounded-[14px] border p-6 ${
              b.is_suitable ? "border-green/30 bg-green/[0.04]" : "border-line bg-paper"
            }`}
          >
            <h3 class="flex items-start gap-2.5 font-display text-lg font-semibold text-navy">
              <span
                class={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${
                  b.is_suitable ? "bg-green text-white" : "bg-navy/10 text-navy/70"
                }`}
                aria-hidden="true"
              >
                <Show
                  when={b.is_suitable}
                  fallback={
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
                      <path d="M5 12h14" />
                    </svg>
                  }
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </Show>
              </span>
              <span class="min-w-0">
                {b.audience_display}
                {/* Says which way the card reads, so the mark is not the only
                    thing carrying it — and so it survives being read aloud. */}
                <span class="mt-0.5 block text-xs font-semibold uppercase tracking-wider text-slate">
                  {b.is_suitable ? "Good fit" : "Less suitable"}
                </span>
              </span>
            </h3>
            <p class="mt-3 text-[15px] leading-relaxed text-slate">{b.detail}</p>
          </div>
        )}
      </For>
    </div>
  );
}

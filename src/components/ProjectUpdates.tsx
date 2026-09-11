import { For, Show } from "solid-js";
import type { ProjectUpdate } from "~/lib/types";

/**
 * Latest project updates — construction and approval milestones, newest first
 * as the backend orders them.
 *
 * Prints `date_label` verbatim and never touches `happened_on`. That field
 * exists only to sort the list and may be approximate ("Q1 2026-27" is stored
 * against some exact day), so formatting it would give an approximate date a
 * precision it does not have.
 */
export default function ProjectUpdates(props: { updates: ProjectUpdate[] }) {
  return (
    <ol class="mx-auto max-w-3xl">
      <For each={props.updates}>
        {(u, i) => (
          <li class="relative flex gap-5 pb-8 last:pb-0">
            {/* Rail + node. The rail stops at the last item rather than
                trailing into space below it. */}
            <div class="relative flex w-3 shrink-0 justify-center">
              <Show when={i() < props.updates.length - 1}>
                <span class="absolute top-4 bottom-[-2rem] w-px bg-line" aria-hidden="true" />
              </Show>
              <span class="relative mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 border-gold bg-card" aria-hidden="true" />
            </div>

            <div class="min-w-0 flex-1 pb-1">
              <Show when={u.date_label}>
                <p class="eyebrow text-gold">{u.date_label}</p>
              </Show>
              <h3 class="mt-1 font-display text-lg font-semibold leading-snug text-navy">
                {u.title}
              </h3>
              <Show when={u.detail}>
                <p class="mt-1.5 text-[15px] leading-relaxed text-slate">{u.detail}</p>
              </Show>
            </div>
          </li>
        )}
      </For>
    </ol>
  );
}

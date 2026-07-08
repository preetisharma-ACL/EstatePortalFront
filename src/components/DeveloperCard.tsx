import { A } from "@solidjs/router";
import { Show } from "solid-js";
import type { DeveloperStub, DeveloperList } from "~/lib/types";
import VerifiedTick from "./VerifiedTick";

type Dev = DeveloperStub | DeveloperList;

export default function DeveloperCard(props: { developer: Dev; compact?: boolean }) {
  const d = () => props.developer;
  const established = () => (d() as DeveloperList).established_year;
  const projectCount = () => (d() as DeveloperList).project_count;

  return (
    <A
      href={`/developer/${d().slug}`}
      class="card-lift flex items-center gap-4 rounded-[12px] border border-line bg-card p-4"
    >
      <div class="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-paper">
        <Show
          when={d().logo}
          fallback={
            <span class="font-display text-lg font-semibold text-navy/60">
              {d().name.charAt(0)}
            </span>
          }
        >
          <img src={d().logo!} alt={`${d().name} logo`} class="h-full w-full object-contain p-1" />
        </Show>
      </div>
      <div class="min-w-0">
        <div class="flex items-center gap-1.5">
          <span class="truncate font-semibold text-navy">{d().name}</span>
          <Show when={d().is_verified}>
            <VerifiedTick size={15} />
          </Show>
        </div>
        <p class="mt-0.5 text-xs text-slate">
          <Show when={established()}>{(y) => <>Est. {y()} · </>}</Show>
          <Show when={projectCount() !== undefined} fallback="View developer">
            {projectCount()} projects
          </Show>
        </p>
      </div>
      <span class="ml-auto hidden text-sm font-semibold text-gold sm:inline">View →</span>
    </A>
  );
}

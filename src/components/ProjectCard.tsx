import { A } from "@solidjs/router";
import { Show, For } from "solid-js";
import type { ProjectListItem } from "~/lib/types";
import { priceRange, areaRange, statusLabel, typeLabel } from "~/lib/format";
import ReraSeal from "./ReraSeal";
import VerifiedTick from "./VerifiedTick";

export default function ProjectCard(props: { project: ProjectListItem }) {
  const p = () => props.project;
  const loc = () => p().location;
  const chips = () => p().configurations_summary?.slice(0, 4) ?? [];
  const area = () => areaRange(p().area_min, p().area_max);

  return (
    <A
      href={`/project/${p().slug}`}
      class="card-lift group flex flex-col overflow-hidden rounded-[12px] border border-line bg-card"
    >
      {/* Cover */}
      <div class="img-scrim relative aspect-[4/3] overflow-hidden bg-navy/5">
        <Show
          when={p().cover_image}
          fallback={
            <div class="grid h-full place-items-center bg-navy/5 text-navy/30">
              <span class="font-display text-lg">{p().name}</span>
            </div>
          }
        >
          <img
            src={p().cover_image!}
            alt={`${p().name} by ${p().developer}`}
            loading="lazy"
            class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        </Show>

        {/* status pill (top-left) */}
        <span class="absolute left-3 top-3 z-10 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-navy shadow-sm">
          {statusLabel(p().status)}
        </span>

        {/* RERA seal (top-right) */}
        <div class="absolute right-3 top-3 z-10">
          <ReraSeal size="sm" />
        </div>

        {/* name + location over scrim */}
        <div class="absolute inset-x-0 bottom-0 z-10 p-4">
          <h3 class="font-display text-xl font-semibold leading-tight text-white">
            {p().name}
          </h3>
          <p class="mt-0.5 flex items-center gap-1 text-sm text-white/85">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0">
              <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" />
            </svg>
            {loc().locality}, {loc().city}
          </p>
        </div>
      </div>

      {/* Body */}
      <div class="flex flex-1 flex-col p-4">
        <div class="flex items-center gap-1.5 text-sm text-slate">
          <span class="font-medium text-navy/90">{p().developer}</span>
          <VerifiedTick size={14} />
        </div>

        <div class="mt-2 flex items-baseline justify-between gap-2">
          <p class="font-display text-lg font-semibold text-navy">
            {priceRange(p().price_min, p().price_max)}
          </p>
          <Show when={area()}>
            <span class="text-xs text-slate">{area()}</span>
          </Show>
        </div>

        {/* config chips */}
        <Show when={chips().length}>
          <div class="mt-3 flex flex-wrap gap-1.5">
            <For each={chips()}>
              {(c) => (
                <span class="rounded-full border border-line bg-paper px-2.5 py-1 text-xs font-medium text-navy/80">
                  {c}
                </span>
              )}
            </For>
          </div>
        </Show>

        <div class="mt-3 flex items-center justify-between border-t border-line pt-3">
          <Show
            when={p().primary_rera}
            fallback={<span class="text-xs text-slate">RERA on request</span>}
          >
            <span class="rera-num text-xs text-green" title="RERA registration number">
              {p().primary_rera}
            </span>
          </Show>
          <span class="rounded-full bg-navy/5 px-2.5 py-1 text-xs font-medium text-navy/70">
            {typeLabel(p().project_type)}
          </span>
        </div>
      </div>
    </A>
  );
}

import { A } from "@solidjs/router";
import { Show, For } from "solid-js";
import type { ProjectListItem } from "~/lib/types";
import { priceRange, areaRange, statusLabel, typeLabel } from "~/lib/format";
import VerifiedTick from "./VerifiedTick";

export default function ProjectCard(props: { project: ProjectListItem }) {
  const p = () => props.project;
  const loc = () => p().location;
  const chips = () => p().configurations_summary?.slice(0, 4) ?? [];
  const area = () => areaRange(p().area_min, p().area_max);

  return (
    <A
      href={`/project/${p().slug}`}
      class="card-lift group flex flex-col overflow-hidden rounded-[14px] border border-line bg-card"
    >
      {/* Cover */}
      <div class="relative aspect-[4/3] overflow-hidden bg-navy/5">
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
            class="h-full w-full object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.05]"
          />
        </Show>

        {/* Elegant bottom-up gradient */}
        <div
          class="absolute inset-0"
          aria-hidden="true"
          style="background:linear-gradient(to top,rgba(14,27,51,0.9) 0%,rgba(14,27,51,0.28) 46%,rgba(14,27,51,0) 70%);"
        />

        {/* status — glass pill, uppercase tracked */}
        <span class="absolute left-3.5 top-3.5 z-10 rounded-full border border-white/20 bg-navy-deep/40 px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-md">
          {statusLabel(p().status)}
        </span>

        {/* RERA badge (top-right) — seal when verified, else an "Upcoming" flag */}
        <div class="absolute right-3.5 top-3.5 z-10">
          <Show
            when={p().primary_rera}
            fallback={
              <span class="inline-flex items-center gap-1 rounded-full border border-white/25 bg-navy-deep/40 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-white backdrop-blur-md">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
                RERA Upcoming
              </span>
            }
          >
            <span
              class="inline-flex items-center gap-1.5 rounded-full border border-gold-soft/60 bg-green px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-white shadow-[0_0_0_1.5px_var(--color-gold)]"
              title="RERA-verified project"
            >
              <span class="grid h-[15px] w-[15px] shrink-0 place-items-center rounded-full bg-white text-green-deep" aria-hidden="true">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              </span>
              RERA-verified
            </span>
          </Show>
        </div>

        {/* name + location */}
        <div class="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5">
          <h3 class="font-display text-[1.4rem] font-semibold leading-tight text-white drop-shadow-sm">
            {p().name}
          </h3>
          <p class="mt-1.5 flex items-center gap-1.5 text-sm text-white/85">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0 text-gold-soft">
              <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" />
            </svg>
            <span class="truncate">{loc().locality}, {loc().city}</span>
          </p>
        </div>
      </div>

      {/* Body */}
      <div class="flex flex-1 flex-col p-4 sm:p-5">
        {/* developer — refined eyebrow label */}
        <div class="flex items-center gap-1.5">
          <span class="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-slate">
            {p().developer}
          </span>
          <VerifiedTick size={13} />
        </div>

        {/* price */}
        <div class="mt-2.5 flex items-end justify-between gap-3">
          <p class="font-display text-[20px] font-semibold leading-none text-navy">
            {priceRange(p().price_min, p().price_max)}
          </p>
          <Show when={area()}>
            <span class="mb-0.5 shrink-0 text-xs font-medium text-slate">{area()}</span>
          </Show>
        </div>

        {/* config chips */}
        <Show when={chips().length}>
          <div class="mt-3.5 flex flex-wrap gap-1.5">
            <For each={chips()}>
              {(c) => (
                <span class="rounded-full border border-line bg-paper px-2.5 py-1 text-xs font-medium text-navy/75">
                  {c}
                </span>
              )}
            </For>
          </div>
        </Show>

        {/* footer */}
        <div class="mt-4 flex items-center justify-between gap-2 border-t border-line pt-3.5">
          <Show
            when={p().primary_rera}
            fallback={<span class="text-xs font-medium text-slate">RERA Upcoming</span>}
          >
            <span class="rera-num text-xs text-green" title="RERA registration number">
              {p().primary_rera}
            </span>
          </Show>
          <span class="shrink-0 rounded-full bg-navy/5 px-2.5 py-1 text-xs font-medium text-navy/70">
            {typeLabel(p().project_type)}
          </span>
        </div>
      </div>
    </A>
  );
}

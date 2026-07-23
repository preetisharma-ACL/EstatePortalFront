import { A } from "@solidjs/router";
import { For, Show } from "solid-js";
import type { ProjectListItem } from "~/lib/types";
import { priceRange, areaRange, statusLabel, typeLabel } from "~/lib/format";
import VerifiedTick from "./VerifiedTick";

/**
 * One card's width, sized so a whole number of cards fills the rail at each
 * breakpoint (gap-5 = 1.25rem between them): 1 → 2 → 3 → 4 across.
 */
const CARD_W =
  "w-[80%] sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)] xl:w-[calc((100%-3.75rem)/4)]";

/**
 * Featured projects — a horizontal rail preceded by a standing intro panel, in
 * the style of a "best sellers" shelf. Same data and links as the old grid; only
 * the presentation changed. Every field the grid card showed is still on the
 * card here (status, RERA seal + registration number, developer, location,
 * price, area, configurations, project type).
 */
export default function FeaturedRail(props: {
  /** null while loading — renders the skeleton rail. */
  projects: ProjectListItem[] | null;
  viewAllHref?: string;
}) {
  let scroller: HTMLDivElement | undefined;
  const href = () => props.viewAllHref ?? "/search?is_featured=true";

  /** Page the rail by (almost) its own width, so a full set of cards moves. */
  const scroll = (dir: 1 | -1) =>
    scroller?.scrollBy({
      left: dir * (scroller.clientWidth * 0.92 || 640),
      behavior: "smooth",
    });

  return (
    <section class="relative isolate w-full overflow-hidden px-4 py-14 sm:px-6 lg:px-8">
      {/* Architect's-sketch backdrop — faint, behind everything, with a paper
          wash over it so the cards and copy keep full contrast. */}
      <div
        class="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-60 mix-blend-multiply"
        style="background-image:url('/banner/sketch.jpg')"
        aria-hidden="true"
      />
      <div
        class="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-paper/45 via-paper/20 to-paper/55"
        aria-hidden="true"
      />

      {/* Centred header */}
      <div class="mx-auto max-w-2xl text-center">
        <p class="eyebrow">Handpicked</p>
        <h2 class="mt-2 font-display text-3xl font-semibold text-navy sm:text-4xl">
          Featured projects
        </h2>
        <div class="gold-rule mx-auto mt-4" />
        <p class="mt-4 text-slate">
          Verified, well-documented launches our advisory team stands behind.
        </p>
      </div>

      {/* Intro panel + rail */}
      <div class="reveal relative mt-10 lg:grid lg:grid-cols-[262px_minmax(0,1fr)] lg:gap-3">
        {/* Standing panel — the shelf's caption and its "view all" action */}
        <div class="mb-4 flex flex-col rounded-[14px] border border-line bg-card/75 p-3 backdrop-blur-sm lg:mb-0 lg:p-4">
          <span class="grid h-11 w-11 place-items-center rounded-[12px] bg-gold/12 text-gold">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 21h18M5 21V7l6-4v18M15 21V11l4-2v12M8 8h.01M8 12h.01M8 16h.01" />
            </svg>
          </span>
          <h3 class="mt-5 font-display text-[1.45rem] font-semibold leading-tight text-navy">
            The best of India, handpicked
          </h3>
          <p class="mt-3 text-sm leading-relaxed text-slate">
            The latest residential and commercial launches from India's leading
            developers — every one RERA-verified, with developer-sourced pricing
            and complete documentation.
          </p>
          <A
            href={href()}
            class="mt-6 inline-flex w-fit items-center gap-2 rounded-[8px] bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold hover:text-navy-deep"
          >
            View all featured
            <span aria-hidden="true">→</span>
          </A>
        </div>

        {/* Rail */}
        <div class="relative">
          <div
            ref={scroller}
            class="flex snap-x gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <Show when={props.projects} fallback={<RailSkeleton />}>
              <For each={props.projects}>{(p) => <FeaturedCard project={p} />}</For>
            </Show>
          </div>

          {/* Arrows — float over the rail edges */}
          <Show when={props.projects?.length}>
            <RailArrow dir={-1} onClick={() => scroll(-1)} />
            <RailArrow dir={1} onClick={() => scroll(1)} />
          </Show>
        </div>
      </div>

      <Show when={props.projects && !props.projects.length}>
        <p class="mt-6 rounded-[12px] border border-dashed border-line bg-card p-8 text-center text-slate">
          Featured projects will appear here once the catalogue is populated.
        </p>
      </Show>
    </section>
  );
}

/**
 * One shelf card. The cover carries the identity (status, RERA seal, name,
 * location) so the body below stays short — three tight rows for developer,
 * price/area and configurations/registration.
 */
function FeaturedCard(props: { project: ProjectListItem }) {
  const p = () => props.project;
  const loc = () => p().location;
  const chips = () => p().configurations_summary?.slice(0, 4) ?? [];
  const area = () => areaRange(p().area_min, p().area_max);

  return (
    <A
      href={`/project/${p().slug}`}
      class={`card-lift group flex shrink-0 snap-start flex-col overflow-hidden rounded-[14px] border border-line bg-card ${CARD_W}`}
    >
      {/* Cover — carries status, RERA seal, name and location */}
      <div class="relative aspect-[16/10.5] overflow-hidden bg-navy/5">
        <Show
          when={p().cover_image}
          fallback={
            <div class="grid h-full place-items-center bg-navy/5 px-4 text-center text-navy/30">
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

        <div
          class="absolute inset-0"
          aria-hidden="true"
          style="background:linear-gradient(to top,rgba(14,27,51,0.92) 0%,rgba(14,27,51,0.3) 48%,rgba(14,27,51,0) 72%);"
        />

        {/* status (left) + RERA seal (right) */}
        <div class="absolute inset-x-3 top-3 z-10 flex items-start justify-between gap-2">
          <span class="min-w-0 truncate rounded-[6px] bg-gold px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-navy-deep shadow-sm">
            {statusLabel(p().status)}
          </span>
          <Show
            when={p().primary_rera}
            fallback={
              <span class="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/25 bg-navy-deep/45 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white backdrop-blur-md">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
                RERA soon
              </span>
            }
          >
            <span
              class="inline-flex shrink-0 items-center gap-1 rounded-full bg-green px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white shadow-sm"
              title="RERA-verified project"
            >
              RERA
              <span class="grid h-[13px] w-[13px] shrink-0 place-items-center rounded-full bg-white text-green-deep" aria-hidden="true">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              </span>
            </span>
          </Show>
        </div>

        {/* name + location */}
        <div class="absolute inset-x-0 bottom-0 z-10 p-4">
          <h3 class="line-clamp-2 font-display text-[1.3rem] font-semibold leading-tight text-white drop-shadow-sm">
            {p().name}
          </h3>
          <p class="mt-1 flex items-center gap-1.5 text-[13px] text-white/85">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0 text-gold-soft">
              <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" />
            </svg>
            <span class="truncate">{loc().locality}, {loc().city}</span>
          </p>
        </div>
      </div>

      {/* Body — each fact gets the room it needs, so nothing truncates */}
      <div class="flex flex-1 flex-col gap-2.5 p-4 sm:p-[18px]">
        {/* developer — full row, so long names stay readable */}
        <div class="flex items-center gap-1.5">
          <span class="min-w-0 truncate text-[13.5px] text-slate">By {p().developer}</span>
          <VerifiedTick size={13} />
        </div>

        {/* price — its own row, never wrapped */}
        <p class="whitespace-nowrap font-display text-[21px] font-semibold leading-none text-navy">
          {priceRange(p().price_min, p().price_max)}
        </p>

        {/* configurations + area */}
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]">
          <Show
            when={chips().length}
            fallback={<span class="text-slate">Configurations on request</span>}
          >
            <span class="font-medium text-navy/80">{chips().join(", ")}</span>
          </Show>
          <Show when={area()}>
            <span class="text-slate">{area()}</span>
          </Show>
        </div>

        {/* RERA number + project type */}
        <div class="mt-auto flex items-center justify-between gap-3 border-t border-line pt-3">
          <Show
            when={p().primary_rera}
            fallback={<span class="text-[12px] font-medium text-slate">RERA Upcoming</span>}
          >
            <span class="rera-num text-[12px] leading-snug text-green" title="RERA registration number">
              {p().primary_rera}
            </span>
          </Show>
          <span class="shrink-0 rounded-full bg-navy/5 px-2.5 py-1 text-[11.5px] font-medium text-navy/70">
            {typeLabel(p().project_type)}
          </span>
        </div>
      </div>
    </A>
  );
}

function RailArrow(props: { dir: 1 | -1; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={props.dir === 1 ? "Next projects" : "Previous projects"}
      onClick={props.onClick}
      class="absolute top-1/2 z-30 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-line bg-card text-navy shadow-[0_10px_24px_-12px_rgba(22,41,75,0.55)] transition-colors hover:border-navy hover:bg-navy hover:text-white sm:grid"
      classList={{ "-left-4": props.dir === -1, "-right-4": props.dir === 1 }}
    >
      <Show
        when={props.dir === 1}
        fallback={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6" /></svg>}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg>
      </Show>
    </button>
  );
}

function RailSkeleton() {
  return (
    <For each={[0, 1, 2, 3]}>
      {() => (
        <div class={`shrink-0 overflow-hidden rounded-[14px] border border-line bg-card ${CARD_W}`}>
          <div class="aspect-[16/10.5] animate-pulse bg-navy/5" />
          <div class="space-y-2.5 p-4 sm:p-[18px]">
            <div class="h-3 w-1/2 animate-pulse rounded bg-navy/5" />
            <div class="h-5 w-2/3 animate-pulse rounded bg-navy/5" />
            <div class="h-3 w-1/2 animate-pulse rounded bg-navy/5" />
            <div class="h-3 w-2/3 animate-pulse rounded bg-navy/5" />
          </div>
        </div>
      )}
    </For>
  );
}

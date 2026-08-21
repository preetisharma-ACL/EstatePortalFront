import { A } from "@solidjs/router";
import { For, Show } from "solid-js";
import type { ProjectListItem } from "~/lib/types";
import ProjectShelfCard, { RAIL_ITEM, RailArrow, RailSkeleton } from "./ProjectShelfCard";

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
              <For each={props.projects}>{(p) => <ProjectShelfCard project={p} class={RAIL_ITEM} />}</For>
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

import { For, Show, createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { isServer } from "solid-js/web";
import type { ProjectListItem, ProjectFilters } from "~/lib/types";
import ProjectShelfCard, { RAIL_ITEM, RailArrow, RailSkeleton } from "./ProjectShelfCard";

const SORTS: { v: NonNullable<ProjectFilters["ordering"]> | ""; label: string }[] = [
  { v: "", label: "Relevance" },
  { v: "price_min", label: "Price: low to high" },
  { v: "-price_min", label: "Price: high to low" },
  { v: "-created_at", label: "Newest first" },
  { v: "possession_date", label: "Possession: soonest" },
];

/**
 * A township's whole inventory as one horizontal shelf: the same cards as the
 * featured rail, four across on a wide screen, paged by the prev/next arrows.
 *
 * A rail rather than a paged grid because a township is a few dozen projects at
 * most — the entire list fits in one scroller, so the arrows are the only
 * navigation needed and the section stays a single screen tall.
 */
export default function ProjectRail(props: {
  /** undefined while loading — renders the skeleton rail. */
  projects: ProjectListItem[] | undefined;
  ordering: string | undefined;
  setParam: (key: string, value: string | number | undefined) => void;
}) {
  let scroller: HTMLDivElement | undefined;
  const [atStart, setAtStart] = createSignal(true);
  const [atEnd, setAtEnd] = createSignal(true);
  const count = () => props.projects?.length ?? 0;

  /** Edge state drives the arrows' disabled look — 2px of slack for rounding. */
  const sync = () => {
    const el = scroller;
    if (!el) return;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
  };

  onMount(() => {
    sync();
    window.addEventListener("resize", sync);
    onCleanup(() => window.removeEventListener("resize", sync));
  });

  // Re-measure once the list itself changes (first load, or a new sort).
  createEffect(() => {
    props.projects;
    if (!isServer) requestAnimationFrame(sync);
  });

  /** Page the rail by (almost) its own width, so a full set of cards moves. */
  const scroll = (dir: 1 | -1) =>
    scroller?.scrollBy({
      left: dir * (scroller.clientWidth * 0.92 || 640),
      behavior: "smooth",
    });

  return (
    <div>
      {/* Result count + sort */}
      <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-slate">
          <Show when={props.projects} fallback="Searching…">
            <span class="font-semibold text-navy">{count().toLocaleString("en-IN")}</span>{" "}
            {count() === 1 ? "project" : "projects"} found
          </Show>
        </p>
        <label class="flex items-center gap-2 text-sm text-slate">
          <span class="hidden sm:inline">Sort</span>
          <select
            class="rounded-[8px] border border-line bg-card px-3 py-2 text-sm font-medium text-navy focus:outline-none focus:ring-2 focus:ring-gold/40"
            value={props.ordering ?? ""}
            onChange={(e) => props.setParam("ordering", e.currentTarget.value || undefined)}
          >
            {/* `selected` (not the select's `value`) is what survives SSR + hydration,
                so the control reflects ?ordering= on a fresh page load. */}
            <For each={SORTS}>
              {(s) => (
                <option value={s.v} selected={s.v === (props.ordering ?? "")}>
                  {s.label}
                </option>
              )}
            </For>
          </select>
        </label>
      </div>

      <Show
        when={!props.projects || props.projects.length}
        fallback={
          <div class="rounded-[12px] border border-dashed border-line bg-card p-12 text-center">
            <p class="font-display text-xl text-navy">No projects match these filters</p>
            <p class="mt-2 text-sm text-slate">
              Try widening your budget or clearing a filter to see more RERA-verified options.
            </p>
          </div>
        }
      >
        <div class="relative">
          <div
            ref={scroller}
            onScroll={sync}
            class="flex snap-x gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <Show when={props.projects} fallback={<RailSkeleton />}>
              <For each={props.projects}>{(p) => <ProjectShelfCard project={p} class={RAIL_ITEM} />}</For>
            </Show>
          </div>

          {/* Prev / next — float over the rail edges */}
          <Show when={count()}>
            <RailArrow dir={-1} disabled={atStart()} onClick={() => scroll(-1)} />
            <RailArrow dir={1} disabled={atEnd()} onClick={() => scroll(1)} />
          </Show>
        </div>
      </Show>
    </div>
  );
}

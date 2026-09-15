import { For, Show } from "solid-js";
import type { Paginated, ProjectListItem, ProjectFilters } from "~/lib/types";
import ProjectCard from "./ProjectCard";
import Pagination from "./Pagination";

const SORTS: { v: NonNullable<ProjectFilters["ordering"]> | ""; label: string }[] = [
  { v: "", label: "Relevance" },
  { v: "price_min", label: "Price: low to high" },
  { v: "-price_min", label: "Price: high to low" },
  { v: "-created_at", label: "Newest first" },
  { v: "possession_date", label: "Possession: soonest" },
];


export default function ResultsGrid(props: {
  data: Paginated<ProjectListItem> | undefined;
  ordering: string | undefined;
  page: number;
  setParam: (key: string, value: string | number | undefined) => void;
}) {
  const count = () => props.data?.count ?? 0;

  return (
    <div>
      {/* Sticky sort + result count */}
      <div class="sticky top-16 z-20 -mx-1 mb-5 flex flex-wrap items-center justify-between gap-3 bg-paper/90 px-1 py-3 backdrop-blur">
        <p class="text-sm text-slate">
          <Show when={props.data} fallback="Searching…">
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
        when={props.data}
        fallback={
          <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <For each={[0, 1, 2, 3, 4, 5]}>{() => <CardSkeleton />}</For>
          </div>
        }
      >
        <Show
          when={props.data!.results.length}
          fallback={
            <div class="rounded-[12px] border border-dashed border-line bg-card p-12 text-center">
              <p class="font-display text-xl text-navy">No projects match these filters</p>
              <p class="mt-2 text-sm text-slate">
                Try widening your budget or clearing a filter to see more RERA-verified options.
              </p>
            </div>
          }
        >
          <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <For each={props.data!.results}>{(p) => <ProjectCard project={p} />}</For>
          </div>

          <Pagination data={props.data} page={props.page} setParam={props.setParam} />
        </Show>
      </Show>
    </div>
  );
}


function CardSkeleton() {
  return (
    <div class="overflow-hidden rounded-[12px] border border-line bg-card">
      <div class="aspect-[4/3] animate-pulse bg-navy/5" />
      <div class="space-y-3 p-4">
        <div class="h-4 w-1/2 animate-pulse rounded bg-navy/5" />
        <div class="h-5 w-2/3 animate-pulse rounded bg-navy/5" />
        <div class="h-4 w-full animate-pulse rounded bg-navy/5" />
      </div>
    </div>
  );
}

import { For, Show } from "solid-js";
import type { Paginated, ProjectListItem, ProjectFilters } from "~/lib/types";
import ProjectCard from "./ProjectCard";

const SORTS: { v: NonNullable<ProjectFilters["ordering"]> | ""; label: string }[] = [
  { v: "", label: "Relevance" },
  { v: "price_min", label: "Price: low to high" },
  { v: "-price_min", label: "Price: high to low" },
  { v: "-created_at", label: "Newest first" },
  { v: "possession_date", label: "Possession: soonest" },
];

const PAGE_SIZE = 12;

export default function ResultsGrid(props: {
  data: Paginated<ProjectListItem> | undefined;
  ordering: string | undefined;
  page: number;
  setParam: (key: string, value: string | number | undefined) => void;
}) {
  const count = () => props.data?.count ?? 0;
  const totalPages = () => Math.max(1, Math.ceil(count() / PAGE_SIZE));

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
            <For each={SORTS}>{(s) => <option value={s.v}>{s.label}</option>}</For>
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

          <Show when={totalPages() > 1}>
            <nav class="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
              <PageBtn
                disabled={props.page <= 1}
                onClick={() => props.setParam("page", props.page - 1 <= 1 ? undefined : props.page - 1)}
              >
                ← Prev
              </PageBtn>
              <span class="px-3 text-sm text-slate">
                Page <span class="font-semibold text-navy">{props.page}</span> of {totalPages()}
              </span>
              <PageBtn
                disabled={props.page >= totalPages()}
                onClick={() => props.setParam("page", props.page + 1)}
              >
                Next →
              </PageBtn>
            </nav>
          </Show>
        </Show>
      </Show>
    </div>
  );
}

function PageBtn(props: { disabled: boolean; onClick: () => void; children: any }) {
  return (
    <button
      type="button"
      disabled={props.disabled}
      onClick={props.onClick}
      class="rounded-[8px] border border-line bg-card px-4 py-2 text-sm font-semibold text-navy transition-colors hover:border-gold disabled:cursor-not-allowed disabled:opacity-40"
    >
      {props.children}
    </button>
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

import { createAsync, useSearchParams, type RouteDefinition } from "@solidjs/router";
import { Title, Meta, Link } from "@solidjs/meta";
import { createMemo } from "solid-js";
import FilterPanel from "~/components/FilterPanel";
import ResultsGrid from "~/components/ResultsGrid";
import { projectsQuery } from "~/lib/queries";
import { filtersFromParams } from "~/lib/filters";
import type { ProjectFilters } from "~/lib/types";

const PAGE_SIZE = 12;

export const route = {
  preload: ({ location }) => {
    const filters = filtersFromParams(location.query as Record<string, string>);
    void projectsQuery({ ...filters, page_size: PAGE_SIZE });
  },
} satisfies RouteDefinition;

export default function SearchPage() {
  const [params, setParams] = useSearchParams();

  const filters = createMemo<ProjectFilters>(() =>
    filtersFromParams(params as Record<string, string>),
  );

  const data = createAsync(() =>
    projectsQuery({ ...filters(), page_size: PAGE_SIZE }),
  );

  // Any filter change resets pagination; changing the page keeps everything else.
  const setParam = (key: string, value: string | number | undefined) => {
    const patch: Record<string, string | null> = {
      [key]: value === undefined ? null : String(value),
    };
    if (key !== "page") patch.page = null;
    setParams(patch, { scroll: false });
  };

  const clearAll = () => {
    setParams(
      {
        project_type: null, status: null, bhk: null, sub_type: null,
        min_price: null, max_price: null, min_area: null, max_area: null,
        amenity: null, page: null,
      },
      { scroll: false },
    );
  };

  return (
    <>
      <Title>Search RERA-verified projects across India | EstatePortal</Title>
      <Meta name="description" content="Filter and compare RERA-verified residential and commercial projects across India by budget, configuration, status and amenities." />
      <Link rel="canonical" href="/search" />

      <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <header class="mb-6">
          <p class="eyebrow">Discovery</p>
          <h1 class="mt-2 font-display text-3xl font-semibold text-navy sm:text-4xl">
            Find your property
          </h1>
        </header>

        <div class="grid gap-8 lg:grid-cols-[280px_1fr]">
          <FilterPanel filters={filters()} setParam={setParam} clearAll={clearAll} />
          <ResultsGrid
            data={data()}
            ordering={filters().ordering}
            page={filters().page ?? 1}
            setParam={setParam}
          />
        </div>
      </div>
    </>
  );
}

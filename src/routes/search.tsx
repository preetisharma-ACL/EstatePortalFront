import { createAsync, useSearchParams, type RouteDefinition } from "@solidjs/router";
import { Title, Meta, Link } from "@solidjs/meta";
import { createMemo } from "solid-js";
import FilterPanel from "~/components/FilterPanel";
import ResultsGrid from "~/components/ResultsGrid";
import BannerSlideshow from "~/components/BannerSlideshow";
import { projectsQuery } from "~/lib/queries";
import { filtersFromParams } from "~/lib/filters";
import type { ProjectFilters } from "~/lib/types";

const PAGE_SIZE = 12;

const LOCAL_BANNERS = [
  "/banner/banner-1.jpg",
  "/banner/banner-2.jpg",
  "/banner/banner-3.jpg",
];

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

      {/* ---------------------------------------------------------------
          Hero banner — half-height version of the project-detail hero:
          local cover image under the same navy scrim, white title on top.
      ---------------------------------------------------------------- */}
      <section class="relative isolate overflow-hidden bg-navy-deep">
        {/* Crossfading slideshow — same effect as the project detail hero */}
        <BannerSlideshow images={[]} fallback={LOCAL_BANNERS} />
        {/* Navy scrim — matches the project detail hero */}
        <div
          class="absolute inset-0"
          aria-hidden="true"
          style="background:linear-gradient(180deg,rgba(14,27,51,0.72) 0%,rgba(14,27,51,0.32) 34%,rgba(14,27,51,0.66) 74%,rgba(14,27,51,0.94) 100%);"
        />
        <div class="relative mx-auto flex min-h-[340px] max-w-7xl flex-col justify-end px-4 pb-10 pt-16 sm:min-h-[400px] sm:px-6">
          <p class="eyebrow text-gold-soft">Discovery</p>
          <h1 class="mt-2 font-display text-3xl font-semibold text-white drop-shadow-sm sm:text-5xl">
            Find your property
          </h1>
          <p class="mt-3 max-w-2xl text-sm text-white/80 sm:text-base">
            Filter and compare RERA-verified residential and commercial projects across India.
          </p>
        </div>
      </section>

      <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6">
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

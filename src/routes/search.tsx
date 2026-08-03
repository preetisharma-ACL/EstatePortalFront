import { createAsync, useSearchParams, A, type RouteDefinition } from "@solidjs/router";
import { Title, Meta, Link } from "@solidjs/meta";
import { createMemo, Show } from "solid-js";
import { openLeadModal } from "~/lib/leadModal";
import FilterPanel from "~/components/FilterPanel";
import ResultsGrid from "~/components/ResultsGrid";
import BannerSlideshow from "~/components/BannerSlideshow";
import HeroStat from "~/components/HeroStat";
import { projectsQuery } from "~/lib/queries";
import { filtersFromParams } from "~/lib/filters";
import { typeLabel } from "~/lib/format";
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

  // Banner copy follows the active type filter, so arriving from the
  // Commercial nav item doesn't land on a generic "Find your property".
  const NOUNS: Record<string, string> = {
    commercial: "commercial property",
    residential: "residential property",
    mixed: "mixed-use property",
  };
  const headingNoun = () => NOUNS[filters().project_type ?? ""] ?? "property";
  const crumb = () =>
    filters().project_type ? typeLabel(filters().project_type!) : "Search";

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
          Hero banner — compact version of the city banner: slideshow under a
          vertical scrim for the page transition plus a left-to-right one that
          keeps the copy legible over busy skyline photography.
      ---------------------------------------------------------------- */}
      <section class="relative isolate overflow-hidden bg-navy-deep">
        <BannerSlideshow images={[]} fallback={LOCAL_BANNERS} />
        <div
          class="absolute inset-0"
          aria-hidden="true"
          style="background:linear-gradient(180deg,rgba(14,27,51,0.74) 0%,rgba(14,27,51,0.38) 36%,rgba(14,27,51,0.72) 76%,rgba(14,27,51,0.95) 100%);"
        />
        <div
          class="absolute inset-0"
          aria-hidden="true"
          style="background:linear-gradient(90deg,rgba(14,27,51,0.88) 0%,rgba(14,27,51,0.62) 42%,rgba(14,27,51,0.12) 82%,rgba(14,27,51,0) 100%);"
        />

        <div class="relative mx-auto flex min-h-[280px] max-w-7xl flex-col px-4 pb-8 pt-5 text-white sm:min-h-[320px] sm:px-6">
          <nav class="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-white/60" aria-label="Breadcrumb">
            <A href="/" class="transition-colors hover:text-gold-soft">Home</A>
            <span class="text-white/30">/</span>
            <span class="text-gold-soft">{crumb()}</span>
          </nav>

          <div class="mt-auto max-w-3xl pt-6">
            <p class="eyebrow text-gold-soft">Discovery</p>
            {/* Heading tracks the active type filter — landing on the Commercial
                nav item and reading a generic title is disorienting. */}
            <h1 class="mt-2 font-display text-[32px] font-semibold leading-[1.05] drop-shadow-sm sm:text-[42px]">
              Find your <span class="italic text-gold-soft">{headingNoun()}</span>
            </h1>
            <div class="gold-rule mt-3.5" />

            <div class="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2.5">
              <p class="text-sm text-white/80">
                Filter and compare RERA-verified projects across India.
              </p>
              <span class="hidden h-4 w-px bg-white/25 sm:block" aria-hidden="true" />
              <dl class="flex flex-wrap gap-2">
                <Show when={data()}>
                  <HeroStat label="Projects" value={String(data()!.count)} />
                </Show>
                <HeroStat label="Inventory" value="RERA-verified" />
              </dl>
            </div>

            <div class="mt-5 flex flex-wrap items-center gap-2.5">
              <a
                href="#results"
                class="rounded-[8px] bg-gold px-4.5 py-2.5 text-sm font-semibold text-navy transition-transform hover:-translate-y-0.5"
              >
                Browse results
              </a>
              <button
                type="button"
                onClick={() => openLeadModal()}
                class="rounded-[8px] border border-white/25 bg-white/5 px-4.5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:border-gold-soft hover:text-gold-soft"
              >
                Talk to an advisor
              </button>
            </div>
          </div>
        </div>

        {/* Signature gold hairline at the base */}
        <div
          class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent"
          aria-hidden="true"
        />
      </section>

      <div id="results" class="mx-auto max-w-7xl scroll-mt-20 px-4 py-8 sm:px-6">
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

import {
  createAsync, useParams, useSearchParams, A, type RouteDefinition,
} from "@solidjs/router";
import { Title, Meta, Link } from "@solidjs/meta";
import { createMemo, Show } from "solid-js";
import FilterPanel from "~/components/FilterPanel";
import ResultsGrid from "~/components/ResultsGrid";
import { localityQuery, projectsQuery } from "~/lib/queries";
import { filtersFromParams } from "~/lib/filters";
import { titleCase } from "~/lib/format";
import NotFound from "~/components/NotFound";
import type { ProjectFilters } from "~/lib/types";

const PAGE_SIZE = 12;

export const route = {
  preload: ({ params, location }) => {
    void localityQuery(params.city!, params.locality!);
    const f = filtersFromParams(location.query as Record<string, string>, {
      city: params.city,
      locality: params.locality,
    });
    void projectsQuery({ ...f, page_size: PAGE_SIZE });
  },
} satisfies RouteDefinition;

export default function LocalityPage() {
  const params = useParams();
  const [sp, setParams] = useSearchParams();

  // Resolves to the Locality, or null when the slug doesn't exist in this city.
  const locality = createAsync(() => localityQuery(params.city!, params.locality!), {
    deferStream: true,
  });

  const filters = createMemo<ProjectFilters>(() =>
    filtersFromParams(sp as Record<string, string>, {
      city: params.city,
      locality: params.locality,
    }),
  );
  const data = createAsync(() => projectsQuery({ ...filters(), page_size: PAGE_SIZE }));

  const setParam = (key: string, value: string | number | undefined) => {
    const patch: Record<string, string | null> = { [key]: value === undefined ? null : String(value) };
    if (key !== "page") patch.page = null;
    setParams(patch, { scroll: false });
  };
  const clearAll = () =>
    setParams(
      { project_type: null, status: null, bhk: null, sub_type: null, min_price: null, max_price: null, min_area: null, max_area: null, amenity: null, page: null },
      { scroll: false },
    );

  return (
    <Show when={locality() !== undefined} fallback={<Loading />}>
      <Show when={locality()} fallback={<NotFound kind="locality" />}>
        {(l) => (
          <>
            {/* Meta ungated (deferStream resolves locality() before the SSR head flush). */}
            <Title>
              {l().meta_title ||
                `Property in ${l().name}, ${l().city} — RERA-verified | EstatePortal`}
            </Title>
            <Meta
              name="description"
              content={l().meta_description || `RERA-verified projects in ${l().name}, ${l().city}.`}
            />
            <Link rel="canonical" href={`/${params.city}/${params.locality}`} />

            <section class="hero-gradient relative overflow-hidden text-white">
              <div class="blueprint pointer-events-none absolute inset-0" aria-hidden="true" />
              <div class="relative mx-auto max-w-7xl px-4 py-12 sm:px-6">
                <nav class="mb-3 flex items-center gap-1.5 text-xs text-white/60" aria-label="Breadcrumb">
                  <A href="/" class="hover:text-white">Home</A><span>/</span>
                  <A href={`/${params.city}`} class="hover:text-white">{l().city}</A><span>/</span>
                  <span class="text-white/80">{l().name}</span>
                </nav>
                <p class="eyebrow text-gold-soft">{titleCase(l().locality_type)}</p>
                <h1 class="mt-2 font-display text-4xl font-semibold sm:text-5xl">
                  Property in <span class="italic text-gold-soft">{l().name}</span>
                </h1>
                <p class="mt-2 text-white/70">{l().city} · RERA-verified inventory</p>
              </div>
            </section>

            <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6">
              <div class="grid gap-8 lg:grid-cols-[280px_1fr]">
                <FilterPanel filters={filters()} setParam={setParam} clearAll={clearAll} />
                <ResultsGrid data={data()} ordering={filters().ordering} page={filters().page ?? 1} setParam={setParam} />
              </div>
            </div>
          </>
        )}
      </Show>
    </Show>
  );
}

function Loading() {
  return (
    <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div class="h-8 w-2/3 animate-pulse rounded bg-navy/5" />
      <div class="mt-8 h-64 w-full animate-pulse rounded-[12px] bg-navy/5" />
    </div>
  );
}

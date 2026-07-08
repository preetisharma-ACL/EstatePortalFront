import {
  createAsync, useParams, useSearchParams, A, type RouteDefinition,
} from "@solidjs/router";
import { Title, Meta, Link } from "@solidjs/meta";
import { createMemo, Show } from "solid-js";
import FilterPanel from "~/components/FilterPanel";
import ResultsGrid from "~/components/ResultsGrid";
import NotFound from "~/components/NotFound";
import { cityQuery, projectsQuery } from "~/lib/queries";
import { filtersFromParams } from "~/lib/filters";
import type { ProjectFilters } from "~/lib/types";

const PAGE_SIZE = 12;

export const route = {
  preload: ({ params, location }) => {
    void cityQuery(params.city!);
    const f = filtersFromParams(location.query as Record<string, string>, { city: params.city });
    void projectsQuery({ ...f, page_size: PAGE_SIZE });
  },
} satisfies RouteDefinition;

export default function CityPage() {
  const params = useParams();
  const [sp, setParams] = useSearchParams();
  const city = createAsync(() => cityQuery(params.city!), { deferStream: true });

  const filters = createMemo<ProjectFilters>(() =>
    filtersFromParams(sp as Record<string, string>, { city: params.city }),
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
    // undefined = still loading (client nav); null = no such city (404).
    <Show when={city() !== undefined} fallback={<CityLoading />}>
    <Show when={city()} fallback={<NotFound kind="city" />}>
      {/* deferStream resolves city() before the SSR head flush, so meta is correct. */}
      <Title>
        {city()?.meta_title ||
          `Property in ${city()?.name ?? params.city} — RERA-verified projects | EstatePortal`}
      </Title>
      <Meta
        name="description"
        content={
          city()?.meta_description ||
          `Explore RERA-verified residential and commercial projects in ${city()?.name ?? params.city}${city()?.state ? `, ${city()!.state}` : ""}.`
        }
      />
      <Meta property="og:title" content={city()?.meta_title || `Property in ${city()?.name ?? params.city}`} />
      <Show when={city()?.og_image}>
        <Meta property="og:image" content={city()!.og_image!} />
      </Show>
      <Link rel="canonical" href={`/${params.city}`} />

      {/* City hero */}
      <section class="hero-gradient relative overflow-hidden text-white">
        <div class="blueprint pointer-events-none absolute inset-0" aria-hidden="true" />
        <div class="relative mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <nav class="mb-3 flex items-center gap-1.5 text-xs text-white/60" aria-label="Breadcrumb">
            <A href="/" class="hover:text-white">Home</A><span>/</span>
            <span class="text-white/80">{city()?.name ?? params.city}</span>
          </nav>
          <p class="eyebrow text-gold-soft">City</p>
          <h1 class="mt-2 font-display text-4xl font-semibold sm:text-5xl">
            Property in <span class="italic text-gold-soft">{city()?.name ?? params.city}</span>
          </h1>
          <Show when={city()}>
            {(c) => (
              <p class="mt-2 text-white/70">
                {c().state} · {c().locality_count} localities · RERA-verified inventory
              </p>
            )}
          </Show>
        </div>
      </section>

      <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div class="grid gap-8 lg:grid-cols-[280px_1fr]">
          <FilterPanel filters={filters()} setParam={setParam} clearAll={clearAll} />
          <ResultsGrid data={data()} ordering={filters().ordering} page={filters().page ?? 1} setParam={setParam} />
        </div>
      </div>
    </Show>
    </Show>
  );
}

function CityLoading() {
  return (
    <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div class="h-10 w-1/2 animate-pulse rounded bg-navy/5" />
      <div class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div class="aspect-[4/3] animate-pulse rounded-[12px] bg-navy/5" />
        <div class="aspect-[4/3] animate-pulse rounded-[12px] bg-navy/5" />
        <div class="aspect-[4/3] animate-pulse rounded-[12px] bg-navy/5" />
      </div>
    </div>
  );
}

import {
  createAsync, useParams, useSearchParams, A, type RouteDefinition,
} from "@solidjs/router";
import { Title, Meta, Link } from "@solidjs/meta";
import { createMemo, Show } from "solid-js";
import { openLeadModal } from "~/lib/leadModal";
import FilterPanel from "~/components/FilterPanel";
import ResultsGrid from "~/components/ResultsGrid";
import NotFound from "~/components/NotFound";
import BannerSlideshow from "~/components/BannerSlideshow";
import HeroStat from "~/components/HeroStat";
import { cityQuery, projectsQuery } from "~/lib/queries";
import { filtersFromParams } from "~/lib/filters";
import type { ProjectFilters } from "~/lib/types";
import { canonical } from "~/lib/seo";

const PAGE_SIZE = 12;

const LOCAL_BANNERS = [
  "/banner/banner-1.jpg",
  "/banner/banner-2.jpg",
  "/banner/banner-3.jpg",
];

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
      <Link rel="canonical" href={canonical(`/${params.city}`)} />

      {/* City hero banner — crossfading slideshow (city photo, else local
          banners). Two scrims: a vertical one for the page transition, and a
          left-to-right one so the copy column stays legible over busy aerial
          photography instead of competing with flyovers and rooftops. */}
      <section class="relative isolate overflow-hidden bg-navy-deep">
        <BannerSlideshow images={city()?.image ? [city()!.image!] : []} fallback={LOCAL_BANNERS} />
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

        <div class="relative mx-auto flex min-h-[300px] max-w-7xl flex-col px-4 pb-8 pt-5 text-white sm:min-h-[340px] sm:px-6">
          <nav class="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-white/60" aria-label="Breadcrumb">
            <A href="/" class="transition-colors hover:text-gold-soft">Home</A>
            <span class="text-white/30">/</span>
            <span class="text-gold-soft">{city()?.name ?? params.city}</span>
          </nav>

          {/* Title block pinned to the bottom of the frame. Location and stats
              share one row to keep the banner compact. */}
          <div class="mt-auto max-w-3xl pt-6">
            <p class="eyebrow text-gold-soft">City guide</p>
            <h1 class="mt-2 font-display text-[32px] font-semibold leading-[1.05] drop-shadow-sm sm:text-[42px]">
              Property in{" "}
              <span class="italic text-gold-soft">{city()?.name ?? params.city}</span>
            </h1>
            <div class="gold-rule mt-3.5" />

            <Show when={city()}>
              {(c) => (
                <div class="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2.5">
                  <p class="flex items-center gap-1.5 text-sm text-white/80">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="shrink-0 text-gold-soft" aria-hidden="true">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>{c().state}, India</span>
                  </p>
                  <span class="hidden h-4 w-px bg-white/25 sm:block" aria-hidden="true" />
                  <dl class="flex flex-wrap gap-2">
                    <Show when={c().locality_count}>
                      <HeroStat label="Localities" value={String(c().locality_count)} />
                    </Show>
                    <Show when={data()}>
                      <HeroStat label="Projects" value={String(data()!.count)} />
                    </Show>
                    <HeroStat label="Inventory" value="RERA-verified" />
                  </dl>
                </div>
              )}
            </Show>

            <div class="mt-5 flex flex-wrap items-center gap-2.5">
              <a
                href="#results"
                class="rounded-[8px] bg-gold px-4.5 py-2.5 text-sm font-semibold text-navy transition-transform hover:-translate-y-0.5"
              >
                Browse projects
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
          <ResultsGrid data={data()} ordering={filters().ordering} page={filters().page ?? 1} setParam={setParam} />
        </div>
      </div>
    </Show>
    </Show>
  );
}

function CityLoading() {
  return (
    <div>
      {/* Navy hero-shaped skeleton so the banner doesn't flash white before the
          city resolves. */}
      <div class="hero-gradient relative min-h-[300px] overflow-hidden sm:min-h-[340px]">
        <div class="blueprint pointer-events-none absolute inset-0" aria-hidden="true" />
        <div class="relative mx-auto flex h-full min-h-[300px] max-w-7xl flex-col justify-end px-4 pb-8 sm:min-h-[340px] sm:px-6">
          <div class="h-3 w-20 animate-pulse rounded bg-white/10" />
          <div class="mt-3 h-10 w-2/3 animate-pulse rounded bg-white/10" />
          <div class="mt-4 flex gap-2">
            <div class="h-7 w-32 animate-pulse rounded-full bg-white/10" />
            <div class="h-7 w-28 animate-pulse rounded-full bg-white/10" />
          </div>
          <div class="mt-5 h-10 w-56 animate-pulse rounded-[8px] bg-white/10" />
        </div>
      </div>
      <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div class="aspect-[4/3] animate-pulse rounded-[12px] bg-navy/5" />
          <div class="aspect-[4/3] animate-pulse rounded-[12px] bg-navy/5" />
          <div class="aspect-[4/3] animate-pulse rounded-[12px] bg-navy/5" />
        </div>
      </div>
    </div>
  );
}

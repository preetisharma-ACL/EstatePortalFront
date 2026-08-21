import { createAsync, useParams, useSearchParams, A } from "@solidjs/router";
import { Title, Meta, Link } from "@solidjs/meta";
import { createMemo, Show } from "solid-js";
import BannerSlideshow from "~/components/BannerSlideshow";
import FilterPanel from "~/components/FilterPanel";
import HeroStat from "~/components/HeroStat";
import NotFound from "~/components/NotFound";
import ResultsGrid from "~/components/ResultsGrid";
import { filtersFromParams } from "~/lib/filters";
import { MIN_INDEXABLE, type TypePage } from "~/lib/projectTypes";
import { cityQuery, projectsQuery } from "~/lib/queries";
import { canonical } from "~/lib/seo";
import type { ProjectFilters } from "~/lib/types";

const PAGE_SIZE = 12;

const LOCAL_BANNERS = [
  "/banner/banner-1.jpg",
  "/banner/banner-2.jpg",
  "/banner/banner-3.jpg",
];

/** Filters for a /<city>/<type> page — city and type are fixed by the route. */
export const cityTypeFilters = (
  city: string,
  type: TypePage["slug"],
  query: Record<string, string>,
): ProjectFilters =>
  filtersFromParams(query, { city, project_type: type, page_size: PAGE_SIZE });

/**
 * The body of /<city>/residential and /<city>/commercial. Both routes are thin
 * files around this so the static URL segment beats the sibling /<city>/<locality>
 * dynamic route with no ordering subtlety.
 */
export default function CityTypeListing(props: { type: TypePage }) {
  const params = useParams();
  const [sp, setParams] = useSearchParams();
  const city = createAsync(() => cityQuery(params.city!), { deferStream: true });

  const filters = createMemo<ProjectFilters>(() =>
    cityTypeFilters(params.city!, props.type.slug, sp as Record<string, string>),
  );
  // deferStream: the noindex decision below reads data().count, and Googlebot
  // sees the SSR HTML. Without this the count can resolve after the head flush,
  // so a thin page ships indexable and only gains the tag on hydration.
  const data = createAsync(() => projectsQuery(filters()), { deferStream: true });

  const setParam = (key: string, value: string | number | undefined) => {
    const patch: Record<string, string | null> = {
      [key]: value === undefined ? null : String(value),
    };
    if (key !== "page") patch.page = null;
    setParams(patch, { scroll: false });
  };
  const clearAll = () =>
    setParams(
      { status: null, bhk: null, sub_type: null, min_price: null, max_price: null, min_area: null, max_area: null, amenity: null, page: null },
      { scroll: false },
    );

  const cityName = () => city()?.name ?? params.city!;
  const path = () => `/${params.city}/${props.type.slug}`;

  /**
   * Thin pages are crawlable but not indexable. The count comes from the API
   * rather than a checked-in city list, so a page enters and leaves the index
   * as inventory changes — the same rule the sitemap section uses.
   */
  const thin = () => data() !== undefined && data()!.count < MIN_INDEXABLE;

  return (
    <Show when={city() !== undefined} fallback={<Loading />}>
      <Show when={city()} fallback={<NotFound kind="city" />}>
        <Title>
          {`${props.type.label} Property in ${cityName()} — RERA-verified projects | EstatePortal`}
        </Title>
        <Meta name="description" content={props.type.metaDescription(cityName())} />
        {/* Unconditional with a computed value, NOT wrapped in <Show>.
            thin() reads data(), which resolves after this head renders, so a
            <Show> here evaluated false and the tag never reached the SSR head —
            shipping thin pages indexable, intermittently and silently.
            (<Show> around a head tag is fine when its condition reads
            already-resolved data; the hazard is specifically an async one.) */}
        <Meta name="robots" content={thin() ? "noindex,follow" : "index,follow"} />
        <Link rel="canonical" href={canonical(path())} />

        <section class="relative isolate overflow-hidden bg-navy-deep">
          <BannerSlideshow images={city()?.image ? [city()!.image!] : []} fallback={LOCAL_BANNERS} />
          <div
            class="absolute inset-0"
            aria-hidden="true"
            style="background:linear-gradient(180deg,rgba(14,27,51,0.72) 0%,rgba(14,27,51,0.40) 36%,rgba(14,27,51,0.72) 76%,rgba(14,27,51,0.95) 100%);"
          />

          <div class="relative mx-auto flex min-h-[300px] max-w-7xl flex-col px-4 pb-8 pt-5 text-white sm:min-h-[340px] sm:px-6">
            <nav class="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-white/70" aria-label="Breadcrumb">
              <A href="/" class="transition-colors hover:text-gold-soft">Home</A>
              <span class="text-white/30">/</span>
              <A href={`/${params.city}`} class="transition-colors hover:text-gold-soft">{cityName()}</A>
              <span class="text-white/30">/</span>
              <span class="text-gold-soft">{props.type.label}</span>
            </nav>

            <div class="mt-auto max-w-3xl pt-6">
              <p class="eyebrow text-gold-soft">{props.type.label} property</p>
              <h1 class="mt-2 font-display text-[32px] font-semibold leading-[1.05] drop-shadow-sm sm:text-[42px]">
                {props.type.label} Property in{" "}
                <span class="italic text-gold-soft">{cityName()}</span>
              </h1>
              <div class="gold-rule mt-3.5" />
              <p class="mt-4 max-w-2xl text-sm text-white/80">{props.type.intro(cityName())}</p>

              <dl class="mt-4 flex flex-wrap gap-2">
                <Show when={data()}>
                  <HeroStat label="Projects" value={String(data()!.count)} />
                </Show>
                <HeroStat label="Inventory" value="RERA-verified" />
              </dl>
            </div>
          </div>

          <div
            class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent"
            aria-hidden="true"
          />
        </section>

        <div id="results" class="mx-auto max-w-7xl scroll-mt-20 px-4 py-8 sm:px-6">
          <div class="grid gap-8 lg:grid-cols-[280px_1fr]">
            <FilterPanel filters={filters()} setParam={setParam} clearAll={clearAll} lockedType />
            <ResultsGrid data={data()} ordering={filters().ordering} page={filters().page ?? 1} setParam={setParam} />
          </div>
        </div>
      </Show>
    </Show>
  );
}

function Loading() {
  return (
    <div>
      <div class="hero-gradient relative min-h-[300px] overflow-hidden sm:min-h-[340px]">
        <div class="blueprint pointer-events-none absolute inset-0" aria-hidden="true" />
        <div class="relative mx-auto flex h-full min-h-[300px] max-w-7xl flex-col justify-end px-4 pb-8 sm:min-h-[340px] sm:px-6">
          <div class="h-3 w-24 animate-pulse rounded bg-white/10" />
          <div class="mt-3 h-10 w-2/3 animate-pulse rounded bg-white/10" />
          <div class="mt-4 h-7 w-32 animate-pulse rounded-full bg-white/10" />
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

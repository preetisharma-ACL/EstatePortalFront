import {
  createAsync, useParams, useSearchParams, A, type RouteDefinition,
} from "@solidjs/router";
import { Title, Meta, Link } from "@solidjs/meta";
import { createMemo, For, Show } from "solid-js";
import BannerSlideshow from "~/components/BannerSlideshow";
import ContactBand from "~/components/ContactBand";
import NotFound from "~/components/NotFound";
import ProjectEnquiryForm from "~/components/ProjectEnquiryForm";
import ProjectStrip from "~/components/ProjectStrip";
import ResultsGrid from "~/components/ResultsGrid";
import { filtersFromParams } from "~/lib/filters";
import { projectsQuery } from "~/lib/queries";
import { getTownship } from "~/lib/townships";
import type { ProjectFilters } from "~/lib/types";

const PAGE_SIZE = 12;

const LOCAL_BANNERS = [
  "/banner/banner-1.jpg",
  "/banner/banner-2.jpg",
  "/banner/banner-3.jpg",
];

/**
 * Filters for the township's project listing. The township itself is the only
 * fixed filter — sort and page still come from the URL, so a shared link lands
 * on the same page of results.
 */
const townshipFilters = (
  searchTerm: string,
  query: Record<string, string>,
): ProjectFilters =>
  filtersFromParams(query, { search: searchTerm, page_size: PAGE_SIZE });

/** How many cards each curated strip shows — one full row on the 3-up grid. */
const STRIP_SIZE = 3;

/**
 * Handover approaching: under-construction only, soonest possession first.
 * Ready-to-move and completed projects are excluded — they have possession
 * dates in the past, so they'd otherwise monopolise an ascending sort while
 * being the one thing that is *not* "close to possession".
 */
const possessionFilters = (searchTerm: string): ProjectFilters => ({
  search: searchTerm,
  status: "under_construction",
  ordering: "possession_date",
  page_size: STRIP_SIZE,
});

/** Newest prelaunch inventory first. */
const launchFilters = (searchTerm: string): ProjectFilters => ({
  search: searchTerm,
  status: "prelaunch",
  ordering: "-created_at",
  page_size: STRIP_SIZE,
});

export const route = {
  preload: ({ params, location }) => {
    // The township comes from a local registry (synchronous), so only the
    // project queries need preloading.
    const t = getTownship(params.slug!);
    if (!t) return;
    void projectsQuery(townshipFilters(t.searchTerm, location.query as Record<string, string>));
    void projectsQuery(possessionFilters(t.searchTerm));
    void projectsQuery(launchFilters(t.searchTerm));
  },
} satisfies RouteDefinition;

export default function TownshipPage() {
  const params = useParams();
  const [sp, setParams] = useSearchParams();

  // Registry lookup — no fetch, so an unknown slug 404s on the first render
  // pass and the status code is committed before the SSR flush.
  const township = createMemo(() => getTownship(params.slug!));

  const filters = createMemo<ProjectFilters>(() =>
    township()
      ? townshipFilters(township()!.searchTerm, sp as Record<string, string>)
      : {},
  );
  const data = createAsync(() =>
    township() ? projectsQuery(filters()) : Promise.resolve(undefined),
  );
  const nearPossession = createAsync(() =>
    township() ? projectsQuery(possessionFilters(township()!.searchTerm)) : Promise.resolve(undefined),
  );
  const newLaunches = createAsync(() =>
    township() ? projectsQuery(launchFilters(township()!.searchTerm)) : Promise.resolve(undefined),
  );

  const setParam = (key: string, value: string | number | undefined) => {
    const patch: Record<string, string | null> = {
      [key]: value === undefined ? null : String(value),
    };
    if (key !== "page") patch.page = null;
    setParams(patch, { scroll: false });
  };

  return (
    <Show when={township()} fallback={<NotFound kind="township" />}>
      {(t) => {
        const heroImage = () => t().heroImages[0] ?? LOCAL_BANNERS[0];
        // Every lead from this page carries the township name, since the lead
        // schema has no township field of its own.
        const contextNote = () => `Enquiry from the ${t().name} township page`;

        return (
          <>
            <Title>{t().metaTitle}</Title>
            <Meta name="description" content={t().metaDescription} />
            <Meta property="og:title" content={t().metaTitle} />
            <Meta property="og:description" content={t().metaDescription} />
            <Show when={t().heroImages[0]}>
              <Meta property="og:image" content={t().heroImages[0]} />
            </Show>
            <Link rel="canonical" href={`/township/${t().slug}`} />

            {/* ---------------------------------------------------------------
                Hero — township imagery, headline facts, and the enquiry card.
            ---------------------------------------------------------------- */}
            <section class="relative isolate overflow-hidden bg-navy-deep">
              <BannerSlideshow
                images={t().heroImages}
                fallback={LOCAL_BANNERS}
                objectPosition={t().heroPosition}
              />
              {/* A single vertical scrim — no left-to-right wash, which greyed
                  one half of the banner and left the other unreadable. These
                  photos are mostly bright sky, so it carries real weight even at
                  its lightest point (mid-frame, behind the enquiry card) and
                  ramps up sharply at the base under the title and CTAs. */}
              <div
                class="absolute inset-0"
                aria-hidden="true"
                style="background:linear-gradient(180deg,rgba(14,27,51,0.58) 0%,rgba(14,27,51,0.46) 26%,rgba(14,27,51,0.56) 62%,rgba(14,27,51,0.82) 88%,rgba(14,27,51,0.93) 100%);"
              />

              <div class="relative mx-auto flex min-h-[520px] max-w-7xl flex-col px-4 pb-10 pt-6 text-white sm:min-h-[560px] sm:px-6">
                {/* No scrim up here any more, so the breadcrumb carries its own
                    shadow to stay readable against bright sky. */}
                <nav
                  class="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-white/80 [text-shadow:0_1px_4px_rgba(14,27,51,0.75)]"
                  aria-label="Breadcrumb"
                >
                  <A href="/" class="transition-colors hover:text-gold-soft">Home</A>
                  <span class="text-white/30">/</span>
                  <A href={`/${t().citySlug}`} class="transition-colors hover:text-gold-soft">{t().cityName}</A>
                  <span class="text-white/30">/</span>
                  <span class="text-gold-soft">{t().name}</span>
                </nav>

                {/* Title block pinned to the bottom of the frame, with the glass
                    enquiry card alongside it on wide screens. */}
                <div class="mt-auto grid gap-8 pt-16 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-end">
                  <div>
                    <span class="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/15 px-3 py-1 text-xs font-semibold text-gold-soft backdrop-blur-sm">
                      Integrated township
                    </span>
                    <h1 class="mt-4 font-display text-[34px] font-semibold leading-[1.05] drop-shadow-sm sm:text-[46px]">
                      <span class="italic text-gold-soft">{t().name}</span>
                    </h1>
                    <div class="gold-rule mt-3.5" />

                    <p class="mt-4 flex items-center gap-2 text-sm text-white/80 sm:text-base">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="shrink-0 text-gold-soft" aria-hidden="true">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>
                        {t().tagline}, {t().cityName}
                        <Show when={t().developer}>{" · by " + t().developer}</Show>
                      </span>
                    </p>

                    <dl class="mt-5 flex flex-wrap gap-2.5">
                      <For each={t().stats}>
                        {(s) => (
                          <div class="rounded-[10px] border border-white/20 bg-white/10 px-4 py-2.5 backdrop-blur-sm">
                            <dt class="eyebrow text-gold-soft">{s.label}</dt>
                            <dd class="mt-1 font-display text-base font-semibold leading-tight text-white">
                              {s.value}
                            </dd>
                          </div>
                        )}
                      </For>
                      {/* Live project count — the one hero stat that isn't authored. */}
                      <Show when={data()}>
                        <div class="rounded-[10px] border border-white/20 bg-white/10 px-4 py-2.5 backdrop-blur-sm">
                          <dt class="eyebrow text-gold-soft">Projects</dt>
                          <dd class="mt-1 font-display text-base font-semibold leading-tight text-white">
                            {data()!.count}
                          </dd>
                        </div>
                      </Show>
                    </dl>

                    <div class="mt-6 flex flex-wrap items-center gap-2.5">
                      <a
                        href="#projects"
                        class="rounded-[8px] bg-gold px-5 py-2.5 text-sm font-semibold text-navy transition-transform hover:-translate-y-0.5"
                      >
                        View projects
                      </a>
                      <a
                        href="#about"
                        class="rounded-[8px] border border-white/25 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:border-gold-soft hover:text-gold-soft"
                      >
                        About the township
                      </a>
                    </div>
                  </div>

                  {/* Glass enquiry card. Hidden below lg — the copy below the
                      hero serves narrow screens, and two stacked copies of the
                      same form would be noise. */}
                  <aside class="hidden rounded-[14px] border border-white/25 bg-navy-deep/55 p-5 shadow-[0_8px_32px_rgba(14,27,51,0.45)] backdrop-blur-xl lg:block">
                    <h2 class="font-display text-lg font-semibold leading-tight text-white">
                      Enquire about {t().name}
                    </h2>
                    <p class="mt-1 text-xs text-white/70">
                      Verified pricing, brochures &amp; an assisted site visit.
                    </p>
                    <ProjectEnquiryForm
                      idPrefix="township-banner"
                      compact
                      class="mt-4"
                      submitLabel="Request a callback"
                      citySlug={t().citySlug}
                      contextNote={contextNote()}
                    />
                  </aside>
                </div>
              </div>

              <div
                class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent"
                aria-hidden="true"
              />
            </section>

            {/* Mobile enquiry card — the banner card is lg-only, so below that
                breakpoint the same form lands here, directly under the hero. */}
            <section class="border-b border-white/10 bg-navy-deep px-4 py-8 sm:px-6 lg:hidden">
              <div class="mx-auto max-w-lg rounded-[14px] border border-white/25 bg-navy-deep/55 p-5 shadow-[0_8px_32px_rgba(14,27,51,0.45)] backdrop-blur-xl">
                <h2 class="font-display text-lg font-semibold leading-tight text-white">
                  Enquire about {t().name}
                </h2>
                <p class="mt-1 text-xs text-white/70">
                  Verified pricing, brochures &amp; an assisted site visit.
                </p>
                <ProjectEnquiryForm
                  idPrefix="township-mobile"
                  class="mt-4"
                  submitLabel="Request a callback"
                  citySlug={t().citySlug}
                  contextNote={contextNote()}
                />
              </div>
            </section>

            {/* ---------------------------------------------------------------
                About the township.
            ---------------------------------------------------------------- */}
            {/* `isolate` keeps the -z-10 shapes inside this section's stacking
                context: they paint over the white background but under the copy,
                and can't slide behind the page itself. */}
            <section id="about" class="relative isolate scroll-mt-20 overflow-hidden border-b border-line bg-card">
              {/* Copy block. The dotted-mesh flourishes anchor to the BOTTOM of
                  this wrapper — i.e. where the prose ends — rather than to the
                  section, which would strand them behind the highlight cards.
                  The wrapper is full-bleed so they reach the viewport edges. */}
              <div class="relative">
                {/* Decorative only — empty alt + aria-hidden keep them out of
                    the accessibility tree. */}
                <img
                  src="/banner/left-shape.png"
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  class="pointer-events-none absolute bottom-0 left-0 -z-10 w-[150px] select-none sm:w-[240px] lg:w-[330px]"
                />
                <img
                  src="/banner/right-shape.png"
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  class="pointer-events-none absolute bottom-0 right-0 -z-10 w-[150px] select-none sm:w-[240px] lg:w-[330px]"
                />

                <div class="mx-auto max-w-7xl px-4 pb-14 pt-16 sm:px-6 sm:pb-16 sm:pt-20">
                  <div class="mx-auto max-w-3xl text-center">
                    <h2 class="font-display text-3xl font-semibold text-navy sm:text-4xl">
                      About {t().name}
                    </h2>
                    <div class="gold-rule mx-auto mt-4" />
                  </div>

                  <div class="mx-auto mt-9 max-w-4xl space-y-5 text-center text-[15px] leading-relaxed text-slate">
                    <For each={t().about}>{(para) => <p>{para}</p>}</For>
                  </div>
                </div>
              </div>

              <Show when={t().highlights.length}>
                <div class="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20">
                  <div class="grid gap-5 sm:grid-cols-2">
                    <For each={t().highlights}>
                      {(h, i) => {
                        const n = () => String(i() + 1).padStart(2, "0");
                        return (
                          // bg-paper, not bg-card — the section itself is white
                          // now, so a white card would read as a bare outline.
                          <div class="card-lift group relative overflow-hidden rounded-[14px] border border-line bg-paper p-7">
                            {/* Oversized index, bled into the corner as a
                                watermark. Decorative, so it stays out of the
                                accessibility tree. */}
                            <span
                              aria-hidden="true"
                              class="pointer-events-none absolute -right-3 -top-5 select-none font-display text-[86px] font-semibold leading-none text-navy/[0.05] transition-colors duration-300 group-hover:text-gold/15"
                            >
                              {n()}
                            </span>

                            <div class="relative">
                              <span
                                aria-hidden="true"
                                class="inline-grid h-11 w-11 place-items-center rounded-[10px] border border-gold/35 bg-gold/10 font-display text-[15px] font-semibold text-gold transition-colors duration-300 group-hover:border-gold/60 group-hover:bg-gold/20"
                              >
                                {n()}
                              </span>
                              <h3 class="mt-4 font-display text-lg font-semibold leading-snug text-navy">
                                {h.title}
                              </h3>
                              <div class="mt-3 h-[3px] w-9 rounded-full bg-gold/70 transition-all duration-300 group-hover:w-14" />
                              <p class="mt-3.5 text-sm leading-relaxed text-slate">
                                {h.description}
                              </p>
                            </div>
                          </div>
                        );
                      }}
                    </For>
                  </div>
                </div>
              </Show>
            </section>

            {/* ---------------------------------------------------------------
                Curated slices — each hides itself when the township has no
                matching inventory, so a page never shows an empty shelf.
            ---------------------------------------------------------------- */}
            <ProjectStrip
              id="possession"
              tone="tint"
              eyebrow="Handover approaching"
              title="Top properties close to possession"
              description={`Under-construction homes in ${t().name} with the nearest handover dates — the shortest wait between booking and moving in.`}
              projects={nearPossession()?.results}
            />

            <ProjectStrip
              id="new-launches"
              eyebrow="Just launched"
              title="Newly launched properties"
              description={`The latest launches inside ${t().name}, at entry pricing and with the widest choice of units still open.`}
              projects={newLaunches()?.results}
            />

            {/* ---------------------------------------------------------------
                Projects in this township — fetched live via ?search=.
            ---------------------------------------------------------------- */}
            <section id="projects" class="scroll-mt-20 bg-paper">
              <div class="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
                <div class="mx-auto mb-9 max-w-3xl text-center">
                  <p class="eyebrow">Inventory</p>
                  <div class="gold-rule mx-auto my-3.5" />
                  <h2 class="font-display text-3xl font-semibold text-navy sm:text-4xl">
                    Projects in {t().name}
                  </h2>
                  <p class="mt-3 text-sm text-slate">
                    Every RERA-verified project we track inside the township, with
                    current pricing, configurations and possession timelines.
                  </p>
                </div>

                <ResultsGrid
                  data={data()}
                  ordering={filters().ordering}
                  page={filters().page ?? 1}
                  setParam={setParam}
                />
              </div>
            </section>

            {/* Closing conversion point — same fieldset, full width. */}
            <ContactBand
              image={heroImage()}
              address={t().address}
              citySlug={t().citySlug}
              heading={`Enquire about ${t().name}`}
              contextNote={contextNote()}
            />
          </>
        );
      }}
    </Show>
  );
}

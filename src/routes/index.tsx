import { createAsync, A, type RouteDefinition } from "@solidjs/router";
import { Title, Meta, Link } from "@solidjs/meta";
import { For, Show } from "solid-js";
import SearchBar from "~/components/SearchBar";
import FeaturedRail from "~/components/FeaturedRail";
import CityCarousel from "~/components/CityCarousel";
import ReraSeal from "~/components/ReraSeal";
import LeadForm from "~/components/LeadForm";
import { priceRange } from "~/lib/format";
import { projectsQuery, citiesQuery } from "~/lib/queries";

const FEATURED = { is_featured: true, page_size: 6 } as const;
const PREMIUM = { min_price: 50000000, ordering: "-price_min", page_size: 6 } as const;
const CITIES = { page: 1 } as const;

const COLLECTIONS = [
  { label: "Ready to move", href: "/search?status=ready_to_move" },
  { label: "Under 1 Cr", href: "/search?max_price=10000000" },
  { label: "Luxury 5 Cr+", href: "/search?min_price=50000000&ordering=-price_min" },
  { label: "New launches", href: "/search?status=prelaunch" },
  { label: "Commercial", href: "/search?project_type=commercial" },
];

export const route = {
  preload: () => {
    void projectsQuery(FEATURED);
    void projectsQuery(PREMIUM);
    void citiesQuery(CITIES);
  },
} satisfies RouteDefinition;

export default function Home() {
  const featured = createAsync(() => projectsQuery(FEATURED));
  const premium = createAsync(() => projectsQuery(PREMIUM));
  const cities = createAsync(() => citiesQuery(CITIES));

  // Premium rail — arrow-driven horizontal scroll (native scrollbar hidden).
  let premiumScroller: HTMLDivElement | undefined;
  const scrollPremium = (dir: 1 | -1) =>
    premiumScroller?.scrollBy({ left: dir * 380, behavior: "smooth" });

  return (
    <>
      <Title>EstatePortal — RERA-verified property across India</Title>
      <Meta name="description" content="Discover RERA-verified residential and commercial projects across India. Verified pricing, trusted developers, and assisted site visits for investors and end-users." />
      <Meta property="og:title" content="EstatePortal — RERA-verified property across India" />
      <Meta property="og:type" content="website" />
      <Link rel="canonical" href="/" />

      {/* 1. HERO */}
      <section class="hero-gradient relative overflow-hidden text-white">
        <div class="blueprint pointer-events-none absolute inset-0 opacity-100" aria-hidden="true" />
        <div class="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
          <div class="mx-auto max-w-5xl text-center">
            <span class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5">
              <ReraSeal size="sm" />
              <span class="text-sm font-medium text-gold-soft">Every project RERA-verified</span>
            </span>
            <h1 class="mt-6 font-display text-[40px] font-semibold leading-[1.05] sm:text-6xl lg:text-7xl">
              Property discovery,
              <br />
              <span class="italic text-gold-soft">done with conviction.</span>
            </h1>
            <div class="gold-rule mx-auto mt-6" />
            <p class="mx-auto mt-6 max-w-3xl text-base text-white/75 sm:text-lg">
              A content-rich, RERA-verifiable portal for residential and commercial
              real estate across India — built for investors, NRIs and end-users who
              expect the truth, verified.
            </p>
          </div>

          {/* Search card */}
          <div class="mx-auto mt-10 max-w-4xl">
            <SearchBar variant="hero" showTypeToggle placeholder="Search by city, locality, project or developer" />
            <div class="mt-4 flex flex-wrap items-center justify-center gap-2">
              <For each={COLLECTIONS.slice(0, 4)}>
                {(c) => (
                  <A href={c.href} class="rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-sm text-white/85 transition-colors hover:border-gold-soft hover:text-gold-soft">
                    {c.label}
                  </A>
                )}
              </For>
            </div>
          </div>
        </div>
      </section>

      {/* 2. QUICK COLLECTIONS */}
      <section class="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <For each={COLLECTIONS}>
            {(c) => (
              <A
                href={c.href}
                class="card-lift group flex items-center justify-between rounded-[12px] border border-gold/40 bg-card px-4 py-4 text-navy"
              >
                <span class="font-semibold">{c.label}</span>
                <span class="text-gold transition-transform group-hover:translate-x-0.5">→</span>
              </A>
            )}
          </For>
        </div>
      </section>

      {/* 3. FEATURED PROJECTS */}
      <FeaturedRail projects={featured()?.results ?? null} />

      {/* 4. PREMIUM & INVESTOR COLLECTION */}
      <section class="hero-gradient relative overflow-hidden py-16 text-white">
        <div class="blueprint pointer-events-none absolute inset-0" aria-hidden="true" />
        <div class="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div class="flex items-end justify-between gap-4">
            <div class="max-w-2xl">
              <p class="eyebrow text-gold-soft">For the discerning investor</p>
              <h2 class="mt-3 font-display text-3xl font-semibold sm:text-4xl">
                The premium & investor <span class="italic text-gold-soft">collection</span>
              </h2>
              <p class="mt-3 text-white/70">
                Landmark residences and grade-A commercial assets — curated for capital
                appreciation and rental yield, with full RERA and pricing transparency.
              </p>
            </div>

            {/* Prev/next arrows — drive the rail below (scrollbar hidden) */}
            <div class="hidden shrink-0 items-center gap-3 sm:flex">
              <button
                type="button"
                aria-label="Previous"
                onClick={() => scrollPremium(-1)}
                class="grid h-10 w-10 place-items-center rounded-full border border-white/25 text-white transition-colors hover:border-gold hover:bg-gold hover:text-navy-deep"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={() => scrollPremium(1)}
                class="grid h-10 w-10 place-items-center rounded-full border border-white/25 text-white transition-colors hover:border-gold hover:bg-gold hover:text-navy-deep"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg>
              </button>
            </div>
          </div>

          <Show when={premium()} fallback={<div class="mt-8 h-64" />}>
            <div
              ref={premiumScroller}
              class="mt-8 flex snap-x gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <For each={premium()!.results}>
                {(p) => (
                  <A
                    href={`/project/${p.slug}`}
                    class="group w-[300px] shrink-0 snap-start overflow-hidden rounded-[12px] border border-white/10 bg-white/[0.04] sm:w-[360px]"
                  >
                    <div class="img-scrim relative aspect-[16/10] overflow-hidden bg-white/5">
                      <Show when={p.cover_image} fallback={<div class="grid h-full place-items-center font-display text-white/40">{p.name}</div>}>
                        <img src={p.cover_image!} alt={p.name} loading="lazy" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </Show>
                      <div class="absolute right-3 top-3 z-10"><ReraSeal size="sm" /></div>
                    </div>
                    <div class="p-4">
                      <h3 class="font-display text-xl font-semibold text-white">{p.name}</h3>
                      <p class="mt-0.5 text-sm text-white/60">{p.location.locality}, {p.location.city}</p>
                      <p class="mt-2 font-display text-lg text-gold-soft">{priceRange(p.price_min, p.price_max)}</p>
                    </div>
                  </A>
                )}
              </For>
            </div>
          </Show>
          <A href="/search?min_price=50000000&ordering=-price_min" class="mt-4 inline-block text-sm font-semibold text-gold-soft hover:underline">
            Explore the full collection →
          </A>
        </div>
      </section>

      {/* 5. TRUST BAND */}
      <section id="trust" class="relative isolate overflow-hidden bg-navy py-16 text-white">
        {/* Fixed parallax background image */}
        <div
          class="pointer-events-none absolute inset-0 bg-fixed bg-cover bg-center"
          style="background-image:url('/banner/banner-2.jpg')"
          aria-hidden="true"
        />
        <div class="pointer-events-none absolute inset-0 bg-navy-deep/85" aria-hidden="true" />
        <div class="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div class="mx-auto max-w-2xl text-center">
            <p class="eyebrow text-gold-soft">Why EstatePortal</p>
            <h2 class="mt-3 font-display text-3xl font-semibold sm:text-4xl">
              Trust, <span class="italic text-gold-soft">verified</span> at every step
            </h2>
          </div>
          <div class="mt-12 grid gap-8 md:grid-cols-3">
            <TrustCol
              seal
              title="Every project RERA-verified"
              body="We surface the registration number, phase and authority for every listing, with a direct link to the official state RERA portal."
            />
            <TrustCol
              icon="rupee"
              title="Verified, transparent pricing"
              body="Configuration-level pricing and carpet areas sourced from developers — no hidden markups, no mystery quotes."
            />
            <TrustCol
              icon="visit"
              title="Assisted site visits"
              body="Our advisory team arranges site visits and shares documentation so you decide with complete information."
            />
          </div>
        </div>
      </section>

      {/* 6. EXPLORE BY CITY */}
      <Show when={cities()} fallback={<div class="mx-auto max-w-7xl px-4 py-14 sm:px-6"><GridSkeleton /></div>}>
        <CityCarousel cities={cities()!.results} />
      </Show>

      {/* LEAD / ENQUIRE */}
      <section id="enquire" class="scroll-mt-20 bg-paper py-16 sm:py-24">
        <div class="mx-auto max-w-7xl px-4 sm:px-6">
          <div class="overflow-hidden rounded-[22px] border border-line bg-card shadow-[0_40px_90px_-50px_rgba(14,27,51,0.45)] lg:grid lg:grid-cols-[0.92fr_1.08fr]">
            {/* Left — navy panel with the pitch and trust points */}
            <div class="hero-gradient relative overflow-hidden p-8 text-white sm:p-10 lg:p-12">
              <div class="blueprint pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
              <div class="relative flex h-full flex-col">
                <p class="eyebrow text-gold-soft">Advisory</p>
                <h2 class="mt-3 font-display text-3xl font-semibold leading-tight sm:text-4xl">
                  Speak to a <span class="italic text-gold-soft">property advisor</span>
                </h2>
                <p class="mt-4 max-w-md text-white/70">
                  Tell us what you're looking for. A verified advisor will help you
                  shortlist RERA-verified options — with no pressure, no spam.
                </p>

                <ul class="mt-8 space-y-4">
                  <For each={[
                    "RERA-verified projects, every time",
                    "Transparent, developer-sourced pricing",
                    "Assisted site visits & documentation",
                  ]}>
                    {(point) => (
                      <li class="flex items-start gap-3 text-sm text-white/85">
                        <span class="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold/15 text-gold-soft">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                        </span>
                        {point}
                      </li>
                    )}
                  </For>
                </ul>

                <div class="mt-auto hidden items-center gap-3 pt-10 lg:flex">
                  <ReraSeal size="md" />
                  <p class="text-xs leading-relaxed text-white/60">
                    Your details stay private and are used only to assist your enquiry.
                  </p>
                </div>
              </div>
            </div>

            {/* Right — the form on a clean card */}
            <div class="p-6 sm:p-8 lg:p-10">
              <LeadForm
                heading="Send your enquiry"
                subheading="It takes under a minute — we'll take it from there."
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function TrustCol(props: { title: string; body: string; seal?: boolean; icon?: "rupee" | "visit" }) {
  return (
    <div class="rounded-[12px] border border-white/10 bg-white/[0.03] p-6">
      <div class="mb-4">
        <Show when={props.seal} fallback={<TrustIcon icon={props.icon!} />}>
          <ReraSeal size="md" />
        </Show>
      </div>
      <h3 class="font-display text-xl font-semibold text-white">{props.title}</h3>
      <p class="mt-2 text-sm leading-relaxed text-white/65">{props.body}</p>
    </div>
  );
}

function TrustIcon(props: { icon: "rupee" | "visit" }) {
  return (
    <span class="grid h-11 w-11 place-items-center rounded-full bg-gold/15 text-gold-soft">
      <Show
        when={props.icon === "rupee"}
        fallback={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" />
          </svg>
        }
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 6h9M8 6a3 3 0 0 1 0 6H6l6 6M8 9h9M13 6c0 3-2 6-5 6" />
        </svg>
      </Show>
    </span>
  );
}

function GridSkeleton() {
  return (
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <For each={[0, 1, 2]}>
        {() => (
          <div class="overflow-hidden rounded-[12px] border border-line bg-card">
            <div class="aspect-[4/3] animate-pulse bg-navy/5" />
            <div class="space-y-3 p-4">
              <div class="h-4 w-1/2 animate-pulse rounded bg-navy/5" />
              <div class="h-5 w-2/3 animate-pulse rounded bg-navy/5" />
            </div>
          </div>
        )}
      </For>
    </div>
  );
}

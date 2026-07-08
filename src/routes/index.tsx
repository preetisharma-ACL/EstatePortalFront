import { createAsync, A, type RouteDefinition } from "@solidjs/router";
import { Title, Meta, Link } from "@solidjs/meta";
import { For, Show } from "solid-js";
import SearchBar from "~/components/SearchBar";
import ProjectCard from "~/components/ProjectCard";
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
          <div class="mx-auto max-w-3xl text-center">
            <span class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5">
              <ReraSeal size="sm" />
              <span class="text-sm font-medium text-gold-soft">Every project RERA-verified</span>
            </span>
            <h1 class="mt-6 font-display text-[40px] font-semibold leading-[1.05] sm:text-6xl">
              Property discovery,
              <br />
              <span class="italic text-gold-soft">done with conviction.</span>
            </h1>
            <div class="gold-rule mx-auto mt-6" />
            <p class="mx-auto mt-6 max-w-xl text-base text-white/75 sm:text-lg">
              A content-rich, RERA-verifiable portal for residential and commercial
              real estate across India — built for investors, NRIs and end-users who
              expect the truth, verified.
            </p>
          </div>

          {/* Search card */}
          <div class="mx-auto mt-10 max-w-2xl">
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
      <Section
        eyebrow="Handpicked"
        title="Featured projects"
        subtitle="Verified, well-documented launches our advisory team stands behind."
        cta={{ href: "/search?is_featured=true", label: "View all featured" }}
      >
        <Show when={featured()} fallback={<GridSkeleton />}>
          <div class="reveal grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <For each={featured()!.results}>{(p) => <ProjectCard project={p} />}</For>
          </div>
          <Show when={!featured()!.results.length}>
            <EmptyNote />
          </Show>
        </Show>
      </Section>

      {/* 4. PREMIUM & INVESTOR COLLECTION */}
      <section class="hero-gradient relative overflow-hidden py-16 text-white">
        <div class="blueprint pointer-events-none absolute inset-0" aria-hidden="true" />
        <div class="relative mx-auto max-w-7xl px-4 sm:px-6">
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

          <Show when={premium()} fallback={<div class="mt-8 h-64" />}>
            <div class="mt-8 flex snap-x gap-5 overflow-x-auto pb-4">
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
      <section id="trust" class="bg-navy py-16 text-white">
        <div class="mx-auto max-w-7xl px-4 sm:px-6">
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
      <Section eyebrow="Where to look" title="Explore by city" subtitle="Serious inventory across India's primary and emerging markets.">
        <Show when={cities()} fallback={<GridSkeleton />}>
          <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <For each={cities()!.results.slice(0, 8)}>
              {(c) => (
                <A href={`/${c.slug}`} class="card-lift group relative overflow-hidden rounded-[12px] border border-line bg-navy">
                  <div class="hero-gradient flex aspect-[4/3] flex-col justify-end p-4">
                    <span class="font-display text-xl font-semibold text-white">{c.name}</span>
                    <span class="text-xs text-white/60">{c.state} · Tier {c.tier}</span>
                  </div>
                </A>
              )}
            </For>
          </div>
        </Show>
      </Section>

      {/* LEAD / ENQUIRE */}
      <section id="enquire" class="mx-auto max-w-3xl scroll-mt-20 px-4 py-16 sm:px-6">
        <div class="rounded-[16px] border border-line bg-card p-6 shadow-sm sm:p-10">
          <LeadForm
            heading="Speak to a property advisor"
            subheading="Tell us what you're looking for. A verified advisor will help you shortlist RERA-verified options."
          />
        </div>
      </section>
    </>
  );
}

function Section(props: {
  eyebrow: string; title: string; subtitle?: string;
  cta?: { href: string; label: string }; children: any;
}) {
  return (
    <section class="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div class="max-w-2xl">
          <p class="eyebrow">{props.eyebrow}</p>
          <h2 class="mt-2 font-display text-3xl font-semibold text-navy sm:text-4xl">{props.title}</h2>
          <Show when={props.subtitle}>
            <p class="mt-2 text-slate">{props.subtitle}</p>
          </Show>
        </div>
        <Show when={props.cta}>
          <A href={props.cta!.href} class="text-sm font-semibold text-gold hover:underline">
            {props.cta!.label} →
          </A>
        </Show>
      </div>
      {props.children}
    </section>
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

function EmptyNote() {
  return (
    <p class="rounded-[12px] border border-dashed border-line bg-card p-8 text-center text-slate">
      Featured projects will appear here once the catalogue is populated.
    </p>
  );
}

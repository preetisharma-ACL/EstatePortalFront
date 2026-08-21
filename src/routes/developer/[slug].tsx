import {
  createAsync, useParams, A, type RouteDefinition,
} from "@solidjs/router";
import { Title, Meta, Link } from "@solidjs/meta";
import { Show, For, createSignal, createMemo, type JSX } from "solid-js";
import { developerQuery, projectsQuery } from "~/lib/queries";
import { formatINR, statusLabel } from "~/lib/format";
import { openLeadModal } from "~/lib/leadModal";
import ProjectCard from "~/components/ProjectCard";
import VerifiedTick from "~/components/VerifiedTick";
import ReraSeal from "~/components/ReraSeal";
import LeadForm from "~/components/LeadForm";
import NotFound from "~/components/NotFound";
import type { ProjectListItem } from "~/lib/types";
import { canonical, absoluteUrl } from "~/lib/seo";

export const route = {
  preload: ({ params }) => {
    void developerQuery(params.slug!);
    void projectsQuery({ developer: params.slug!, page_size: 12 });
  },
} satisfies RouteDefinition;

export default function DeveloperPage() {
  const params = useParams();
  const developer = createAsync(() => developerQuery(params.slug!), { deferStream: true });
  const projects = createAsync(() => projectsQuery({ developer: params.slug!, page_size: 12 }));

  const results = (): ProjectListItem[] => projects()?.results ?? [];

  /* Everything below is derived from the projects actually returned — no
     invented figures. Each tile hides when its value can't be computed. */

  const cities = createMemo(() => {
    const seen = new Map<string, string>();
    for (const p of results()) seen.set(p.location.city_slug, p.location.city);
    return [...seen].map(([slug, name]) => ({ slug, name }));
  });

  const priceFrom = createMemo(() => {
    const lows = results().map((p) => p.price_min).filter((v): v is number => v != null);
    return lows.length ? Math.min(...lows) : null;
  });

  const reraCount = createMemo(() => results().filter((p) => p.primary_rera).length);

  const statuses = createMemo(() => {
    const seen = new Map<string, number>();
    for (const p of results()) seen.set(p.status, (seen.get(p.status) ?? 0) + 1);
    return [...seen].map(([status, count]) => ({ status, count }));
  });

  const configs = createMemo(() => {
    const seen = new Set<string>();
    for (const p of results()) for (const c of p.configurations_summary ?? []) seen.add(c);
    return [...seen].slice(0, 10);
  });

  return (
    <Show when={developer() !== undefined} fallback={<Loading />}>
      <Show when={developer()} fallback={<NotFound kind="developer" />}>
      {(d) => {
        const [expanded, setExpanded] = createSignal(false);
        /* The backend sends one long description string; split it on blank lines
           so it reads as paragraphs instead of a wall of text. */
        const paragraphs = createMemo(() =>
          (d().description ?? "")
            .split(/\n\s*\n/)
            .map((s) => s.trim())
            .filter(Boolean),
        );
        const visible = () => (expanded() ? paragraphs() : paragraphs().slice(0, 2));
        const total = () => projects()?.count ?? d().project_count;

        return (
        <>
          {/* Head tags live on the resolved path only — a 404 must not emit a
              self-referential canonical or this developer's title/meta. */}
          <Title>{d().meta_title || `${d().name} — projects & RERA details | EstatePortal`}</Title>
          <Meta name="description" content={d().meta_description || d().description?.slice(0, 160) || ""} />
          <Meta property="og:title" content={d().meta_title || d().name} />
          <Show when={d().og_image}><Meta property="og:image" content={absoluteUrl(d().og_image!)} /></Show>
          <Link rel="canonical" href={canonical(`/developer/${d().slug}`)} />

          {/* ── HERO ─────────────────────────────────────────────────────── */}
          <section class="hero-gradient relative overflow-hidden text-white">
            <div class="blueprint pointer-events-none absolute inset-0" aria-hidden="true" />
            {/* Oversized watermark initial — the same trick the project hero uses
                to stop a sparse header feeling empty. */}
            <span
              class="pointer-events-none absolute -right-8 top-1/2 hidden -translate-y-1/2 select-none font-display text-[19rem] font-semibold leading-none text-white/[0.04] lg:block"
              aria-hidden="true"
            >
              {d().name.charAt(0)}
            </span>

            <div class="relative mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pb-20">
              <nav aria-label="Breadcrumb" class="mb-8 text-sm text-white/50">
                <A href="/" class="hover:text-gold-soft">Home</A>
                <span class="mx-2" aria-hidden="true">/</span>
                <A href="/developers" class="hover:text-gold-soft">Developers</A>
                <span class="mx-2" aria-hidden="true">/</span>
                <span class="text-white/80">{d().name}</span>
              </nav>

              <div class="flex flex-col gap-7 md:flex-row md:items-start">
                <div class="grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-[18px] border border-gold/40 bg-white p-3 shadow-[0_24px_50px_-24px_rgba(0,0,0,0.7)] sm:h-32 sm:w-32">
                  <Show
                    when={d().logo}
                    fallback={<span class="font-display text-5xl font-semibold text-navy">{d().name.charAt(0)}</span>}
                  >
                    <img src={d().logo!} alt={`${d().name} logo`} class="h-full w-full object-contain" />
                  </Show>
                </div>

                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-3">
                    <h1 class="font-display text-[34px] font-semibold leading-none sm:text-5xl">{d().name}</h1>
                    <Show when={d().is_verified}>
                      <span class="inline-flex items-center gap-1.5 rounded-full border border-green/40 bg-green/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-white">
                        <VerifiedTick size={14} /> Verified developer
                      </span>
                    </Show>
                  </div>

                  <div class="gold-rule mt-5" />

                  <ul class="mt-5 flex flex-wrap gap-x-2.5 gap-y-2 text-sm">
                    <Show when={d().established_year}>
                      {(y) => <MetaPill icon="calendar">Established {y()}</MetaPill>}
                    </Show>
                    <Show when={d().headquarters?.trim()}>
                      <MetaPill icon="pin">{d().headquarters.replace(/^HQ:\s*/i, "").replace(/^Address:\s*/i, "")}</MetaPill>
                    </Show>
                    <MetaPill icon="building">
                      {total()} {total() === 1 ? "project" : "projects"} listed
                    </MetaPill>
                  </ul>

                  <div class="mt-7 flex flex-wrap items-center gap-3">
                    <a
                      href="#projects"
                      class="rounded-[8px] bg-gold px-5 py-3 text-sm font-semibold text-navy transition-transform hover:-translate-y-0.5"
                    >
                      View projects
                    </a>
                    <button
                      type="button"
                      onClick={() => openLeadModal()}
                      class="rounded-[8px] border border-white/25 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-gold-soft hover:text-gold-soft"
                    >
                      Talk to an advisor
                    </button>
                    <Show when={d().website}>
                      <a
                        href={d().website}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        class="inline-flex items-center gap-1.5 px-1 text-sm font-semibold text-gold-soft hover:underline"
                      >
                        Visit website
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><path d="M15 3h6v6" /><path d="M10 14 21 3" />
                        </svg>
                      </a>
                    </Show>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── STATS STRIP — computed from the listed projects ───────────── */}
          <Show when={results().length}>
            <section class="relative z-10 mx-auto -mt-8 max-w-7xl px-4 sm:px-6">
              <dl class="grid grid-cols-2 gap-px overflow-hidden rounded-[16px] border border-line bg-line shadow-[0_30px_60px_-40px_rgba(14,27,51,0.5)] lg:grid-cols-4">
                <Stat label="Projects listed" value={String(total())} />
                <Show when={cities().length}>
                  <Stat label={cities().length === 1 ? "City" : "Cities"} value={String(cities().length)} />
                </Show>
                <Show when={priceFrom() != null}>
                  <Stat label="Starting from" value={formatINR(priceFrom())} />
                </Show>
                <Show when={reraCount()}>
                  <Stat label="RERA-verified" value={`${reraCount()} of ${results().length}`} />
                </Show>
              </dl>
            </section>
          </Show>

          {/* ── ABOUT + AT A GLANCE ──────────────────────────────────────── */}
          <section class="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
            <div class="grid gap-10 lg:grid-cols-[1.55fr_1fr] lg:gap-14">
              <div>
                <p class="eyebrow">About</p>
                <h2 class="mt-3 font-display text-3xl font-semibold text-navy sm:text-4xl">
                  The story behind <span class="italic text-gold">{d().name}</span>
                </h2>
                <div class="gold-rule mt-5" />

                <Show
                  when={paragraphs().length}
                  fallback={
                    <p class="mt-7 text-[15px] leading-[1.85] text-slate">
                      We're still compiling the profile for {d().name}. In the meantime, their
                      live inventory is listed below — every project with its RERA registration
                      and developer-sourced pricing.
                    </p>
                  }
                >
                  <div class="mt-7 space-y-5">
                    <For each={visible()}>
                      {(para) => <p class="text-[15px] leading-[1.85] text-slate">{para}</p>}
                    </For>
                  </div>
                  <Show when={paragraphs().length > 2}>
                    <button
                      type="button"
                      onClick={() => setExpanded((v) => !v)}
                      aria-expanded={expanded()}
                      class="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:underline"
                    >
                      {expanded() ? "Show less" : "Read the full profile"}
                      <span
                        class="transition-transform"
                        style={expanded() ? "transform:rotate(180deg)" : ""}
                        aria-hidden="true"
                      >
                        ↓
                      </span>
                    </button>
                  </Show>
                </Show>
              </div>

              {/* At a glance */}
              <aside class="lg:sticky lg:top-24 lg:self-start">
                <div class="rounded-[16px] border border-line bg-card p-6 sm:p-7">
                  <h3 class="font-display text-xl font-semibold text-navy">At a glance</h3>
                  <div class="gold-rule mt-3" />
                  <dl class="mt-5 divide-y divide-line">
                    <Show when={d().established_year}>
                      {(y) => <GlanceRow label="Established">{y()}</GlanceRow>}
                    </Show>
                    <Show when={d().headquarters?.trim()}>
                      <GlanceRow label="Headquarters">
                        {d().headquarters.replace(/^HQ:\s*/i, "").replace(/^Address:\s*/i, "")}
                      </GlanceRow>
                    </Show>
                    <GlanceRow label="Projects listed">{total()}</GlanceRow>
                    <Show when={cities().length}>
                      <GlanceRow label="Present in">
                        {cities().map((c) => c.name).join(", ")}
                      </GlanceRow>
                    </Show>
                    <GlanceRow label="Verification">
                      <Show
                        when={d().is_verified}
                        fallback={<span class="text-slate">Verification pending</span>}
                      >
                        <span class="inline-flex items-center gap-1.5 font-semibold text-green">
                          <VerifiedTick size={14} /> Verified on EstatePortal
                        </span>
                      </Show>
                    </GlanceRow>
                    <Show when={d().website}>
                      <GlanceRow label="Website">
                        <a
                          href={d().website}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          class="font-semibold text-navy underline decoration-gold underline-offset-4 hover:text-gold"
                        >
                          Official site →
                        </a>
                      </GlanceRow>
                    </Show>
                  </dl>

                  <button
                    type="button"
                    onClick={() => openLeadModal()}
                    class="mt-6 w-full rounded-[8px] bg-navy px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-deep"
                  >
                    Enquire about {d().name}
                  </button>
                </div>

                {/* Configurations across their inventory */}
                <Show when={configs().length}>
                  <div class="mt-5 rounded-[16px] border border-line bg-card p-6 sm:p-7">
                    <h3 class="font-display text-lg font-semibold text-navy">Configurations offered</h3>
                    <div class="mt-4 flex flex-wrap gap-2">
                      <For each={configs()}>
                        {(c) => (
                          <span class="rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-medium text-navy/75">
                            {c}
                          </span>
                        )}
                      </For>
                    </div>
                  </div>
                </Show>
              </aside>
            </div>
          </section>

          {/* ── PRESENCE ─────────────────────────────────────────────────── */}
          <Show when={cities().length}>
            <section class="border-y border-line bg-[#f8f5f2] py-12 sm:py-14">
              <div class="mx-auto max-w-7xl px-4 sm:px-6">
                <div class="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p class="eyebrow">Where they build</p>
                    <h2 class="mt-2.5 font-display text-2xl font-semibold text-navy sm:text-3xl">
                      {d().name} across <span class="italic text-gold">India</span>
                    </h2>
                  </div>
                  <A href={`/search?developer=${d().slug}`} class="text-sm font-semibold text-gold hover:underline">
                    See the full inventory →
                  </A>
                </div>
                <div class="mt-7 flex flex-wrap gap-2.5">
                  <For each={cities()}>
                    {(c) => (
                      <A
                        href={`/search?developer=${d().slug}&city=${c.slug}`}
                        class="card-lift inline-flex items-center gap-2 rounded-full border border-line bg-card px-4 py-2.5 text-sm font-semibold text-navy"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0 text-gold" aria-hidden="true">
                          <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" />
                        </svg>
                        {c.name}
                      </A>
                    )}
                  </For>
                </div>
              </div>
            </section>
          </Show>

          {/* ── PROJECTS ─────────────────────────────────────────────────── */}
          <section id="projects" class="scroll-mt-20 mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
            <div class="flex flex-wrap items-end justify-between gap-5">
              <div>
                <p class="eyebrow">Live inventory</p>
                <h2 class="mt-2.5 font-display text-3xl font-semibold text-navy sm:text-4xl">
                  Projects by <span class="italic text-gold">{d().name}</span>
                </h2>
                <div class="gold-rule mt-4" />
              </div>

              <Show when={statuses().length > 1}>
                <div class="flex flex-wrap gap-2">
                  <For each={statuses()}>
                    {(s) => (
                      <A
                        href={`/search?developer=${d().slug}&status=${s.status}`}
                        class="rounded-full border border-line bg-card px-3.5 py-2 text-xs font-semibold text-navy/80 transition-colors hover:border-gold hover:text-navy"
                      >
                        {statusLabel(s.status)}
                        <span class="ml-1.5 text-slate">{s.count}</span>
                      </A>
                    )}
                  </For>
                </div>
              </Show>
            </div>

            <Show when={projects()} fallback={<ProjectsSkeleton />}>
              <Show
                when={results().length}
                fallback={
                  <div class="mt-10 rounded-[16px] border border-dashed border-line bg-card p-10 text-center">
                    <p class="font-display text-xl font-semibold text-navy">No live projects listed yet</p>
                    <p class="mx-auto mt-2 max-w-md text-sm text-slate">
                      We don't currently have inventory from {d().name} on the portal. Tell our
                      advisory team what you're looking for and we'll let you know the moment
                      something launches.
                    </p>
                    <button
                      type="button"
                      onClick={() => openLeadModal()}
                      class="mt-6 rounded-[8px] bg-gold px-5 py-3 text-sm font-semibold text-navy transition-transform hover:-translate-y-0.5"
                    >
                      Register your requirement
                    </button>
                  </div>
                }
              >
                <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <For each={results()}>{(p) => <ProjectCard project={p} />}</For>
                </div>
                <Show when={projects()!.count > results().length}>
                  <div class="mt-10 text-center">
                    <A
                      href={`/search?developer=${d().slug}`}
                      class="inline-flex items-center gap-2 rounded-[8px] border border-navy/25 px-6 py-3 text-sm font-semibold text-navy transition-colors hover:border-navy hover:bg-navy hover:text-white"
                    >
                      View all {projects()!.count} projects
                      <span aria-hidden="true">→</span>
                    </A>
                  </div>
                </Show>
              </Show>
            </Show>
          </section>

          {/* ── RERA TRUST BAND ──────────────────────────────────────────── */}
          <section class="relative isolate overflow-hidden bg-navy py-14 text-white sm:py-16">
            <div
              class="pointer-events-none absolute inset-0 bg-fixed bg-cover bg-center"
              style="background-image:url('/banner/banner-2.jpg')"
              aria-hidden="true"
            />
            <div class="pointer-events-none absolute inset-0 bg-navy-deep/88" aria-hidden="true" />
            <div class="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
              <div class="flex justify-center"><ReraSeal size="md" /></div>
              <h2 class="mt-5 font-display text-2xl font-semibold sm:text-3xl">
                Every {d().name} listing carries its{" "}
                <span class="italic text-gold-soft">RERA registration</span>
              </h2>
              <p class="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-white/70">
                We publish the registration number, the phase it covers and the issuing
                authority on each project page. Verify it on the official state RERA portal
                before you transact — our badge is a convenience, not a certification.
              </p>
              <A href="/why-estateportal" class="mt-6 inline-block text-sm font-semibold text-gold-soft hover:underline">
                How we verify →
              </A>
            </div>
          </section>

          {/* ── ENQUIRE ──────────────────────────────────────────────────── */}
          <section class="bg-paper py-14 sm:py-20">
            <div class="mx-auto max-w-7xl px-4 sm:px-6">
              <div class="overflow-hidden rounded-[22px] border border-line bg-card shadow-[0_40px_90px_-50px_rgba(14,27,51,0.45)] lg:grid lg:grid-cols-[0.92fr_1.08fr]">
                <div class="hero-gradient relative overflow-hidden p-8 text-white sm:p-10 lg:p-12">
                  <div class="blueprint pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
                  <div class="relative">
                    <p class="eyebrow text-gold-soft">Advisory</p>
                    <h2 class="mt-3 font-display text-3xl font-semibold leading-tight sm:text-4xl">
                      Interested in a{" "}
                      <span class="italic text-gold-soft">{d().name}</span> project?
                    </h2>
                    <p class="mt-4 max-w-md text-white/70">
                      Tell us the budget and configuration you have in mind. An advisor will
                      shortlist what fits from their live inventory, share verified pricing and
                      arrange the site visit.
                    </p>
                  </div>
                </div>
                <div class="p-6 sm:p-8 lg:p-10">
                  <LeadForm
                    heading={`Enquire about ${d().name}`}
                    subheading="Verified details, transparent pricing, assisted site visits."
                  />
                </div>
              </div>
            </div>
          </section>
        </>
        );
      }}
      </Show>
    </Show>
  );
}

function Stat(props: { label: string; value: string }) {
  return (
    <div class="bg-card px-5 py-6 text-center sm:px-6">
      <dt class="eyebrow">{props.label}</dt>
      <dd class="mt-2 font-display text-2xl font-semibold text-navy sm:text-[28px]">
        {props.value}
      </dd>
    </div>
  );
}

function GlanceRow(props: { label: string; children: JSX.Element }) {
  return (
    <div class="grid grid-cols-[8.5rem_1fr] gap-3 py-3.5 text-sm">
      <dt class="font-medium text-slate">{props.label}</dt>
      <dd class="font-semibold text-navy">{props.children}</dd>
    </div>
  );
}

function MetaPill(props: { icon: "calendar" | "pin" | "building"; children: JSX.Element }) {
  return (
    <li class="inline-flex max-w-full items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-white/80">
      <span class="shrink-0 text-gold-soft" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
          <Show when={props.icon === "calendar"}>
            <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" />
          </Show>
          <Show when={props.icon === "pin"}>
            <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" />
          </Show>
          <Show when={props.icon === "building"}>
            <path d="M4 21V6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v15M12 21V10a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v11M3 21h18M7 9h2M7 13h2M16 13h2M16 17h2" />
          </Show>
        </svg>
      </span>
      <span class="truncate">{props.children}</span>
    </li>
  );
}

function ProjectsSkeleton() {
  return (
    <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <For each={[0, 1, 2, 3, 4, 5]}>
        {() => (
          <div class="overflow-hidden rounded-[14px] border border-line bg-card">
            <div class="aspect-[4/3] animate-pulse bg-navy/5" />
            <div class="space-y-3 p-5">
              <div class="h-3 w-1/3 animate-pulse rounded bg-navy/5" />
              <div class="h-5 w-2/3 animate-pulse rounded bg-navy/5" />
              <div class="h-3 w-1/2 animate-pulse rounded bg-navy/5" />
            </div>
          </div>
        )}
      </For>
    </div>
  );
}

function Loading() {
  return (
    <div>
      <div class="hero-gradient relative overflow-hidden">
        <div class="blueprint pointer-events-none absolute inset-0" aria-hidden="true" />
        <div class="relative mx-auto flex max-w-7xl gap-7 px-4 pb-16 pt-16 sm:px-6">
          <div class="h-28 w-28 shrink-0 animate-pulse rounded-[18px] bg-white/10 sm:h-32 sm:w-32" />
          <div class="flex-1 space-y-4 pt-2">
            <div class="h-10 w-2/3 animate-pulse rounded bg-white/10" />
            <div class="h-4 w-1/2 animate-pulse rounded bg-white/10" />
            <div class="h-9 w-56 animate-pulse rounded bg-white/10" />
          </div>
        </div>
      </div>
      <div class="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div class="h-4 w-24 animate-pulse rounded bg-navy/5" />
        <div class="mt-4 h-8 w-1/2 animate-pulse rounded bg-navy/5" />
      </div>
    </div>
  );
}

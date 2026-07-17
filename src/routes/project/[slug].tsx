import {
  createAsync, useParams, A, type RouteDefinition,
} from "@solidjs/router";
import { Title, Meta, Link } from "@solidjs/meta";
import { Show, For } from "solid-js";
import { projectQuery } from "~/lib/queries";
import { priceRange, areaRange, statusLabel, typeLabel, possession, formatINR, landArea } from "~/lib/format";
import GalleryGrid from "~/components/GalleryGrid";
import FloorPlan from "~/components/FloorPlan";
import AboutDeveloper from "~/components/AboutDeveloper";
import ContactBand from "~/components/ContactBand";
import BannerSlideshow from "~/components/BannerSlideshow";
import VideoPanel from "~/components/VideoPanel";
import ReraBadges from "~/components/ReraBadges";
import ReraSeal from "~/components/ReraSeal";
import ProjectEnquiryForm from "~/components/ProjectEnquiryForm";
import BrochureButton from "~/components/BrochureButton";
import NotFound from "~/components/NotFound";

export const route = {
  preload: ({ params }) => {
    void projectQuery(params.slug!);
  },
} satisfies RouteDefinition;

export default function ProjectPage() {
  const params = useParams();
  const project = createAsync(() => projectQuery(params.slug!), { deferStream: true });

  return (
    <Show when={project() !== undefined} fallback={<Loading />}>
      <Show when={project()} fallback={<NotFound kind="project" />}>
        {(p) => {
          const configLabels = () => p().configurations.map((c) => c.sub_type_display);
          const desc = () => p().meta_description || p().description?.slice(0, 160) || "";
          // Hero imagery: prefer backend media (cover first, then gallery order);
          // BannerSlideshow falls back to these local banners when the backend
          // has no images — or only unusable placeholders (see MIN_HERO_WIDTH).
          const LOCAL_BANNERS = [
            "/banner/banner-1.jpg",
            "/banner/banner-2.jpg",
            "/banner/banner-3.jpg",
          ];
          const backendImages = () =>
            p().media
              .filter((m) => m.media_type !== "video" && m.image)
              .sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.order - b.order)
              .map((m) => m.image!)
              .slice(0, 6);
          const configSummary = () =>
            [...new Set(p().configurations.map((c) => c.sub_type_display))].join(" · ");
          const primaryRera = () => p().rera_registrations[0];
          // Project facts strip (under the hero) — hard stats the backend now
          // exposes. Each tile shows only when its value is present, so sparse
          // projects render no empty tiles (and the whole strip hides at 0).
          const projectFacts = () =>
            [
              { label: "Land parcel", value: landArea(p().land_area_value, p().land_area_unit) },
              { label: "Towers", value: p().total_towers != null ? String(p().total_towers) : null },
              { label: "Floors", value: p().floors_label?.trim() || null },
              { label: "Units", value: p().total_units != null ? String(p().total_units) : null },
            ].filter((f): f is { label: string; value: string } => Boolean(f.value));
          // Key facts for the About grid — only the ones we actually have.
          const facts = () =>
            [
              { label: "Configurations", value: configSummary() },
              { label: "Unit sizes", value: areaRange(p().area_min, p().area_max) },
              { label: "Price range", value: priceRange(p().price_min, p().price_max) },
              { label: "Project type", value: typeLabel(p().project_type) },
              { label: "Status", value: statusLabel(p().status) },
              { label: "Possession", value: p().possession_label?.trim() || possession(p().possession_date) },
              { label: "Developer", value: p().developer.name },
              { label: "RERA", value: primaryRera() ? "Registered" : null },
            ].filter((f): f is { label: string; value: string } => Boolean(f.value));
          // Decorative image for the About media panel; a promo video if one exists.
          const promoVideo = () =>
            p().media.find((m) => m.media_type === "video" && m.video_url)?.video_url ?? null;
          // The About media column shows only when there's a promo video or a
          // real backend image — never a frontend placeholder banner.
          const aboutHasMedia = () => Boolean(promoVideo() || backendImages()[0]);

          // A short backend blurb leaves the About column looking bare. When it's
          // thin, compose a factual overview purely from known fields (no invented
          // claims) so the section reads full and informative.
          const STATUS_PHRASE: Record<string, string> = {
            prelaunch: "newly launched",
            under_construction: "under construction",
            ready_to_move: "ready to move in",
            completed: "completed",
          };
          const generatedAbout = () => {
            const pr = p();
            const loc = `${pr.location.locality}, ${pr.location.city}`;
            const type = typeLabel(pr.project_type).toLowerCase();
            const cfg = configSummary();
            const size = areaRange(pr.area_min, pr.area_max);
            const statusPhrase = STATUS_PHRASE[pr.status] ?? statusLabel(pr.status).toLowerCase();
            const paras: string[] = [];

            // 1 — positioning
            let s1 = `${pr.name} is a ${type} development by ${pr.developer.name}, located in ${loc}.`;
            if (cfg) {
              s1 += ` It offers ${cfg} configurations`;
              s1 += size ? ` with unit sizes ranging ${size}.` : `.`;
            } else if (size) {
              s1 += ` Unit sizes range ${size}.`;
            }
            paras.push(s1);

            // 2 — audience / pricing
            let s2 = `Thoughtfully planned for homebuyers and investors alike, the project brings a well-connected ${type} address to ${pr.location.city}.`;
            if (pr.price_min != null) s2 += ` Prices start from ${formatINR(pr.price_min)}.`;
            paras.push(s2);

            // 3 — trust / status
            let s3 = "";
            if (primaryRera()) {
              s3 = `Backed by a verified RERA registration (${primaryRera()!.rera_number}), it offers buyers added transparency and confidence.`;
            }
            if (pr.status === "ready_to_move") {
              s3 += `${s3 ? " " : ""}The project is ready to move in, with possession available now.`;
            } else {
              const poss = possession(pr.possession_date);
              s3 += poss
                ? `${s3 ? " " : ""}Currently ${statusPhrase}, the development is scheduled for possession in ${poss}.`
                : `${s3 ? " " : ""}The development is currently ${statusPhrase}.`;
            }
            if (s3) paras.push(s3);
            return paras;
          };
          const needsMoreAbout = () => (p().description?.trim().length ?? 0) < 320;
          return (
          <>
            {/* Head tags live on the resolved path only — a 404 must not emit a
                self-referential canonical or this project's title/meta. */}
            <Title>{p().meta_title || `${p().name} by ${p().developer.name} | EstatePortal`}</Title>
            <Meta name="description" content={desc()} />
            <Meta property="og:title" content={p().meta_title || p().name} />
            <Meta property="og:description" content={desc()} />
            <Meta property="og:type" content="website" />
            <Show when={p().og_image}>
              <Meta property="og:image" content={p().og_image!} />
            </Show>
            <Link rel="canonical" href={`/project/${p().slug}`} />

            {/* ---------------------------------------------------------------
                Hero banner — full-bleed cover with a navy scrim, breadcrumb,
                title and a translucent stat strip anchored to the bottom.
            ---------------------------------------------------------------- */}
            <section class="relative isolate overflow-hidden bg-navy-deep">
              {/* Cover imagery — crossfading slideshow (backend media, else local banners) */}
              <BannerSlideshow images={backendImages()} fallback={LOCAL_BANNERS} />
              {/* Navy scrim: legible text top-to-bottom, deepest at the base */}
              <div
                class="absolute inset-0"
                aria-hidden="true"
                style="background:linear-gradient(180deg,rgba(14,27,51,0.72) 0%,rgba(14,27,51,0.32) 34%,rgba(14,27,51,0.66) 74%,rgba(14,27,51,0.94) 100%);"
              />

              <div class="relative mx-auto flex min-h-[520px] max-w-7xl flex-col px-4 pb-10 pt-7 sm:px-6 sm:min-h-[560px]">
                {/* Breadcrumb */}
                <nav class="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-white/60" aria-label="Breadcrumb">
                  <A href="/" class="transition-colors hover:text-gold-soft">Home</A><span class="text-white/30">/</span>
                  <A href={`/${p().location.city_slug}`} class="transition-colors hover:text-gold-soft">{p().location.city}</A><span class="text-white/30">/</span>
                  <A href={`/${p().location.city_slug}/${p().location.locality_slug}`} class="transition-colors hover:text-gold-soft">{p().location.locality}</A><span class="text-white/30">/</span>
                  <A href={`/developer/${p().developer.slug}`} class="transition-colors hover:text-gold-soft">{p().developer.name}</A><span class="text-white/30">/</span>
                  <span class="text-gold-soft">{p().name}</span>
                </nav>

                {/* Title block, pushed to the bottom of the frame, with the
                    glass enquiry card alongside it on wide screens. */}
                <div class="mt-auto grid gap-8 pt-16 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-end">
                <div>
                  <div class="mb-4 flex flex-wrap items-center gap-2">
                    <span class="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">{statusLabel(p().status)}</span>
                    <span class="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">{typeLabel(p().project_type)}</span>
                    <Show
                      when={p().rera_registrations.length}
                      fallback={
                        <span class="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold text-white/85 backdrop-blur-sm">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
                          RERA Upcoming
                        </span>
                      }
                    >
                      <span class="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/15 px-3 py-1 text-xs font-semibold text-gold-soft backdrop-blur-sm">
                        <ReraSeal size="sm" /> RERA Verified
                      </span>
                    </Show>
                  </div>
                  <p class="eyebrow mb-2 text-gold-soft">By {p().developer.name}</p>
                  <h1 class="font-display text-4xl font-semibold leading-tight text-white drop-shadow-sm sm:text-5xl">{p().name}</h1>
                  <p class="mt-3 flex items-center gap-2 text-sm text-white/80 sm:text-base">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="shrink-0 text-gold-soft"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                    <span>{p().address || `${p().location.locality}, ${p().location.city}`}</span>
                  </p>
                  <Show when={primaryRera()}>
                    {(r) => (
                      <p class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/70">
                        <span class="eyebrow shrink-0 text-gold-soft">RERA No.</span>
                        <span class="min-w-0 break-words text-white/90">{r().rera_number}</span>
                      </p>
                    )}
                  </Show>

                  {/* Hard facts (land / towers / floors / units) as glass chips */}
                  <Show when={projectFacts().length}>
                    <dl class="mt-5 flex flex-wrap gap-2.5">
                      <For each={projectFacts()}>
                        {(f) => (
                          <div class="rounded-[10px] border border-white/20 bg-white/10 px-4 py-2.5 backdrop-blur-sm">
                            <dt class="eyebrow text-gold-soft">{f.label}</dt>
                            <dd class="mt-1 font-display text-base font-semibold leading-tight text-white">
                              {f.value}
                            </dd>
                          </div>
                        )}
                      </For>
                    </dl>
                  </Show>
                </div>

                {/* Glass enquiry card. Hidden below lg — the full-width form in
                    the contact band already serves narrow screens, and two
                    copies stacked would be noise. */}
                <aside class="hidden rounded-[14px] border border-white/20 bg-white/[0.07] p-5 shadow-[0_8px_32px_rgba(14,27,51,0.37)] backdrop-blur-xl lg:block">
                  <h2 class="font-display text-lg font-semibold leading-tight text-white">
                    Enquire about this project
                  </h2>
                  <p class="mt-1 text-xs text-white/70">
                    Verified pricing, brochure &amp; assisted site visit.
                  </p>
                  <ProjectEnquiryForm
                    idPrefix="banner"
                    compact
                    class="mt-4"
                    submitLabel="Request a callback"
                    projectSlug={p().slug}
                    citySlug={p().location.city_slug}
                    configurations={configLabels()}
                  />
                </aside>
                </div>
              </div>

              {/* Stat strip */}
              <div class="relative border-t border-white/15 bg-navy-deep/45 backdrop-blur-md">
                <div class="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:gap-8">
                  <dl class="grid flex-1 grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:flex lg:flex-wrap lg:items-center lg:gap-0">
                    <Stat label="Price" value={priceRange(p().price_min, p().price_max)} />
                    <Stat label="Sizes" value={areaRange(p().area_min, p().area_max) ?? "On request"} />
                    <Show when={configSummary()}>
                      <Stat label="Configurations" value={configSummary()} />
                    </Show>
                    <Stat label="Status" value={statusLabel(p().status)} />
                  </dl>
                  <div class="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
                    <BrochureButton variant="outline" />
                    <a
                      href="#enquire"
                      class="inline-flex shrink-0 items-center justify-center gap-2 rounded-[var(--radius-btn)] bg-gold px-6 py-3 text-sm font-semibold text-navy-deep shadow-lg transition-colors hover:bg-gold-soft"
                    >
                      Schedule site visit
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Mobile enquiry card — the banner card is lg-only, so below that
                breakpoint the same form lands here, directly under the hero. */}
            <section class="border-b border-white/10 bg-navy-deep px-4 py-8 sm:px-6 lg:hidden">
              <div class="mx-auto max-w-lg rounded-[14px] border border-white/20 bg-white/[0.07] p-5 shadow-[0_8px_32px_rgba(14,27,51,0.37)] backdrop-blur-xl">
                <h2 class="font-display text-lg font-semibold leading-tight text-white">
                  Enquire about this project
                </h2>
                <p class="mt-1 text-xs text-white/70">
                  Verified pricing, brochure &amp; assisted site visit.
                </p>
                <ProjectEnquiryForm
                  idPrefix="mobile"
                  class="mt-4"
                  submitLabel="Request a callback"
                  projectSlug={p().slug}
                  citySlug={p().location.city_slug}
                  configurations={configLabels()}
                />
              </div>
            </section>

            {/* ---------------------------------------------------------------
                About — description, key facts, and a media panel.
            ---------------------------------------------------------------- */}
            <Show when={p().description || facts().length}>
              <section class="border-b border-line bg-paper">
                <div class="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
                  {/* Centred header */}
                  <div class="mx-auto max-w-3xl text-center">
                    <p class="eyebrow">Overview</p>
                    <div class="gold-rule mx-auto my-3.5" />
                    <h2 class="font-display text-3xl font-semibold text-navy sm:text-4xl">
                      About {p().name}
                    </h2>
                  </div>

                  <div class={aboutHasMedia() ? "mt-12 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start" : "mt-12"}>
                    {/* Narrative */}
                    <div>
                      <div class="space-y-4 text-[15px] leading-[1.85] font-medium text-gray-600">
                        <Show when={p().description}>
                          <p class="whitespace-pre-line">{p().description}</p>
                        </Show>
                        <Show when={needsMoreAbout()}>
                          <For each={generatedAbout()}>{(para) => <p>{para}</p>}</For>
                        </Show>
                      </div>
                      <BrochureButton class="mt-8" />
                    </div>

                    {/* Media panel — inline video if one exists, else a real
                        backend image. No frontend placeholder banner. */}
                    <Show when={promoVideo()}>
                      {(url) => (
                        <VideoPanel url={url()} poster={backendImages()[0]} name={p().name} />
                      )}
                    </Show>
                    <Show when={!promoVideo() && backendImages()[0]}>
                      {(img) => (
                        <figure class="group relative overflow-hidden rounded-[18px] border border-line bg-navy shadow-sm lg:sticky lg:top-24">
                          <div class="img-scrim relative aspect-[4/3] w-full overflow-hidden">
                            <img
                              src={img()}
                              alt={`${p().name} — artist's impression`}
                              class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <figcaption class="absolute bottom-3 right-4 z-10 text-[11px] font-medium uppercase tracking-wider text-white/70">
                              {p().name}
                            </figcaption>
                          </div>
                        </figure>
                      )}
                    </Show>
                  </div>

                  {/* Key facts */}
                  <Show when={facts().length}>
                    <dl class="mt-12 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
                      <For each={facts()}>
                        {(f) => (
                          <div class="card-lift relative overflow-hidden rounded-[14px] border border-line bg-card p-5">
                            <span class="absolute inset-y-0 left-0 w-1 bg-navy/70" aria-hidden="true" />
                            <dt class="eyebrow break-words" style="color:var(--color-navy)">{f.label}</dt>
                            <dd class="mt-2 font-display text-xl font-semibold leading-tight text-navy">
                              {f.value}
                            </dd>
                          </div>
                        )}
                      </For>
                    </dl>
                  </Show>
                </div>
              </section>
            </Show>

            {/* ---------------------------------------------------------------
                Gallery — centred "{name} Images" heading over an even photo
                grid with a click-to-zoom lightbox. Hidden when no images.
            ---------------------------------------------------------------- */}
            <GalleryGrid media={p().media} name={p().name} />

            {/* Brochure CTA band — sits between the photos and the sizes table,
                where the visitor is weighing specifics. */}
            <section class="border-y border-white/10 bg-navy">
              <div class="mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 py-10 text-center sm:px-6 lg:flex-row lg:justify-between lg:text-left">
                <div>
                  <h2 class="font-display text-2xl font-semibold text-white">
                    Get the complete {p().name} brochure
                  </h2>
                  <p class="mt-1.5 text-sm text-white/70">
                    Floor plans, unit sizes, payment plan and pricing — sent to you by a verified advisor.
                  </p>
                </div>
                <BrochureButton class="shadow-lg" />
              </div>
            </section>

            {/* ---------------------------------------------------------------
                Sizes & Floor Plan — navy panel with a gold-ruled sizes table
                beside the floor-plan artwork. Hidden when no configurations.
            ---------------------------------------------------------------- */}
            <FloorPlan project={p()} />

            {/* ---------------------------------------------------------------
                Key features — larger, titled differentiators (distinct from the
                amenity chips above). Hidden when the backend supplies none.
            ---------------------------------------------------------------- */}
            <Show when={p().key_features.length}>
              <section class="border-b border-line bg-card">
                <div class="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
                  <div class="mx-auto max-w-3xl text-center">
                    <p class="eyebrow">What sets it apart</p>
                    <div class="gold-rule mx-auto my-3.5" />
                    <h2 class="font-display text-3xl font-semibold text-navy sm:text-4xl">
                      Key features
                    </h2>
                  </div>
                  <div class="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <For each={p().key_features}>
                      {(feature, i) => (
                        <article class="card-lift group relative overflow-hidden rounded-[16px] border border-line bg-card p-7">
                          {/* Gold top accent */}
                          <span class="absolute inset-x-0 top-0 h-1 bg-gold/70" aria-hidden="true" />
                          {/* Navy numbered badge with a gold numeral */}
                          <span class="mb-5 grid h-11 w-11 place-items-center rounded-full bg-navy font-display text-lg font-semibold text-gold transition-colors group-hover:bg-navy-deep">
                            {String(i() + 1).padStart(2, "0")}
                          </span>
                          <h3 class="font-display text-xl font-semibold leading-snug text-navy">
                            {feature.title}
                          </h3>
                          <Show when={feature.description?.trim()}>
                            <p class="mt-3 text-[15px] leading-[1.75] font-medium text-gray-600">
                              {feature.description}
                            </p>
                          </Show>
                        </article>
                      )}
                    </For>
                  </div>
                </div>
              </section>
            </Show>

            {/* ---------------------------------------------------------------
                Location advantages — labelled connectivity/landmark distances
                as a two-column pill list. Hidden when the backend has none.
            ---------------------------------------------------------------- */}
            <Show when={p().location_advantages.length}>
              <section class="border-b border-line bg-paper">
                <div class="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
                  <div class="mx-auto max-w-3xl text-center">
                    <p class="eyebrow">Connectivity</p>
                    <div class="gold-rule mx-auto my-3.5" />
                    <h2 class="font-display text-3xl font-semibold text-navy sm:text-4xl">
                      Location advantages
                    </h2>
                  </div>
                  <ul class="mx-auto mt-12 grid max-w-4xl gap-3.5 sm:grid-cols-2">
                    <For each={p().location_advantages}>
                      {(adv) => (
                        <li class="card-lift group flex items-center justify-between gap-4 rounded-[12px] border border-line bg-card px-4 py-3.5">
                          <span class="flex items-center gap-3.5 text-[15px] font-semibold text-navy">
                            {/* Navy pin badge with a gold marker */}
                            <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy text-gold transition-colors group-hover:bg-navy-deep">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                            </span>
                            {adv.label}
                          </span>
                          <Show when={adv.time_or_distance?.trim()}>
                            <span class="shrink-0 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
                              {adv.time_or_distance}
                            </span>
                          </Show>
                        </li>
                      )}
                    </For>
                  </ul>
                </div>
              </section>
            </Show>

            <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6">
              <div>
                {/* Main column */}
                <div class="min-w-0 space-y-10">
                  {/* RERA — the trust signature, prominent */}
                  <section>
                    <h2 class="mb-4 font-display text-2xl font-semibold text-navy">RERA registration</h2>
                    <ReraBadges registrations={p().rera_registrations} />
                  </section>
                </div>
              </div>
            </div>

            {/* ---------------------------------------------------------------
                FAQs — native <details> accordion: SSR-rendered, keyboard-
                operable and accessible with zero JS. Hidden when none exist.
            ---------------------------------------------------------------- */}
            {/* ---------------------------------------------------------------
                About the developer — full-bleed parallax band (fixed image,
                navy scrim) with a composed blurb.
            ---------------------------------------------------------------- */}
            <AboutDeveloper developer={p().developer} location={p().location} image="/banner/banner-3.jpg" />

            {/* ---------------------------------------------------------------
                FAQs — two-column cards on a navy field, each with a gold
                question accent. Hidden when none exist.
            ---------------------------------------------------------------- */}
            <Show when={p().faqs.length}>
              <section class="bg-navy">
                <div class="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
                  <h2 class="text-center font-display text-3xl font-bold text-white sm:text-4xl">
                    Frequently Asked Questions
                  </h2>
                  <div class="mt-10 grid gap-5 md:grid-cols-2">
                    <For each={p().faqs}>
                      {(faq) => (
                        <div class="border border-white/15 bg-white/[0.03] p-6">
                          <h3 class="flex items-start gap-3 font-display text-lg font-semibold leading-snug text-white">
                            <span class="mt-1 h-5 w-1 shrink-0 bg-gold" aria-hidden="true" />
                            <span>Q: {faq.question}</span>
                          </h3>
                          <p class="mt-3 whitespace-pre-line pl-4 text-sm leading-[1.75] text-white/70">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </For>
                  </div>
                </div>
              </section>
            </Show>

            {/* ---------------------------------------------------------------
                Contact — full-bleed parallax band with a location panel beside
                an on-image enquiry form.
            ---------------------------------------------------------------- */}
            <div id="enquire" class="scroll-mt-24">
              <ContactBand
                image="/banner/banner-1.jpg"
                address={p().address || `${p().location.locality}, ${p().location.city}`}
                projectSlug={p().slug}
                citySlug={p().location.city_slug}
                configurations={configLabels()}
              />
            </div>
          </>
          );
        }}
      </Show>
    </Show>
  );
}

/** One labelled figure in the hero stat strip — gold eyebrow over a white value. */
function Stat(props: { label: string; value: string; mono?: boolean }) {
  return (
    <div class="min-w-0 lg:border-l lg:border-white/15 lg:px-6 lg:first:border-l-0 lg:first:pl-0">
      <dt class="eyebrow mb-1 text-gold-soft">{props.label}</dt>
      <dd
        class={`truncate font-semibold text-white ${props.mono ? "rera-num text-sm" : "font-display text-lg"}`}
        title={props.value}
      >
        {props.value}
      </dd>
    </div>
  );
}

function Loading() {
  return (
    <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div class="h-8 w-2/3 animate-pulse rounded bg-navy/5" />
      <div class="mt-8 aspect-[16/9] w-full animate-pulse rounded-[12px] bg-navy/5" />
    </div>
  );
}

import {
  createAsync, useParams, A, type RouteDefinition,
} from "@solidjs/router";
import { Title, Meta, Link } from "@solidjs/meta";
import { Show, For } from "solid-js";
import { projectQuery } from "~/lib/queries";
import { priceRange, areaRange, statusLabel, typeLabel, possession, formatINR, landArea, htmlToText } from "~/lib/format";
import GalleryGrid from "~/components/GalleryGrid";
import FloorPlan from "~/components/FloorPlan";
import AboutDeveloper from "~/components/AboutDeveloper";
import AmenityList from "~/components/AmenityList";
import ContactBand from "~/components/ContactBand";
import BannerSlideshow from "~/components/BannerSlideshow";
import VideoPanel from "~/components/VideoPanel";
import ReraBadges from "~/components/ReraBadges";
import ReraSeal from "~/components/ReraSeal";
import ProjectEnquiryForm from "~/components/ProjectEnquiryForm";
import BrochureButton from "~/components/BrochureButton";
import CallCta from "~/components/CallCta";
import NotFound from "~/components/NotFound";
import ProjectHeader, { type ProjectSection } from "~/components/ProjectHeader";
import { canonical, absoluteUrl } from "~/lib/seo";
import { projectPhone } from "~/lib/contactPhone";

export const route = {
  preload: ({ params }) => {
    void projectQuery(params.slug!);
  },
} satisfies RouteDefinition;

export default function ProjectPage() {
  const params = useParams();
  const project = createAsync(() => projectQuery(params.slug!), { deferStream: true });

  return (
    <Show when={project() !== undefined} fallback={<><ProjectHeader /><Loading /></>}>
      <Show when={project()} fallback={<><ProjectHeader /><NotFound kind="project" /></>}>
        {(p) => {
          // description is sanitised HTML now, so the snippet takes its text —
          // a raw slice would put a literal "<p>" in the SERP and could cut mid-tag.
          const desc = () =>
            p().meta_description || htmlToText(p().description).slice(0, 160);
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
          // Mirrors GalleryGrid's own filter — the header must not offer a
          // "Gallery" anchor for a project whose grid renders nothing.
          const hasGallery = () =>
            p().media.some((m) => m.media_type !== "video" && m.image);
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
          // Measured on the words, not the markup, so tags cannot pad a thin
          // description past the threshold and suppress the generated copy.
          const needsMoreAbout = () => htmlToText(p().description).length < 320;
          // Every project enquiry lands on /thank-you, not only the ones with
          // an ad pointed at them. Which conversion that reports — if any — is
          // the admin's to decide: no label means the API returns null and the
          // page simply reports nothing. There is no list of campaign projects
          // in the frontend any more, and no deploy needed to start or stop a
          // campaign.
          //
          // The slug rides along so /thank-you can quote this project's desk.
          const thankYouUrl = () => `/thank-you?project=${p().slug}`;
          // The project header's nav. Every section below is conditional on the
          // backend having content for it, so each entry is gated on the same
          // test as the section itself — a link here always has somewhere to go.
          const navSections = (): ProjectSection[] =>
            [
              { id: "about", label: "About", show: Boolean(p().description || facts().length) },
              { id: "highlights", label: "Highlights", show: p().highlights_list.length > 0 },
              { id: "amenities", label: "Amenities", show: p().amenities.length > 0 },
              { id: "features", label: "Features", show: p().key_features.length > 0 },
              { id: "gallery", label: "Gallery", show: hasGallery() },
              { id: "location", label: "Location", show: p().location_advantages.length > 0 },
              { id: "developer", label: "About developer", show: true },
              { id: "faq", label: "FAQ", show: p().faqs.length > 0 },
            ]
              .filter((s) => s.show)
              .map(({ id, label }) => ({ id, label }));
          return (
          <>
            <ProjectHeader
              projectName={p().name}
              sections={navSections()}
              phone={p().contact_phone}
            />
            {/* Head tags live on the resolved path only — a 404 must not emit a
                self-referential canonical or this project's title/meta. */}
            <Title>{p().meta_title || `${p().name} by ${p().developer.name} | Aajneeti Real Estate`}</Title>
            <Meta name="description" content={desc()} />
            <Meta property="og:title" content={p().meta_title || p().name} />
            <Meta property="og:description" content={desc()} />
            <Meta property="og:type" content="website" />
            <Show when={p().og_image}>
              <Meta property="og:image" content={absoluteUrl(p().og_image!)} />
            </Show>
            <Link rel="canonical" href={canonical(`/project/${p().slug}`)} />

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
                <div class="mt-auto grid gap-8 pt-16 lg:mb-16 lg:grid-cols-[minmax(0,1fr)_500px] lg:items-end">
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
                    redirectTo={thankYouUrl()}
                  />
                </aside>
                </div>
              </div>

              {/* Stat strip */}
              <div class="relative border-t border-white/15 bg-navy-deep/45 backdrop-blur-md">
                <div class="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:gap-8">
                  <dl class="grid flex-1 grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:flex lg:flex-nowrap lg:items-center lg:gap-0">
                    <Stat label="Price" value={priceRange(p().price_min, p().price_max)} />
                    <Stat label="Sizes" value={areaRange(p().area_min, p().area_max) ?? "On request"} />
                    <Show when={configSummary()}>
                      <Stat label="Configurations" value={configSummary()} />
                    </Show>
                    <Stat label="Status" value={statusLabel(p().status)} />
                  </dl>
                  <div class="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
                    {/* Only when this project has a number set in the admin —
                        otherwise nothing renders here at all. */}
                    <CallCta phone={p().contact_phone} variant="glass" compactLabel />
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
                  redirectTo={thankYouUrl()}
                />
              </div>
            </section>

            {/* ---------------------------------------------------------------
                About — description, key facts, and a media panel.
            ---------------------------------------------------------------- */}
            <Show when={p().description || facts().length}>
              <section id="about" class="scroll-mt-[116px] lg:scroll-mt-[76px] border-b border-line bg-paper">
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
                          {/* Sanitised server-side by nh3 on every save (p, br,
                              strong, em, h2, h3, ul, ol, li, blockquote,
                              a[href|title] only), so the API cannot return
                              anything outside that set. Styled by .rich-text in
                              app.css — injected markup carries no classes.
                              No whitespace-pre-line: paragraphs are <p> now, and
                              pre-line would add a blank line after each one. */}
                          <div class="rich-text" innerHTML={p().description} />
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
                Highlights — the factual bullets the content team writes per
                project (acreage, saleable area, connectivity, configurations).
                Server-rendered like every other section: this is keyword-dense
                descriptive copy on an indexed page, and drawing it on the
                client would waste most of its value.

                A plain string array, already split per line and trimmed by the
                backend. Hidden when empty.
            ---------------------------------------------------------------- */}
            <Show when={p().highlights_list.length}>
              <section id="highlights" class="scroll-mt-[116px] lg:scroll-mt-[76px] border-b border-line bg-card">
                <div class="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
                  <div class="mx-auto max-w-3xl text-center">
                    <p class="eyebrow">At a glance</p>
                    <div class="gold-rule mx-auto my-3.5" />
                    <h2 class="font-display text-3xl font-semibold text-navy sm:text-4xl">
                      {p().name} highlights
                    </h2>
                  </div>

                  {/* Two columns from sm up — the list runs to a median of 12
                      and as many as 28, which is a long single column. */}
                  <ul class="mx-auto mt-12 grid max-w-5xl gap-x-10 gap-y-4 sm:grid-cols-2">
                    <For each={p().highlights_list}>
                      {(h) => (
                        <li class="flex items-start gap-3 text-[15px] leading-relaxed text-gray-600">
                          <span class="mt-[7px] grid h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                          <span>{h}</span>
                        </li>
                      )}
                    </For>
                  </ul>
                </div>
              </section>
            </Show>

            {/* ---------------------------------------------------------------
                Gallery — centred "{name} Images" heading over an even photo
                grid with a click-to-zoom lightbox. Hidden when no images.
            ---------------------------------------------------------------- */}
            <Show when={hasGallery()}>
              <div id="gallery" class="scroll-mt-[116px] lg:scroll-mt-[76px]">
                <GalleryGrid media={p().media} name={p().name} />
              </div>
            </Show>

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
                Amenities — the closed 14-item vocabulary, as an icon grid.
                Hidden when the project has none (three in the catalogue).
            ---------------------------------------------------------------- */}
            <Show when={p().amenities.length}>
              <section id="amenities" class="scroll-mt-[116px] lg:scroll-mt-[76px] border-b border-line bg-paper">
                <div class="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
                  <div class="mx-auto max-w-3xl text-center">
                    <p class="eyebrow">Lifestyle</p>
                    <div class="gold-rule mx-auto my-3.5" />
                    <h2 class="font-display text-3xl font-semibold text-navy sm:text-4xl">
                      Amenities at {p().name}
                    </h2>
                  </div>
                  <div class="mt-12">
                    <AmenityList amenities={p().amenities} />
                  </div>
                </div>
              </section>
            </Show>

            {/* ---------------------------------------------------------------
                Key features — larger, titled differentiators (distinct from the
                amenity grid above). Hidden when the backend supplies none.
            ---------------------------------------------------------------- */}
            <Show when={p().key_features.length}>
              <section id="features" class="scroll-mt-[116px] lg:scroll-mt-[76px] border-b border-line bg-card">
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
              <section id="location" class="scroll-mt-[116px] lg:scroll-mt-[76px] border-b border-line bg-paper">
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
                About the developer — full-bleed parallax band (fixed image,
                navy scrim) with a composed blurb.
            ---------------------------------------------------------------- */}
            <div id="developer" class="scroll-mt-[116px] lg:scroll-mt-[76px]">
              <AboutDeveloper developer={p().developer} location={p().location} image="/banner/banner-3.jpg" />
            </div>

            {/* ---------------------------------------------------------------
                FAQs — native <details> accordion on a navy field: SSR-rendered,
                keyboard-operable and open-able with zero JS. Every row starts
                closed. Hidden when none exist.
            ---------------------------------------------------------------- */}
            <Show when={p().faqs.length}>
              <section id="faq" class="scroll-mt-[116px] lg:scroll-mt-[76px] relative overflow-hidden bg-navy">
                {/* Gold wash behind the heading, so the band lifts off the navy */}
                <div
                  class="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(55%_100%_at_50%_0%,rgba(194,161,90,0.20),transparent_72%)]"
                  aria-hidden="true"
                />
                <div class="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
                  <div class="text-center">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">Good to know</p>
                    <h2 class="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
                      Frequently Asked Questions
                    </h2>
                    <span class="mx-auto mt-5 block h-px w-14 bg-gold" aria-hidden="true" />
                    <p class="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/60">
                      The questions buyers ask most about {p().name}. Tap any question to read the answer.
                    </p>
                  </div>

                  {/* Two per row from md up; items-start so an open row never
                      stretches the closed one beside it. */}
                  <div class="mt-10 grid items-start gap-4 md:grid-cols-2">
                    <For each={p().faqs}>
                      {(faq) => (
                        <details
                          class="faq-item group rounded-[12px] border border-white/[0.14] bg-white/[0.04] transition-colors duration-200 hover:border-white/30 open:border-gold/45 open:bg-white/[0.07]"
                        >
                          <summary class="flex cursor-pointer items-center gap-4 px-5 py-4 sm:px-6 sm:py-5">
                            <span class="min-w-0 flex-1 font-display text-[15px] font-semibold leading-snug text-white sm:text-base">
                              {faq.question}
                            </span>
                            {/* Plus that pivots into a filled gold cross once the row is open */}
                            <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-gold/40 bg-gold/10 text-gold transition-all duration-200 group-hover:bg-gold/20 group-open:rotate-45 group-open:border-gold group-open:bg-gold group-open:text-navy">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true">
                                <path d="M12 5v14M5 12h14" />
                              </svg>
                            </span>
                          </summary>
                          <div class="faq-answer px-5 pb-5 sm:px-6 sm:pb-6">
                            <span class="mb-4 block h-px w-full bg-white/10" aria-hidden="true" />
                            <p class="whitespace-pre-line text-sm leading-[1.8] text-white/70">
                              {faq.answer}
                            </p>
                          </div>
                        </details>
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
                phone={projectPhone(p().contact_phone, p().slug)}
                redirectTo={thankYouUrl()}
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

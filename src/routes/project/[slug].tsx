import {
  createAsync, useParams, A, type RouteDefinition,
} from "@solidjs/router";
import { Title, Meta, Link } from "@solidjs/meta";
import { Show, For } from "solid-js";
import { projectQuery } from "~/lib/queries";
import { priceRange, areaRange, statusLabel, typeLabel, possession } from "~/lib/format";
import Gallery from "~/components/Gallery";
import ConfigTable from "~/components/ConfigTable";
import ReraBadges from "~/components/ReraBadges";
import AmenityList from "~/components/AmenityList";
import DeveloperCard from "~/components/DeveloperCard";
import LeadForm from "~/components/LeadForm";
import ReraSeal from "~/components/ReraSeal";
import NotFound from "~/components/NotFound";

export const route = {
  preload: ({ params }) => {
    void projectQuery(params.slug!);
  },
} satisfies RouteDefinition;

export default function ProjectPage() {
  const params = useParams();
  const project = createAsync(() => projectQuery(params.slug!), { deferStream: true });

  // Meta ungated (deferStream resolves project() before the SSR head flush).
  const desc = () => project()?.meta_description || project()?.description?.slice(0, 160) || "";
  return (
    <>
      <Title>
        {project()?.meta_title ||
          (project() ? `${project()!.name} by ${project()!.developer.name} | EstatePortal` : "Project | EstatePortal")}
      </Title>
      <Meta name="description" content={desc()} />
      <Meta property="og:title" content={project()?.meta_title || project()?.name || "EstatePortal"} />
      <Meta property="og:description" content={desc()} />
      <Meta property="og:type" content="website" />
      <Show when={project()?.og_image}>
        <Meta property="og:image" content={project()!.og_image!} />
      </Show>
      <Link rel="canonical" href={`/project/${params.slug}`} />

      <Show when={project() !== undefined} fallback={<Loading />}>
      <Show when={project()} fallback={<NotFound kind="project" />}>
        {(p) => {
          const configLabels = () => p().configurations.map((c) => c.sub_type_display);
          return (
          <>
            {/* Breadcrumb + title band */}
            <div class="border-b border-line bg-card">
              <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6">
                <nav class="mb-3 flex flex-wrap items-center gap-1.5 text-xs text-slate" aria-label="Breadcrumb">
                  <A href="/" class="hover:text-navy">Home</A><span>/</span>
                  <A href={`/${p().location.city_slug}`} class="hover:text-navy">{p().location.city}</A><span>/</span>
                  <A href={`/${p().location.city_slug}/${p().location.locality_slug}`} class="hover:text-navy">{p().location.locality}</A>
                </nav>
                <div class="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div class="mb-2 flex flex-wrap items-center gap-2">
                      <span class="rounded-full bg-navy/5 px-3 py-1 text-xs font-semibold text-navy">{statusLabel(p().status)}</span>
                      <span class="rounded-full bg-navy/5 px-3 py-1 text-xs font-semibold text-navy">{typeLabel(p().project_type)}</span>
                      <Show when={p().rera_registrations.length}>
                        <span class="inline-flex items-center gap-1.5 rounded-full bg-green/10 px-3 py-1 text-xs font-semibold text-green">
                          <ReraSeal size="sm" /> Verified
                        </span>
                      </Show>
                    </div>
                    <h1 class="font-display text-3xl font-semibold text-navy sm:text-4xl">{p().name}</h1>
                    <p class="mt-1 flex items-center gap-1.5 text-slate">
                      <span>{p().address || `${p().location.locality}, ${p().location.city}`}</span>
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="text-xs uppercase tracking-wide text-slate">Price range</p>
                    <p class="font-display text-2xl font-semibold text-navy">{priceRange(p().price_min, p().price_max)}</p>
                    <Show when={areaRange(p().area_min, p().area_max)}>
                      {(a) => <p class="text-sm text-slate">{a()}</p>}
                    </Show>
                  </div>
                </div>
              </div>
            </div>

            <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6">
              <div class="grid gap-10 lg:grid-cols-[1fr_380px]">
                {/* Main column */}
                <div class="min-w-0 space-y-10">
                  <Gallery media={p().media} name={p().name} />

                  {/* Overview */}
                  <section>
                    <h2 class="font-display text-2xl font-semibold text-navy">Overview</h2>
                    <p class="mt-3 whitespace-pre-line leading-relaxed text-slate">{p().description}</p>
                    <Show when={p().highlights_list?.length}>
                      <ul class="mt-5 grid gap-2 sm:grid-cols-2">
                        <For each={p().highlights_list}>
                          {(h) => (
                            <li class="flex items-start gap-2 text-sm text-navy/85">
                              <span class="mt-0.5 text-gold">◆</span>{h}
                            </li>
                          )}
                        </For>
                      </ul>
                    </Show>
                    <Show when={possession(p().possession_date)}>
                      {(d) => (
                        <p class="mt-5 inline-flex items-center gap-2 rounded-lg bg-paper px-3 py-2 text-sm text-navy">
                          <span class="font-semibold">Possession:</span> {d()}
                        </p>
                      )}
                    </Show>
                  </section>

                  {/* RERA — the trust signature, prominent */}
                  <section>
                    <h2 class="mb-4 font-display text-2xl font-semibold text-navy">RERA registration</h2>
                    <ReraBadges registrations={p().rera_registrations} />
                  </section>

                  {/* Configurations */}
                  <Show when={p().configurations.length}>
                    <section>
                      <h2 class="mb-4 font-display text-2xl font-semibold text-navy">Configurations & pricing</h2>
                      <ConfigTable configurations={p().configurations} />
                    </section>
                  </Show>

                  {/* Amenities */}
                  <Show when={p().amenities.length}>
                    <section>
                      <h2 class="mb-4 font-display text-2xl font-semibold text-navy">Amenities</h2>
                      <AmenityList amenities={p().amenities} />
                    </section>
                  </Show>

                  {/* Documents */}
                  <Show when={p().documents.length}>
                    <section>
                      <h2 class="mb-4 font-display text-2xl font-semibold text-navy">Documents</h2>
                      <ul class="grid gap-3 sm:grid-cols-2">
                        <For each={p().documents}>
                          {(doc) => (
                            <li>
                              <a href={doc.file} target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 rounded-[10px] border border-line bg-card p-3 text-sm text-navy transition-colors hover:border-gold">
                                <span class="grid h-9 w-9 place-items-center rounded bg-navy/5 text-navy">
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>
                                </span>
                                <span class="font-medium">{doc.title}</span>
                              </a>
                            </li>
                          )}
                        </For>
                      </ul>
                    </section>
                  </Show>

                  {/* Developer */}
                  <section>
                    <h2 class="mb-4 font-display text-2xl font-semibold text-navy">About the developer</h2>
                    <DeveloperCard developer={p().developer} />
                  </section>
                </div>

                {/* Sticky sidebar: seal + lead form */}
                <aside class="lg:sticky lg:top-20 lg:h-fit">
                  <div class="mb-4 flex items-center gap-3 rounded-[12px] border border-green/25 bg-green/[0.05] p-4">
                    <ReraSeal size="md" />
                    <div>
                      <p class="font-semibold text-navy">RERA-verified project</p>
                      <Show when={p().rera_registrations[0]}>
                        {(r) => <p class="rera-num text-xs text-green">{r().rera_number}</p>}
                      </Show>
                    </div>
                  </div>
                  <div class="rounded-[16px] border border-line bg-card p-5 shadow-sm">
                    <LeadForm
                      projectSlug={p().slug}
                      citySlug={p().location.city_slug}
                      configurations={configLabels()}
                      heading="Enquire about this project"
                      subheading="Get verified pricing, the brochure and an assisted site visit."
                    />
                  </div>
                </aside>
              </div>
            </div>
          </>
          );
        }}
      </Show>
      </Show>
    </>
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

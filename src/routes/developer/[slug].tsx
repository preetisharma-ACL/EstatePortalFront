import {
  createAsync, useParams, A, type RouteDefinition,
} from "@solidjs/router";
import { Title, Meta, Link } from "@solidjs/meta";
import { Show, For } from "solid-js";
import { developerQuery, projectsQuery } from "~/lib/queries";
import ProjectCard from "~/components/ProjectCard";
import VerifiedTick from "~/components/VerifiedTick";
import NotFound from "~/components/NotFound";

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

  // Meta ungated (deferStream resolves developer() before the SSR head flush).
  return (
    <>
      <Title>
        {developer()?.meta_title ||
          (developer() ? `${developer()!.name} — projects & RERA details | EstatePortal` : "Developer | EstatePortal")}
      </Title>
      <Meta name="description" content={developer()?.meta_description || developer()?.description?.slice(0, 160) || ""} />
      <Meta property="og:title" content={developer()?.meta_title || developer()?.name || "EstatePortal"} />
      <Show when={developer()?.og_image}><Meta property="og:image" content={developer()!.og_image!} /></Show>
      <Link rel="canonical" href={`/developer/${params.slug}`} />

      <Show when={developer() !== undefined} fallback={<Loading />}>
      <Show when={developer()} fallback={<NotFound kind="developer" />}>
      {(d) => (
        <>
          <section class="hero-gradient relative overflow-hidden text-white">
            <div class="blueprint pointer-events-none absolute inset-0" aria-hidden="true" />
            <div class="relative mx-auto flex max-w-7xl flex-col gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center">
              <div class="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/15 bg-white/10">
                <Show when={d().logo} fallback={<span class="font-display text-3xl text-white">{d().name.charAt(0)}</span>}>
                  <img src={d().logo!} alt={`${d().name} logo`} class="h-full w-full object-contain p-2" />
                </Show>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h1 class="font-display text-3xl font-semibold sm:text-4xl">{d().name}</h1>
                  <Show when={d().is_verified}>
                    <span class="inline-flex items-center gap-1 rounded-full bg-green/20 px-2.5 py-1 text-xs font-semibold text-green">
                      <VerifiedTick size={14} /> Verified
                    </span>
                  </Show>
                </div>
                <p class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/70">
                  <Show when={d().established_year}>{(y) => <span>Established {y()}</span>}</Show>
                  <Show when={d().headquarters}><span>HQ: {d().headquarters}</span></Show>
                  <span>{d().project_count} projects</span>
                </p>
                <Show when={d().website}>
                  <a href={d().website} target="_blank" rel="noopener noreferrer nofollow" class="mt-2 inline-block text-sm font-semibold text-gold-soft hover:underline">
                    Visit website →
                  </a>
                </Show>
              </div>
            </div>
          </section>

          <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6">
            <Show when={d().description}>
              <section class="mb-10 max-w-3xl">
                <h2 class="eyebrow mb-3">About</h2>
                <p class="whitespace-pre-line leading-relaxed text-slate">{d().description}</p>
              </section>
            </Show>

            <h2 class="mb-6 font-display text-2xl font-semibold text-navy">Projects by {d().name}</h2>
            <Show when={projects()} fallback={<p class="text-slate">Loading projects…</p>}>
              <Show
                when={projects()!.results.length}
                fallback={<p class="rounded-[12px] border border-dashed border-line bg-card p-8 text-center text-slate">No live projects listed yet.</p>}
              >
                <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <For each={projects()!.results}>{(p) => <ProjectCard project={p} />}</For>
                </div>
                <Show when={projects()!.count > projects()!.results.length}>
                  <A href={`/search?developer=${d().slug}`} class="mt-8 inline-block text-sm font-semibold text-gold hover:underline">
                    View all {projects()!.count} projects →
                  </A>
                </Show>
              </Show>
            </Show>
          </div>
        </>
      )}
      </Show>
      </Show>
    </>
  );
}

function Loading() {
  return <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6"><div class="h-10 w-1/2 animate-pulse rounded bg-navy/5" /></div>;
}

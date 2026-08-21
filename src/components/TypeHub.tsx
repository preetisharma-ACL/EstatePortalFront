import { createAsync, A } from "@solidjs/router";
import { Title, Meta, Link } from "@solidjs/meta";
import { For, Show } from "solid-js";
import { MIN_INDEXABLE, type TypePage } from "~/lib/projectTypes";
import { cityTypeCountsQuery } from "~/lib/queries";
import { canonical } from "~/lib/seo";

/**
 * /residential and /commercial — hubs linking down to the /<city>/<type> pages.
 *
 * Only cities at or above MIN_INDEXABLE are listed: below that the city page is
 * noindex, so linking it from here would just funnel crawl budget at pages we've
 * asked not to be indexed. The list is derived from live counts, so a city
 * appears here the moment it crosses the bar.
 */
export default function TypeHub(props: { type: TypePage }) {
  const counts = createAsync(() => cityTypeCountsQuery(props.type.slug), {
    deferStream: true,
  });
  const cities = () => counts()?.filter((c) => c.count >= MIN_INDEXABLE) ?? [];
  const total = () => counts()?.reduce((n, c) => n + c.count, 0) ?? 0;

  return (
    <>
      <Title>{`${props.type.hubTitle} — RERA-verified projects | EstatePortal`}</Title>
      <Meta name="description" content={props.type.hubIntro} />
      <Link rel="canonical" href={canonical(`/${props.type.slug}`)} />

      <section class="hero-gradient relative overflow-hidden text-white">
        <div class="blueprint pointer-events-none absolute inset-0" aria-hidden="true" />
        <div class="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
          <nav class="mb-3 flex items-center gap-1.5 text-xs text-white/60" aria-label="Breadcrumb">
            <A href="/" class="transition-colors hover:text-gold-soft">Home</A>
            <span class="text-white/30">/</span>
            <span class="text-gold-soft">{props.type.label}</span>
          </nav>
          <p class="eyebrow text-gold-soft">{props.type.label}</p>
          <h1 class="mt-2 max-w-3xl font-display text-[32px] font-semibold leading-[1.05] sm:text-[44px]">
            {props.type.hubTitle}
          </h1>
          <div class="gold-rule mt-4" />
          <p class="mt-5 max-w-2xl text-white/75">{props.type.hubIntro}</p>
          <Show when={counts()}>
            <p class="mt-5 text-sm text-white/60">
              <span class="font-semibold text-white">{total()}</span>{" "}
              {props.type.label.toLowerCase()} projects across{" "}
              <span class="font-semibold text-white">{cities().length}</span> cities.
            </p>
          </Show>
        </div>
      </section>

      <section class="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
        <div class="mx-auto max-w-2xl text-center">
          <p class="eyebrow">By city</p>
          <h2 class="mt-2 font-display text-3xl font-semibold text-navy sm:text-4xl">
            Browse {props.type.label.toLowerCase()} by city
          </h2>
          <div class="gold-rule mx-auto mt-4" />
        </div>

        <Show
          when={cities().length}
          fallback={
            <div class="mx-auto mt-10 max-w-xl rounded-[12px] border border-dashed border-line bg-card p-10 text-center">
              <p class="font-display text-xl text-navy">Nothing listed yet</p>
              <p class="mt-2 text-sm text-slate">
                No city currently has enough {props.type.label.toLowerCase()} inventory to
                warrant its own page. Browse everything instead.
              </p>
              <A
                href={`/search?project_type=${props.type.slug}`}
                class="mt-5 inline-block rounded-[8px] bg-gold px-5 py-2.5 text-sm font-semibold text-navy transition-transform hover:-translate-y-0.5"
              >
                Browse all {props.type.label.toLowerCase()}
              </A>
            </div>
          }
        >
          <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <For each={cities()}>
              {(c) => (
                <A
                  href={`/${c.slug}/${props.type.slug}`}
                  class="card-lift group flex items-center justify-between gap-4 rounded-[12px] border border-line bg-card px-5 py-5"
                >
                  <span>
                    <span class="block font-display text-lg font-semibold text-navy">
                      {c.name}
                    </span>
                    <span class="mt-0.5 block text-sm text-slate">
                      {c.count} {c.count === 1 ? "project" : "projects"}
                    </span>
                  </span>
                  <span class="shrink-0 text-gold transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </A>
              )}
            </For>
          </div>
        </Show>

        <p class="mt-10 text-center text-sm text-slate">
          Looking for something specific?{" "}
          <A href={`/search?project_type=${props.type.slug}`} class="font-semibold text-navy underline decoration-gold underline-offset-4">
            Filter all {props.type.label.toLowerCase()} projects
          </A>
        </p>
      </section>
    </>
  );
}

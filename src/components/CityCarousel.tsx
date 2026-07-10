import { A } from "@solidjs/router";
import { For, Show } from "solid-js";
import type { CityList } from "~/lib/types";

/**
 * Explore-by-city carousel — a horizontally scrolling row of image cards with a
 * header ("View all" + prev/next arrows) and a corner badge, in the style of a
 * luxury listings rail. Matches the project theme (navy + gold).
 */
export default function CityCarousel(props: { cities: CityList[]; viewAllHref?: string }) {
  let scroller: HTMLDivElement | undefined;

  const scroll = (dir: 1 | -1) =>
    scroller?.scrollBy({ left: dir * 320, behavior: "smooth" });

  return (
    <section class="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      {/* Header row */}
      <div class="mb-6 flex items-center justify-between gap-4">
        <h2 class="font-display text-3xl font-semibold text-navy sm:text-4xl">Explore by city</h2>
        <div class="flex shrink-0 items-center gap-4">
          <A href={props.viewAllHref ?? "/search"} class="text-sm font-semibold text-navy hover:text-gold">
            View all
          </A>
          <button
            type="button"
            aria-label="Previous"
            onClick={() => scroll(-1)}
            class="grid h-10 w-10 place-items-center rounded-full border border-line text-navy transition-colors hover:border-navy hover:bg-navy hover:text-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => scroll(1)}
            class="grid h-10 w-10 place-items-center rounded-full border border-line text-navy transition-colors hover:border-navy hover:bg-navy hover:text-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </div>
      </div>

      {/* Scroll rail */}
      <div
        ref={scroller}
        class="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <For each={props.cities}>
          {(c) => (
            <A
              href={`/${c.slug}`}
              class="group w-[270px] shrink-0 snap-start sm:w-[300px]"
            >
              {/* Image */}
              <div class="relative aspect-[4/3] overflow-hidden rounded-[10px] bg-navy/5">
                <Show
                  when={c.image}
                  fallback={<div class="hero-gradient grid h-full place-items-center font-display text-xl text-white/50">{c.name}</div>}
                >
                  {(img) => (
                    <img
                      src={img()}
                      alt={c.name}
                      loading="lazy"
                      class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </Show>

                {/* Corner badge */}
                <span class="absolute left-3 top-3 rounded-md bg-white/95 px-2.5 py-1 text-xs font-semibold text-navy shadow-sm">
                  Tier {c.tier}
                </span>
              </div>

              {/* Caption */}
              <div class="mt-3">
                <p class="font-display text-lg font-semibold text-navy">{c.name}</p>
                <p class="mt-0.5 text-sm font-medium text-gold transition-colors group-hover:text-gold-soft">
                  {c.state}, India
                </p>
              </div>
            </A>
          )}
        </For>
      </div>
    </section>
  );
}

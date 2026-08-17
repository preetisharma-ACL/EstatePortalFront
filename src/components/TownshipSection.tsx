import { A } from "@solidjs/router";
import { For, Show } from "solid-js";
import { townshipList } from "~/lib/townships";

/** Cycled per card so the rail doesn't read as three identical navy tiles while
 *  the real township photography is still pending (see Township.heroImages). */
const FALLBACK_IMAGES = [
  "/banner/banner-2.jpg",
  "/banner/banner-1.jpg",
  "/banner/banner-3.jpg",
];

/**
 * Home-page townships section — one card per entry in the township registry, so
 * adding a township to src/lib/townships.ts surfaces it here automatically.
 *
 * A grid rather than a scroll rail: there are only a handful of townships, and a
 * half-empty rail reads as broken where a grid reads as complete.
 */
export default function TownshipSection() {
  const townships = townshipList();

  return (
    // Plain paper, no border: the premium band directly below is the warm
    // #f8f5f2 tint, and repeating it here would fuse the two into one block.
    <section id="townships" class="scroll-mt-20 bg-paper py-14 sm:py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6">
        <div class="mx-auto max-w-2xl text-center">
          <p class="eyebrow">Township living</p>
          <h2 class="mt-2 font-display text-3xl font-semibold text-navy sm:text-4xl">
            Explore by <span class="italic text-gold">township</span>
          </h2>
          <div class="gold-rule mx-auto mt-4" />
          <p class="mt-4 text-slate">
            Integrated townships where schools, retail, healthcare and open space sit
            inside the gate — every project inside them, in one place.
          </p>
        </div>

        <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <For each={townships}>
            {(t, i) => (
              <A
                href={`/township/${t.slug}`}
                class="card-lift group overflow-hidden rounded-[14px] border border-line bg-card"
              >
                <div class="img-scrim relative aspect-[16/10] overflow-hidden bg-navy/5">
                  <img
                    src={t.heroImages[0] ?? FALLBACK_IMAGES[i() % FALLBACK_IMAGES.length]}
                    alt={t.name}
                    loading="lazy"
                    class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span class="absolute left-3 top-3 z-10 rounded-md bg-white/95 px-2.5 py-1 text-xs font-semibold text-navy shadow-sm">
                    Integrated township
                  </span>
                  <Show when={t.stats[0]}>
                    {(s) => (
                      <span class="absolute bottom-3 left-3 z-10 rounded-md border border-white/25 bg-navy-deep/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                        {s().value}
                      </span>
                    )}
                  </Show>
                </div>

                <div class="p-5">
                  <h3 class="font-display text-xl font-semibold text-navy">{t.name}</h3>
                  <p class="mt-0.5 text-sm font-medium text-gold transition-colors group-hover:text-gold-soft">
                    {t.tagline}, {t.cityName}
                  </p>
                  <Show when={t.developer}>
                    <p class="mt-2 text-sm text-slate">By {t.developer}</p>
                  </Show>
                  <p class="mt-4 text-sm font-semibold text-navy">
                    View projects{" "}
                    <span class="text-gold transition-transform group-hover:translate-x-0.5">→</span>
                  </p>
                </div>
              </A>
            )}
          </For>
        </div>
      </div>
    </section>
  );
}

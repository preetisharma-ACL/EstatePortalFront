import { For, Show, createSignal, createMemo, onCleanup, onMount } from "solid-js";
import type { MediaType, ProjectMedia } from "~/lib/types";

const TYPE_LABEL: Partial<Record<MediaType, string>> = {
  master_plan: "master plan",
  floor_plan: "floor plan",
  location_map: "location map",
};

/**
 * Grid gallery — a centred "{name} Images" heading over an even photo grid,
 * with a click-to-zoom lightbox. Mirrors the reference layout: four tight
 * columns on desktop, collapsing to two/one on smaller screens.
 */
export default function GalleryGrid(props: { media: ProjectMedia[]; name: string }) {
  // Show a tidy 4×2 grid. Cover first, capped at eight; when the backend has
  // fewer than eight we cycle the available photos so both rows stay full.
  const images = createMemo(() => {
    const real = props.media
      .filter((m) => m.media_type !== "video" && m.image)
      .sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.order - b.order);
    if (!real.length) return real;
    if (real.length >= 8) return real.slice(0, 8);
    return Array.from({ length: 8 }, (_, i) => real[i % real.length]);
  });

  /** What this image *is* — caption, else its media type, else its position. */
  const label = (m: ProjectMedia, i: number) =>
    m.caption || TYPE_LABEL[m.media_type] || `gallery photo ${i + 1}`;

  // Lightbox: null = closed, otherwise the active image index.
  const [open, setOpen] = createSignal<number | null>(null);
  const current = () => {
    const i = open();
    return i === null ? undefined : images()[i];
  };
  const step = (dir: 1 | -1) => {
    const i = open();
    if (i === null) return;
    const n = images().length;
    setOpen((i + dir + n) % n);
  };

  onMount(() => {
    const onKey = (e: KeyboardEvent) => {
      if (open() === null) return;
      if (e.key === "Escape") setOpen(null);
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    onCleanup(() => window.removeEventListener("keydown", onKey));
  });

  return (
    <Show when={images().length}>
      <section class="bg-paper pt-6 pb-0 sm:pt-8">
        {/* Centred heading */}
        <h2 class="mb-8 text-center font-display text-3xl font-bold text-navy sm:mb-10 sm:text-4xl">
          {props.name} Images
        </h2>

        {/* Edge-to-edge photo grid — 4×2, images touching */}
        <ul class="grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
          <For each={images()}>
            {(m, i) => (
              <li>
                <button
                  type="button"
                  onClick={() => setOpen(i())}
                  aria-label={`View ${label(m, i())}`}
                  class="img-scrim group relative block aspect-[3/2] w-full overflow-hidden bg-navy/5"
                >
                  <img
                    src={m.image!}
                    alt={`${props.name} — ${label(m, i())}`}
                    loading="lazy"
                    class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <Show when={m.caption}>
                    <span class="absolute bottom-2 left-3 z-10 text-xs font-medium text-white/90">
                      {m.caption}
                    </span>
                  </Show>
                </button>
              </li>
            )}
          </For>
        </ul>
      </section>

      {/* Lightbox */}
      <Show when={current()}>
        {(img) => (
          <div
            class="fixed inset-0 z-50 flex items-center justify-center bg-navy-deep/90 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label={`${props.name} gallery viewer`}
            onClick={() => setOpen(null)}
          >
            <button
              type="button"
              class="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Close"
              onClick={() => setOpen(null)}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
            <Show when={images().length > 1}>
              <button
                type="button"
                class="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
                aria-label="Previous image"
                onClick={(e) => { e.stopPropagation(); step(-1); }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              </button>
              <button
                type="button"
                class="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
                aria-label="Next image"
                onClick={(e) => { e.stopPropagation(); step(1); }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg>
              </button>
            </Show>
            <figure class="max-h-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
              <img
                src={img().image!}
                alt={`${props.name} — ${label(img(), open()!)}`}
                class="mx-auto max-h-[82vh] w-auto rounded-[8px] object-contain shadow-2xl"
              />
              <Show when={img().caption}>
                <figcaption class="mt-3 text-center text-sm text-white/80">{img().caption}</figcaption>
              </Show>
            </figure>
          </div>
        )}
      </Show>
    </Show>
  );
}

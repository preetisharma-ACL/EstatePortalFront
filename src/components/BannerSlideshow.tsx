import { For, createMemo, createSignal, onCleanup, onMount } from "solid-js";

/** A hero backdrop image must be at least this wide to be worth showing.
 *  Seed/placeholder images (e.g. a 480×320 solid-colour fill) fall below this
 *  and are rejected in favour of the local banners. */
const MIN_HERO_WIDTH = 1000;

/**
 * Cinematic hero backdrop: crossfades (dissolve) between images with a slow
 * Ken Burns zoom so a set of stills reads like smooth video footage.
 *
 * Prefers `images` (backend media) but transparently switches to `fallback`
 * (local banners) when every backend image fails to load or is too small to
 * serve as a hero — so real uploads win, placeholders don't.
 *
 * The usable/unusable decision is made in onMount by probing each image with
 * `new Image()`, NOT via onLoad on the rendered tags: those are server-rendered
 * and often finish loading before hydration attaches a handler, so their load
 * event never fires on the client.
 * Honours prefers-reduced-motion.
 */
export default function BannerSlideshow(props: {
  images: string[];
  fallback: string[];
  /** ms each slide stays before dissolving to the next (default 5500). */
  interval?: number;
}) {
  const [useFallback, setUseFallback] = createSignal(false);
  const sources = createMemo(() =>
    useFallback() || props.images.length === 0 ? props.fallback : props.images,
  );
  const [active, setActive] = createSignal(0);

  onMount(() => {
    // Probe the backend images: if all are missing or too small for a hero,
    // drop to the local banners.
    if (props.images.length && props.fallback.length) {
      let rejected = 0;
      const reject = () => {
        rejected += 1;
        if (rejected >= props.images.length) {
          setActive(0);
          setUseFallback(true);
        }
      };
      for (const src of props.images) {
        const probe = new Image();
        probe.onload = () => {
          if (probe.naturalWidth < MIN_HERO_WIDTH) reject();
        };
        probe.onerror = reject;
        probe.src = src;
      }
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      const n = sources().length;
      if (n > 1) setActive((i) => (i + 1) % n);
    }, props.interval ?? 5500);
    onCleanup(() => clearInterval(id));
  });

  return (
    <div class="absolute inset-0 overflow-hidden" aria-hidden="true">
      <For each={sources()}>
        {(src, i) => (
          <img
            src={src}
            alt=""
            loading={i() === 0 ? "eager" : "lazy"}
            class="hero-slide absolute inset-0 h-full w-full object-cover"
            classList={{ "is-active": i() === active() }}
          />
        )}
      </For>
    </div>
  );
}

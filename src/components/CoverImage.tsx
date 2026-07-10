import { createSignal, onMount } from "solid-js";

/** Minimum width for a backend image to count as real (vs a seed placeholder). */
const MIN_USABLE_WIDTH = 1000;

/**
 * An <img> that quietly swaps to `fallback` when its source fails to load or is
 * too small to be a real photo (e.g. a solid-colour seed placeholder). Mirrors
 * BannerSlideshow's rule so decorative imagery stays consistent.
 *
 * The check runs in onMount via a `new Image()` probe rather than the rendered
 * tag's onLoad — a server-rendered image often finishes loading before
 * hydration attaches a handler, so its load event never fires on the client.
 */
export default function CoverImage(props: {
  src: string;
  fallback: string;
  alt: string;
  class?: string;
}) {
  const [src, setSrc] = createSignal(props.src);

  onMount(() => {
    if (props.src === props.fallback) return;
    const probe = new Image();
    probe.onload = () => {
      if (probe.naturalWidth < MIN_USABLE_WIDTH) setSrc(props.fallback);
    };
    probe.onerror = () => setSrc(props.fallback);
    probe.src = props.src;
  });

  return <img src={src()} alt={props.alt} class={props.class} />;
}

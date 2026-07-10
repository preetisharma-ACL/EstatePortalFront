import { A } from "@solidjs/router";
import type { DeveloperStub, LocationStub } from "~/lib/types";

/**
 * About-the-developer band — a full-bleed parallax section (fixed background
 * image, navy scrim) with a centred blurb. The image stays put while the copy
 * scrolls over it. Content is composed from known fields only (no invented
 * claims beyond generic positioning language).
 */
export default function AboutDeveloper(props: {
  developer: DeveloperStub;
  location: LocationStub;
  image: string;
}) {
  const blurb = () => {
    const name = props.developer.name;
    const city = props.location.city;
    return (
      `${name} is one of India's most trusted real estate developers, known for ` +
      `creating premium residential, commercial and mixed-use developments that ` +
      `combine quality construction, thoughtful design and long-term value. With a ` +
      `strong presence across key markets including ${city}, the company has ` +
      `delivered landmark projects that cater to the evolving needs of modern ` +
      `homebuyers and investors. Every ${name} development reflects a commitment to ` +
      `architectural excellence, superior craftsmanship and world-class living experiences.`
    );
  };

  return (
    <section class="relative isolate overflow-hidden">
      {/* Fixed parallax background */}
      <div
        class="absolute inset-0 bg-fixed bg-cover bg-center"
        style={`background-image:url('${props.image}')`}
        aria-hidden="true"
      />
      <div class="absolute inset-0 bg-navy-deep/85" aria-hidden="true" />

      <div class="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28">
        <p class="eyebrow">The developer</p>
        <div class="gold-rule mx-auto my-3.5" />
        <h2 class="font-display text-3xl font-semibold text-white sm:text-4xl">
          About {props.developer.name}
        </h2>
        <p class="mx-auto mt-6 max-w-3xl text-[15px] leading-[1.9] text-white/80">
          {blurb()}
        </p>
        <A
          href={`/developer/${props.developer.slug}`}
          class="mt-8 inline-flex items-center gap-2 rounded-[var(--radius-btn)] border border-gold/50 bg-gold/10 px-6 py-3 text-sm font-semibold text-gold-soft transition-colors hover:bg-gold hover:text-navy-deep"
        >
          View developer profile
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
        </A>
      </div>
    </section>
  );
}

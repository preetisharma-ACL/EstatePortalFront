import { Show, type JSX } from "solid-js";

/**
 * A full-width content section on the project page, with the site's standard
 * centred header: eyebrow, gold rule, title.
 *
 * The template's mockup pairs several of these into a two-column layout — main
 * content left, a narrow panel right. The client asked for that UNSTACKED: the
 * left section becomes one full-width section and the right becomes the next,
 * in reading order. So everything here is full width by design, and the pairs
 * survive only as adjacency.
 *
 * Renders nothing when `when` is falsy. Most of these sections are blank on
 * most projects while the SEO team writes content, so hiding has to take the
 * heading and the container with it — a page with three sections filled should
 * read as deliberate, not broken.
 */
export default function Section(props: {
  /** Anchor for the project header's section nav. */
  id?: string;
  eyebrow?: string;
  title: string;
  /** Optional standfirst under the title, inside the centred header block. */
  intro?: JSX.Element;
  /** Alternate the background against the section above. */
  tone?: "paper" | "card";
  /** The section renders only when this is truthy. */
  when: unknown;
  children: JSX.Element;
}) {
  return (
    <Show when={props.when}>
      <section
        id={props.id}
        // scroll-mt clears the sticky project header when the nav jumps here.
        class={`scroll-mt-[116px] border-b border-line lg:scroll-mt-[76px] ${
          props.tone === "card" ? "bg-card" : "bg-paper"
        }`}
      >
        <div class="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <div class="mx-auto max-w-3xl text-center">
            <Show when={props.eyebrow}>
              <p class="eyebrow">{props.eyebrow}</p>
            </Show>
            <div class="gold-rule mx-auto my-3.5" />
            <h2 class="font-display text-3xl font-semibold text-navy sm:text-4xl">
              {props.title}
            </h2>
            <Show when={props.intro}>
              <div class="mt-3 text-[15px] leading-relaxed text-slate">{props.intro}</div>
            </Show>
          </div>
          <div class="mt-12">{props.children}</div>
        </div>
      </section>
    </Show>
  );
}

/**
 * Provenance tag for a figure we did not measure ourselves.
 *
 * Deliberately plain rather than alarming: a marketing estimate is still useful
 * information, it just must not read as a measurement. Dropping it to tidy a
 * table would erase the difference between a claim and a fact.
 */
export function SourceTag(props: { source: string; label: string }) {
  return (
    <Show when={props.source && props.source !== "verified" && props.label}>
      <span class="whitespace-nowrap text-[11px] font-medium text-slate">
        ({props.label.toLowerCase()})
      </span>
    </Show>
  );
}

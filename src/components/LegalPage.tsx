import { For, Show, type JSX } from "solid-js";
import { COMPANY } from "~/lib/company";

export interface LegalSection {
  /** Anchor id — also the deep-link target from the table of contents. */
  id: string;
  title: string;
  /**
   * A thunk, not a JSX value. The section arrays are module-level constants, so
   * eager JSX would construct `<A>` outside the Router context and throw on SSR
   * ("<A> and 'use' router primitives can be only used inside a Route").
   */
  content: () => JSX.Element;
}

/**
 * Shared shell for the long-form legal routes (/privacy-policy, /terms).
 * Navy hero + numbered table of contents + one card per section. Prose styling
 * lives in the `.legal` scope in app.css so section bodies stay plain HTML.
 */
export default function LegalPage(props: {
  eyebrow: string;
  heading: string;
  /** Rendered italic gold, following the site's display-heading treatment. */
  headingAccent?: string;
  intro: string;
  sections: LegalSection[];
}) {
  const num = (i: number) => String(i + 1).padStart(2, "0");

  return (
    <>
      <section class="hero-gradient relative overflow-hidden text-white">
        <div class="blueprint pointer-events-none absolute inset-0" aria-hidden="true" />
        <div class="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
          <p class="eyebrow text-gold-soft">{props.eyebrow}</p>
          <h1 class="mt-3 max-w-3xl font-display text-[34px] font-semibold leading-[1.1] sm:text-5xl">
            {props.heading}
            <Show when={props.headingAccent}>
              {" "}
              <span class="italic text-gold-soft">{props.headingAccent}</span>
            </Show>
          </h1>
          <div class="gold-rule mt-5" />
          <p class="mt-5 max-w-3xl text-base leading-relaxed text-white/75">{props.intro}</p>
          <p class="mt-6 text-sm text-white/55">
            Effective from {COMPANY.effectiveDate} · Last updated {COMPANY.effectiveDate}
          </p>
        </div>
      </section>

      <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:grid lg:grid-cols-[17rem_1fr] lg:gap-12">
        {/* Desktop table of contents */}
        <nav class="hidden self-start lg:sticky lg:top-24 lg:block" aria-label="On this page">
          <p class="eyebrow">On this page</p>
          <ol class="mt-4 space-y-2 border-l border-line pl-4">
            <For each={props.sections}>
              {(s, i) => (
                <li>
                  <a
                    href={`#${s.id}`}
                    class="group flex gap-2.5 text-sm leading-snug text-slate transition-colors hover:text-navy"
                  >
                    <span class="font-mono text-xs text-gold">{num(i())}</span>
                    <span class="group-hover:underline">{s.title}</span>
                  </a>
                </li>
              )}
            </For>
          </ol>
        </nav>

        {/* Mobile table of contents */}
        <details class="mb-8 rounded-[12px] border border-line bg-card p-4 lg:hidden">
          <summary class="cursor-pointer list-none font-semibold text-navy">
            Jump to a section
            <span class="float-right text-gold" aria-hidden="true">
              ▾
            </span>
          </summary>
          <ol class="mt-3 space-y-2 border-t border-line pt-3">
            <For each={props.sections}>
              {(s, i) => (
                <li>
                  <a href={`#${s.id}`} class="flex gap-2.5 text-sm text-slate">
                    <span class="font-mono text-xs text-gold">{num(i())}</span>
                    {s.title}
                  </a>
                </li>
              )}
            </For>
          </ol>
        </details>

        <div class="legal min-w-0 space-y-6">
          <For each={props.sections}>
            {(s, i) => (
              <section
                id={s.id}
                class="scroll-mt-24 rounded-[14px] border border-line bg-card p-6 sm:p-8"
              >
                <h2 class="flex items-baseline gap-3 font-display text-2xl font-semibold text-navy">
                  <span class="font-mono text-sm font-medium text-gold">{num(i())}</span>
                  {s.title}
                </h2>
                <div class="mt-4">{s.content()}</div>
              </section>
            )}
          </For>

          <p class="rounded-[14px] border border-dashed border-line bg-card/60 px-6 py-5 text-sm leading-relaxed text-slate">
            This page is provided for general information and does not constitute legal,
            financial or investment advice. Property particulars shown anywhere on{" "}
            {COMPANY.brand} are indicative — always verify the RERA registration on the
            official state authority portal and have the transaction documents reviewed
            independently before you commit.
          </p>
        </div>
      </div>
    </>
  );
}

/** Contact block reused at the foot of both legal pages. */
export function LegalContact(props: { role: string; name?: string; email: string }) {
  return (
    <address class="mt-4 rounded-[12px] border border-line bg-paper p-5 not-italic">
      <p class="eyebrow">{props.role}</p>
      <Show when={props.name}>
        <p class="mt-2 font-semibold text-navy">{props.name}</p>
      </Show>
      <p class="mt-1 font-semibold text-navy">{COMPANY.legalName}</p>
      <p class="mt-1 text-sm text-slate">{COMPANY.address}</p>
      <ul class="mt-3 space-y-1.5 text-sm">
        <li>
          <a href={`mailto:${props.email}`} class="font-medium text-navy hover:text-gold">
            {props.email}
          </a>
        </li>
        {/* Phone hidden for now — mirrors the footer. Restore when the number is live.
        <li>
          <a href={`tel:${COMPANY.phoneHref}`} class="font-medium text-navy hover:text-gold">
            {COMPANY.phone}
          </a>
        </li>
        */}
      </ul>
      <p class="mt-3 text-xs text-slate">
        We acknowledge every request within 24 hours and aim to resolve it within 15 days.
      </p>
    </address>
  );
}

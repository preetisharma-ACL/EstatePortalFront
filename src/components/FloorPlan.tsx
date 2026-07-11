import { For, Show, createMemo, createSignal } from "solid-js";
import type { Configuration, ProjectDetail } from "~/lib/types";
import { formatINR, num, indianGroup } from "~/lib/format";

/**
 * Sizes & Floor Plan — a full-bleed two-column band in the project theme: a
 * navy panel (heading + a gold-ruled Type / Area / Price table + a download
 * button) beside a floor-plan slider. Hidden when there are no configs; the
 * right column shows only when real floor-plan images exist (no placeholder).
 */
export default function FloorPlan(props: { project: ProjectDetail }) {
  const rows = createMemo(() => props.project.configurations);

  const areaCell = (c: Configuration) => {
    const v = num(c.carpet_area) ?? num(c.saleable_area);
    if (v === null) return "On Request";
    return `${indianGroup(Math.round(v))} ${c.area_unit || "sq.ft."}`;
  };
  const priceCell = (c: Configuration) =>
    c.price !== null ? `${formatINR(c.price)}*` : "On Request";

  // Floor-plan media (used as a fallback when a config has no plan of its own,
  // indexed by row order). No frontend placeholder image is ever used.
  const mediaPlans = createMemo(() =>
    props.project.media
      .filter((m) => m.media_type === "floor_plan" && m.image)
      .map((m) => m.image!),
  );
  // The plan image for a given row: its config's own plan, else a media plan,
  // else the local fallback so the right column always shows a plan.
  const FALLBACK_PLAN = "/banner/floor-plan.jpeg";
  const planFor = (i: number): string =>
    rows()[i]?.floor_plan ?? mediaPlans()[i] ?? FALLBACK_PLAN;
  // With a fallback in place, the plan panel shows whenever there are rows.
  const hasAnyPlan = createMemo(() => rows().length > 0);

  // Active row drives the right-side plan; clicking a row selects it.
  const [active, setActive] = createSignal(0);
  const activeConfig = () => rows()[active()];
  const step = (dir: 1 | -1) => {
    const n = rows().length;
    if (n) setActive((i) => (i + dir + n) % n);
  };

  // Downloadable plan: a PDF document if present, else the active plan image.
  const downloadHref = () =>
    props.project.documents.find((d) => d.doc_type === "floor_plan_pdf")?.file ??
    planFor(active()) ??
    null;

  return (
    <Show when={rows().length}>
      <section class={hasAnyPlan() ? "grid border-t border-line lg:grid-cols-2" : "border-t border-line"}>
        {/* Left — navy panel with the sizes table */}
        <div class="flex flex-col justify-center bg-navy px-6 py-14 sm:px-10 lg:px-14 lg:py-20">
          <div class="mx-auto w-full max-w-xl lg:mx-0 lg:ml-auto lg:mr-12">
            <h2 class="font-display text-3xl font-semibold text-white sm:text-4xl">
              Sizes &amp; Floor Plan
            </h2>

            <div class="mt-8 overflow-x-auto">
              <table class="w-full min-w-[420px] border-collapse text-sm">
                <thead>
                  <tr>
                    <Th>Type</Th>
                    <Th>Area</Th>
                    <Th>Price</Th>
                  </tr>
                </thead>
                <tbody>
                  <For each={rows()}>
                    {(c, i) => (
                      <tr
                        onClick={() => setActive(i())}
                        aria-selected={active() === i()}
                        class={`cursor-pointer transition-colors ${
                          active() === i() ? "bg-gold/15" : "hover:bg-white/5"
                        }`}
                      >
                        <Td class="font-semibold text-white">
                          <span class="inline-flex items-center gap-2">
                            <span
                              class={`h-4 w-1 rounded-full ${active() === i() ? "bg-gold" : "bg-transparent"}`}
                              aria-hidden="true"
                            />
                            {c.sub_type_display}
                          </span>
                        </Td>
                        <Td>{areaCell(c)}</Td>
                        <Td>{priceCell(c)}</Td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>

            <Show when={downloadHref()}>
              {(href) => (
                <a
                  href={href()}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="mt-8 inline-flex items-center gap-2 rounded-[var(--radius-btn)] bg-gold px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-navy-deep transition-colors hover:bg-gold-soft"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" /></svg>
                  Download Floor Plan
                </a>
              )}
            </Show>
          </div>
        </div>

        {/* Right — floor plan for the selected row (only when plans exist) */}
        <Show when={hasAnyPlan()}>
          <div class="relative min-h-[380px] bg-card lg:min-h-full">
            {/* Top bar — active row info (left) + prev/next controls (right) */}
            <div class="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-4">
              <Show when={activeConfig()}>
                {(c) => (
                  <div class="rounded-[10px] bg-navy/90 px-4 py-2.5 text-white shadow-md backdrop-blur-sm">
                    <p class="font-display text-lg font-semibold leading-tight">{c().sub_type_display}</p>
                    <p class="mt-0.5 text-xs text-white/80">
                      {areaCell(c())} · {priceCell(c())}
                    </p>
                  </div>
                )}
              </Show>
              <Show when={rows().length > 1}>
                <div class="flex shrink-0 gap-2">
                  <button
                    type="button"
                    aria-label="Previous floor plan"
                    onClick={() => step(-1)}
                    class="grid h-10 w-10 place-items-center rounded-full bg-navy text-white shadow-md transition-colors hover:bg-navy-deep"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                  </button>
                  <button
                    type="button"
                    aria-label="Next floor plan"
                    onClick={() => step(1)}
                    class="grid h-10 w-10 place-items-center rounded-full bg-navy text-white shadow-md transition-colors hover:bg-navy-deep"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                  </button>
                </div>
              </Show>
            </div>

            {/* Active plan (real backend plan or local fallback image) */}
            <img
              src={planFor(active())}
              alt={`${props.project.name} — ${activeConfig()?.sub_type_display} floor plan`}
              class="absolute inset-0 h-full w-full object-contain p-6 pt-24 sm:p-10 sm:pt-28"
            />

            {/* Counter */}
            <Show when={rows().length > 1}>
              <span class="absolute bottom-4 right-4 z-10 rounded-full bg-navy/85 px-3 py-1 text-xs font-semibold text-white">
                {active() + 1} / {rows().length}
              </span>
            </Show>
          </div>
        </Show>
      </section>
    </Show>
  );
}

function Th(props: { children?: any }) {
  return (
    <th class="border border-gold/40 px-4 py-3 text-left font-semibold uppercase tracking-wide text-gold">
      {props.children}
    </th>
  );
}
function Td(props: { children?: any; class?: string }) {
  return (
    <td class={`border border-gold/25 px-4 py-3 align-middle text-white/85 ${props.class ?? ""}`}>
      {props.children}
    </td>
  );
}

import { For, Show, createMemo } from "solid-js";
import type { Configuration, ProjectDetail } from "~/lib/types";
import { formatINR, num, indianGroup } from "~/lib/format";
import CoverImage from "./CoverImage";

/**
 * Sizes & Floor Plan — a full-bleed two-column band in the project theme: a
 * navy panel (heading + a gold-ruled Type / Area / Price table + a download
 * button) beside the floor-plan artwork. Hidden when there are no configs.
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

  // Floor-plan artwork: a config's plan, else a dedicated floor-plan media item.
  const floorPlanImage = () =>
    props.project.configurations.find((c) => c.floor_plan)?.floor_plan ??
    props.project.media.find((m) => m.media_type === "floor_plan" && m.image)?.image ??
    null;
  // Fallback imagery keeps the right column filled when no plan is on file.
  const galleryFallback = () =>
    props.project.media
      .filter((m) => m.media_type !== "video" && m.image)
      .sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.order - b.order)[0]?.image ??
    "/banner/banner-2.jpg";
  const rightImage = () => floorPlanImage() ?? galleryFallback();
  const isPlan = () => Boolean(floorPlanImage());

  // Downloadable plan: a PDF document if present, else the plan image itself.
  const downloadHref = () =>
    props.project.documents.find((d) => d.doc_type === "floor_plan_pdf")?.file ??
    floorPlanImage() ??
    null;

  return (
    <Show when={rows().length}>
      <section class="grid lg:grid-cols-2">
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
                    {(c) => (
                      <tr>
                        <Td class="font-semibold text-white">{c.sub_type_display}</Td>
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

        {/* Right — floor-plan artwork */}
        <div class="relative min-h-[360px] bg-card lg:min-h-full">
          <CoverImage
            src={rightImage()}
            fallback="/banner/banner-2.jpg"
            alt={`${props.project.name} floor plan`}
            class={`absolute inset-0 h-full w-full ${isPlan() ? "object-contain p-6 sm:p-10" : "object-cover"}`}
          />
        </div>
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

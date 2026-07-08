import { createAsync } from "@solidjs/router";
import { For, Show, createSignal } from "solid-js";
import type { ProjectFilters, ConfigSubType } from "~/lib/types";
import { amenitiesQuery } from "~/lib/queries";
import { activeFilterCount } from "~/lib/filters";

const STATUSES: { v: string; label: string }[] = [
  { v: "ready_to_move", label: "Ready to move" },
  { v: "under_construction", label: "Under construction" },
  { v: "prelaunch", label: "New launch" },
  { v: "completed", label: "Completed" },
];

const SUB_TYPES: { v: ConfigSubType; label: string }[] = [
  { v: "studio", label: "Studio" }, { v: "1bhk", label: "1 BHK" },
  { v: "2bhk", label: "2 BHK" }, { v: "3bhk", label: "3 BHK" },
  { v: "4bhk", label: "4 BHK" }, { v: "5bhk", label: "5 BHK" },
  { v: "penthouse", label: "Penthouse" }, { v: "villa", label: "Villa" },
  { v: "plot", label: "Plot" }, { v: "office", label: "Office" },
  { v: "retail", label: "Retail" }, { v: "showroom", label: "Showroom" },
  { v: "warehouse", label: "Warehouse" }, { v: "coworking", label: "Co-working" },
  { v: "sco", label: "SCO" },
];

const PRICE_STEPS = [
  { v: 2500000, label: "25 L" }, { v: 5000000, label: "50 L" },
  { v: 10000000, label: "1 Cr" }, { v: 20000000, label: "2 Cr" },
  { v: 50000000, label: "5 Cr" }, { v: 100000000, label: "10 Cr" },
];

export default function FilterPanel(props: {
  filters: ProjectFilters;
  setParam: (key: string, value: string | number | undefined) => void;
  clearAll: () => void;
}) {
  const amenities = createAsync(() => amenitiesQuery(undefined));
  const [open, setOpen] = createSignal(false);
  const f = () => props.filters;
  const count = () => activeFilterCount(f());

  const panel = (
    <div class="space-y-6">
      <Section title="Property type">
        <div class="flex flex-wrap gap-2">
          <Chip active={!f().project_type} onClick={() => props.setParam("project_type", undefined)}>All</Chip>
          <Chip active={f().project_type === "residential"} onClick={() => props.setParam("project_type", "residential")}>Residential</Chip>
          <Chip active={f().project_type === "commercial"} onClick={() => props.setParam("project_type", "commercial")}>Commercial</Chip>
          <Chip active={f().project_type === "mixed"} onClick={() => props.setParam("project_type", "mixed")}>Mixed</Chip>
        </div>
      </Section>

      <Section title="Status">
        <div class="flex flex-wrap gap-2">
          <For each={STATUSES}>
            {(s) => (
              <Chip
                active={f().status === s.v}
                onClick={() => props.setParam("status", f().status === s.v ? undefined : s.v)}
              >
                {s.label}
              </Chip>
            )}
          </For>
        </div>
      </Section>

      <Section title="Bedrooms (BHK)">
        <div class="flex flex-wrap gap-2">
          <For each={[1, 2, 3, 4, 5]}>
            {(b) => (
              <Chip
                active={f().bhk === b}
                onClick={() => props.setParam("bhk", f().bhk === b ? undefined : b)}
              >
                {b} BHK
              </Chip>
            )}
          </For>
        </div>
      </Section>

      <Section title="Configuration">
        <select
          class="w-full rounded-[8px] border border-line bg-card px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-gold/40"
          value={f().sub_type ?? ""}
          onChange={(e) => props.setParam("sub_type", e.currentTarget.value || undefined)}
        >
          {/* `selected` is what survives SSR + hydration; a select's `value` attribute is ignored. */}
          <option value="" selected={!f().sub_type}>Any configuration</option>
          <For each={SUB_TYPES}>
            {(s) => <option value={s.v} selected={s.v === f().sub_type}>{s.label}</option>}
          </For>
        </select>
      </Section>

      <Section title="Budget">
        <div class="grid grid-cols-2 gap-2">
          <PriceSelect
            label="Min"
            value={f().min_price}
            onChange={(v) => props.setParam("min_price", v)}
          />
          <PriceSelect
            label="Max"
            value={f().max_price}
            onChange={(v) => props.setParam("max_price", v)}
          />
        </div>
      </Section>

      <Section title="Area (sq.ft.)">
        <div class="grid grid-cols-2 gap-2">
          <input
            type="number" min="0" placeholder="Min"
            class="w-full rounded-[8px] border border-line bg-card px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-gold/40"
            value={f().min_area ?? ""}
            onChange={(e) => props.setParam("min_area", e.currentTarget.value || undefined)}
          />
          <input
            type="number" min="0" placeholder="Max"
            class="w-full rounded-[8px] border border-line bg-card px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-gold/40"
            value={f().max_area ?? ""}
            onChange={(e) => props.setParam("max_area", e.currentTarget.value || undefined)}
          />
        </div>
      </Section>

      <Show when={amenities()?.length}>
        <Section title="Amenities">
          <select
            class="w-full rounded-[8px] border border-line bg-card px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-gold/40"
            value={f().amenity ?? ""}
            onChange={(e) => props.setParam("amenity", e.currentTarget.value || undefined)}
          >
            <option value="" selected={!f().amenity}>Any amenity</option>
            <For each={amenities()}>
              {(a) => <option value={a.slug} selected={a.slug === f().amenity}>{a.name}</option>}
            </For>
          </select>
        </Section>
      </Show>

      <Show when={count() > 0}>
        <button
          type="button"
          onClick={props.clearAll}
          class="w-full rounded-[8px] border border-navy/20 px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
        >
          Clear all filters ({count()})
        </button>
      </Show>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <div class="lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          class="flex w-full items-center justify-between rounded-[8px] border border-line bg-card px-4 py-3 text-sm font-semibold text-navy"
        >
          <span>Filters{count() ? ` · ${count()}` : ""}</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d={open() ? "m6 15 6-6 6 6" : "m6 9 6 6 6-6"} /></svg>
        </button>
        <Show when={open()}>
          <div class="mt-3 rounded-[12px] border border-line bg-card p-4">{panel}</div>
        </Show>
      </div>

      {/* Desktop rail */}
      <aside class="hidden lg:block">
        <div class="sticky top-20 rounded-[12px] border border-line bg-card p-5">
          <h2 class="mb-4 font-display text-lg font-semibold text-navy">Refine</h2>
          {panel}
        </div>
      </aside>
    </>
  );
}

function Section(props: { title: string; children: any }) {
  return (
    <div>
      <h3 class="eyebrow mb-2.5 text-slate/80">{props.title}</h3>
      {props.children}
    </div>
  );
}

function Chip(props: { active: boolean; onClick: () => void; children: any }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      aria-pressed={props.active}
      class={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
        props.active
          ? "border-gold bg-gold/12 text-navy"
          : "border-line bg-card text-navy/75 hover:border-gold-soft"
      }`}
    >
      {props.children}
    </button>
  );
}

function PriceSelect(props: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
}) {
  return (
    <select
      aria-label={`${props.label} price`}
      class="w-full rounded-[8px] border border-line bg-card px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-gold/40"
      value={props.value ?? ""}
      onChange={(e) => props.onChange(e.currentTarget.value ? Number(e.currentTarget.value) : undefined)}
    >
      <option value="" selected={props.value === undefined}>{props.label}</option>
      <For each={PRICE_STEPS}>
        {(p) => <option value={p.v} selected={p.v === props.value}>{`₹${p.label}`}</option>}
      </For>
    </select>
  );
}

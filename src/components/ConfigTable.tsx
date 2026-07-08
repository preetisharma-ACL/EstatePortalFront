import { For, Show, createMemo } from "solid-js";
import type { Configuration } from "~/lib/types";
import { formatINR, pricePerSqft, num, indianGroup } from "~/lib/format";

/**
 * Configuration table. Residential rows (bhk set, lump-sum price) and
 * commercial rows (bhk null, price_per_sqft) get slightly different columns,
 * so we split by category and render the layout each deserves.
 */
export default function ConfigTable(props: { configurations: Configuration[] }) {
  const residential = createMemo(() =>
    props.configurations.filter((c) => c.category === "residential"),
  );
  const commercial = createMemo(() =>
    props.configurations.filter((c) => c.category === "commercial"),
  );

  /**
   * BHK hint shown after the label — only when the label doesn't already state it.
   * "2 BHK" stays "2 BHK" (not "2 BHK (2 BHK)"), while "Villa" becomes "Villa (4 BHK)".
   */
  const bhkHint = (c: Configuration): string | null => {
    const b = num(c.bhk);
    if (b === null) return null;
    if (/bhk/i.test(c.sub_type_display ?? "")) return null;
    return `${b} BHK`;
  };

  const areaCell = (c: Configuration) => {
    const carpet = num(c.carpet_area);
    const saleable = num(c.saleable_area);
    const v = carpet ?? saleable;
    if (v === null) return "—";
    return `${indianGroup(Math.round(v))} ${c.area_unit || "sq.ft."}`;
  };

  return (
    <div class="space-y-8">
      <Show when={residential().length}>
        <div>
          <h3 class="eyebrow mb-3 text-gold">Residential configurations</h3>
          <Table>
            <thead>
              <tr class="border-b border-line text-left text-xs uppercase tracking-wide text-slate">
                <Th>Type</Th>
                <Th>Carpet / Saleable area</Th>
                <Th class="text-right">Price</Th>
                <Th class="text-right">Availability</Th>
              </tr>
            </thead>
            <tbody>
              <For each={residential()}>
                {(c) => (
                  <tr class="border-b border-line/70 last:border-0">
                    <Td>
                      <span class="font-semibold text-navy">{c.sub_type_display}</span>
                      <Show when={bhkHint(c)}>
                        {(h) => <span class="ml-1 text-xs text-slate">({h()})</span>}
                      </Show>
                    </Td>
                    <Td>{areaCell(c)}</Td>
                    <Td class="text-right font-display font-semibold text-navy">
                      {c.price !== null ? formatINR(c.price) : "On request"}
                    </Td>
                    <Td class="text-right">
                      <Availability available={c.is_available} />
                    </Td>
                  </tr>
                )}
              </For>
            </tbody>
          </Table>
        </div>
      </Show>

      <Show when={commercial().length}>
        <div>
          <h3 class="eyebrow mb-3 text-gold">Commercial configurations</h3>
          <Table>
            <thead>
              <tr class="border-b border-line text-left text-xs uppercase tracking-wide text-slate">
                <Th>Type</Th>
                <Th>Saleable area</Th>
                <Th class="text-right">Rate</Th>
                <Th class="text-right">Indicative price</Th>
                <Th class="text-right">Availability</Th>
              </tr>
            </thead>
            <tbody>
              <For each={commercial()}>
                {(c) => (
                  <tr class="border-b border-line/70 last:border-0">
                    <Td>
                      <span class="font-semibold text-navy">{c.sub_type_display}</span>
                    </Td>
                    <Td>{areaCell(c)}</Td>
                    <Td class="text-right">{pricePerSqft(c.price_per_sqft) ?? "—"}</Td>
                    <Td class="text-right font-display font-semibold text-navy">
                      {c.price !== null ? formatINR(c.price) : "On request"}
                    </Td>
                    <Td class="text-right">
                      <Availability available={c.is_available} />
                    </Td>
                  </tr>
                )}
              </For>
            </tbody>
          </Table>
        </div>
      </Show>
    </div>
  );
}

function Table(props: { children: any }) {
  return (
    <div class="overflow-x-auto rounded-[12px] border border-line bg-card">
      <table class="w-full min-w-[560px] border-collapse text-sm">{props.children}</table>
    </div>
  );
}
function Th(props: { children?: any; class?: string }) {
  return <th class={`px-4 py-3 font-semibold ${props.class ?? ""}`}>{props.children}</th>;
}
function Td(props: { children?: any; class?: string }) {
  return <td class={`px-4 py-3 align-middle text-navy/85 ${props.class ?? ""}`}>{props.children}</td>;
}
function Availability(props: { available: boolean }) {
  return (
    <span
      class={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
        props.available ? "bg-green/10 text-green" : "bg-slate/10 text-slate"
      }`}
    >
      {props.available ? "Available" : "Sold out"}
    </span>
  );
}

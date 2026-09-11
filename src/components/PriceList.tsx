import { For, Show } from "solid-js";
import type { Configuration } from "~/lib/types";
import { num, indianGroup, priceDisplay } from "~/lib/format";

/**
 * The price list, one row per configuration.
 *
 * THE POINT OF THIS TABLE is the price column. An unverified price prints its
 * label — "Not verified", "On request" — rather than the number, even when a
 * number exists on the record, and rather than an empty cell. Portals disagree
 * with each other and with the developer, so a labelled unknown is both honest
 * and more useful than a figure the page cannot stand behind.
 *
 * See priceDisplay in lib/format for the rule itself.
 */
export default function PriceList(props: { configurations: Configuration[] }) {
  const area = (c: Configuration) => {
    const v = num(c.carpet_area) ?? num(c.saleable_area);
    return v === null ? "On request" : `${indianGroup(Math.round(v))} ${c.area_unit || "sq.ft."}`;
  };
  const typeLabel = (c: Configuration) =>
    [c.bhk, c.sub_type_display].filter(Boolean).join(" ") || c.sub_type_display || "—";

  return (
    // Wide tables scroll inside their own box rather than widening the page.
    <div class="mx-auto max-w-4xl overflow-x-auto rounded-[14px] border border-line bg-card">
      <table class="w-full min-w-[420px] border-collapse text-sm">
        <thead>
          <tr class="border-b border-line bg-paper">
            <Th>Type</Th>
            <Th>Area</Th>
            <Th>Price</Th>
          </tr>
        </thead>
        <tbody>
          <For each={props.configurations}>
            {(c) => (
              <tr class="border-b border-line last:border-b-0">
                <Td>
                  <span class="font-semibold text-navy">{typeLabel(c)}</span>
                </Td>
                <Td>{area(c)}</Td>
                <Td>
                  <Show
                    when={c.price_status === "verified"}
                    fallback={
                      // Muted and italic: legible, clearly not a figure, and
                      // clearly not a blank cell either.
                      <span class="italic text-slate">
                        {c.price_status_display || "Not verified"}
                      </span>
                    }
                  >
                    <span class="font-semibold text-navy">
                      {priceDisplay(c.price, c.price_status, c.price_status_display)}
                    </span>
                  </Show>
                </Td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
}

function Th(props: { children: any }) {
  return (
    <th class="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate">
      {props.children}
    </th>
  );
}

function Td(props: { children: any }) {
  return <td class="px-5 py-3.5 text-[15px] text-slate">{props.children}</td>;
}

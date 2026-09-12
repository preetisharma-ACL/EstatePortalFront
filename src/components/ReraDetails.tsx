import { For, Show, createMemo } from "solid-js";
import type { ReraRegistration } from "~/lib/types";
import ReraSeal from "./ReraSeal";

/**
 * The registered RERA record, as a "RERA Information / Details" table.
 *
 * Three things this block is careful about, and they survive the table format:
 *
 *   1. `complaints_count` — 0 is MEANINGFUL ("zero complaints on record") and
 *      null means nobody checked. Rendering null as 0 would publish a claim we
 *      have not verified, so the row is omitted entirely when it is null.
 *
 *   2. `record_checked_on` — RERA records change, and the content doc tells
 *      buyers to re-check before booking. The block carries its own as-of date
 *      rather than implying it is current, and says so plainly when it has none.
 *
 *   3. `promoter` — the company registered against the project, which is often
 *      not the brand marketing it. Shown here rather than merged into the
 *      developer, because the buyer is told to check the promoter specifically.
 *      It NEVER falls back to the developer name: blank means unrecorded, not
 *      "same company". Karyan Nine is marketed by Karyan Group and registered
 *      to AIH Realty Private Limited, and all 430 RERA records have a blank
 *      promoter — so a fallback would print the brand under a heading that
 *      means the registered entity, inside a block reproducing the regulatory
 *      record. That is the exact confusion the content doc warns buyers about,
 *      dressed as verified data. An absent row says "we have not recorded it";
 *      a wrong one says "we checked".
 *
 * A blank field drops its row rather than printing an empty cell — most fields
 * are unfilled on most projects today, and a table of empty rows reads as broken
 * where a short table reads as "this is what is on record".
 *
 * `registered_project_type` can disagree with the marketed type — a mixed-use
 * project registered as Commercial, say. Both are shown when they differ;
 * reconciling them would hide the discrepancy the buyer wants.
 */
export default function ReraDetails(props: {
  registrations: ReraRegistration[];
  /** First row of the table, per the SEO team's shape. */
  projectName: string;
  /**
   * Project-level registered company, used when a registration does not name
   * its own promoter. Distinct from the developer, and NOT defaulted to it —
   * blank here and on the registration means the row is omitted.
   */
  legalPromoter?: string;
  /** Shown against the registered type, for comparison. */
  marketedType?: string;
}) {
  return (
    <div class="mx-auto max-w-4xl space-y-6">
      <For each={props.registrations}>
        {(r) => (
          <Record
            r={r}
            projectName={props.projectName}
            legalPromoter={props.legalPromoter}
            marketedType={props.marketedType}
          />
        )}
      </For>
    </div>
  );
}

function Record(props: {
  r: ReraRegistration;
  projectName: string;
  legalPromoter?: string;
  marketedType?: string;
}) {
  const r = () => props.r;

  const rows = createMemo(() => {
    const out: { label: string; value: string }[] = [];
    const add = (label: string, value: string | number | null | undefined) => {
      const v = value?.toString().trim();
      if (v) out.push({ label, value: v });
    };

    add("Project Name", props.projectName);
    add("RERA Number", r().rera_number);
    add("Registration Date", r().registration_date);
    add("Promoter", r().promoter?.trim() || props.legalPromoter?.trim());
    add("Project Type", r().registered_project_type);
    // Only when it actually differs — an identical pair would read as a
    // discrepancy where there is none.
    if (
      props.marketedType &&
      r().registered_project_type?.trim() &&
      r().registered_project_type.trim().toLowerCase() !== props.marketedType.trim().toLowerCase()
    ) {
      add("Marketed As", props.marketedType);
    }
    add("Proposed Start Date", r().proposed_start_date);
    add("Declared Completion", r().declared_completion_date);
    add("District", r().district);
    add("Tehsil", r().tehsil);
    add("Registered Address", r().registered_address);
    add("Phase", r().phase);
    add("Valid Till", r().valid_till);
    add("Authority", r().authority || r().state);
    return out;
  });

  return (
    <div class="overflow-hidden rounded-[14px] border border-green/25 bg-green/[0.04]">
      <div class="flex flex-wrap items-center gap-3 px-6 py-5">
        <ReraSeal size="md" />
        <div class="min-w-0">
          <p class="rera-num text-sm text-navy">{r().rera_number}</p>
          <p class="text-xs text-slate">{r().authority || r().state}</p>
        </div>
      </div>

      {/* Wide values (a registered address) scroll inside the box rather than
          widening the page. */}
      <div class="overflow-x-auto border-t border-line bg-card">
        <table class="w-full min-w-[380px] border-collapse text-sm">
          <thead>
            <tr class="border-b border-line bg-paper">
              <th class="w-2/5 px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate">
                RERA Information
              </th>
              <th class="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate">
                Details
              </th>
            </tr>
          </thead>
          <tbody>
            <For each={rows()}>
              {(row) => (
                <tr class="border-b border-line last:border-b-0">
                  <th scope="row" class="px-5 py-3 text-left align-top text-[15px] font-semibold text-navy">
                    {row.label}
                  </th>
                  <td class="px-5 py-3 align-top text-[15px] text-slate">{row.value}</td>
                </tr>
              )}
            </For>

            {/* Only when someone actually looked. Null is "unchecked", not zero. */}
            <Show when={r().complaints_count !== null}>
              <tr class="border-b border-line last:border-b-0">
                <th scope="row" class="px-5 py-3 text-left align-top text-[15px] font-semibold text-navy">
                  Complaints on Record
                </th>
                <td class="px-5 py-3 align-top text-[15px] text-slate">{r().complaints_count}</td>
              </tr>
            </Show>
          </tbody>
        </table>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3 border-t border-line px-6 py-4">
        <p class="text-xs text-slate">
          <Show
            when={r().record_checked_on}
            fallback="RERA records change — verify on the official portal before booking."
          >
            {(checked) => (
              <>Record checked on {checked()}. RERA records change — re-check before booking.</>
            )}
          </Show>
        </p>
        <Show when={r().source_url}>
          <a
            href={r().source_url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            class="shrink-0 rounded-[8px] border border-navy/25 px-3.5 py-2 text-xs font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
          >
            Verify on the portal
          </a>
        </Show>
      </div>
    </div>
  );
}

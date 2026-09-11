import { For, Show, createMemo } from "solid-js";
import type { ReraRegistration } from "~/lib/types";
import ReraSeal from "./ReraSeal";

/**
 * The full RERA record for each registration.
 *
 * Three things this block is careful about:
 *
 *   1. `complaints_count` — 0 is MEANINGFUL ("zero complaints on record") and
 *      null means nobody checked. Rendering null as 0 would publish a claim we
 *      have not verified, so the row is omitted entirely when it is null.
 *
 *   2. `record_checked_on` — RERA records change, and buyers are told to
 *      re-check before booking. The block carries its own as-of date rather
 *      than implying it is current, and says so plainly when it has none.
 *
 *   3. `promoter` — the company registered against the project, which is often
 *      not the brand marketing it. Shown here rather than merged into the
 *      developer, because the buyer is told to check the promoter specifically.
 *      Blank means they are the same, so the developer name stands in.
 *
 * `registered_project_type` can disagree with the marketed type — a mixed-use
 * project registered as Commercial, say. Both are shown; reconciling them would
 * hide the discrepancy the buyer wants.
 */
export default function ReraDetails(props: {
  registrations: ReraRegistration[];
  /**
   * Project-level registered company, used when a registration does not name
   * its own promoter. Distinct from the developer: the brand marketing a
   * project and the company registered against it are often different, and
   * buyers are told to check the promoter specifically.
   */
  legalPromoter?: string;
  /** Last resort — a blank promoter everywhere means they are the same company. */
  developerName: string;
  /** Shown alongside the registered type, for comparison. */
  marketedType?: string;
}) {
  return (
    <div class="mx-auto max-w-4xl space-y-5">
      <For each={props.registrations}>
        {(r) => (
          <Record
            r={r}
            promoterFallback={props.legalPromoter?.trim() || props.developerName}
            marketedType={props.marketedType}
          />
        )}
      </For>
    </div>
  );
}

function Record(props: { r: ReraRegistration; promoterFallback: string; marketedType?: string }) {
  const r = () => props.r;

  const rows = createMemo(() => {
    const out: { label: string; value: string }[] = [];
    const add = (label: string, value: string | null | undefined) => {
      const v = value?.toString().trim();
      if (v) out.push({ label, value: v });
    };

    add("Promoter", r().promoter?.trim() || props.promoterFallback);
    add("Registered type", r().registered_project_type);
    if (props.marketedType && r().registered_project_type) {
      add("Marketed as", props.marketedType);
    }
    add("Registered on", r().registration_date);
    add("Proposed start", r().proposed_start_date);
    add("Declared completion", r().declared_completion_date);
    add("Valid till", r().valid_till);
    add("District", r().district);
    add("Tehsil", r().tehsil);
    add("Registered address", r().registered_address);
    add("Authority", r().authority || r().state);
    return out;
  });

  return (
    <div class="rounded-[14px] border border-green/25 bg-green/[0.04] p-6">
      <div class="flex flex-wrap items-center gap-3">
        <ReraSeal size="md" />
        <div class="min-w-0">
          <p class="rera-num text-sm text-navy">{r().rera_number}</p>
          <p class="text-xs text-slate">
            <Show when={r().phase}>Phase {r().phase} · </Show>
            {r().authority || r().state}
          </p>
        </div>
      </div>

      <Show when={rows().length}>
        <dl class="mt-5 grid gap-x-8 gap-y-3 border-t border-line pt-5 sm:grid-cols-2">
          <For each={rows()}>
            {(row) => (
              <div class="flex flex-col gap-0.5">
                <dt class="eyebrow text-slate">{row.label}</dt>
                <dd class="text-[15px] leading-snug text-navy">{row.value}</dd>
              </div>
            )}
          </For>

          {/* Only when someone actually looked. Null is "unchecked", not zero. */}
          <Show when={r().complaints_count !== null}>
            <div class="flex flex-col gap-0.5">
              <dt class="eyebrow text-slate">Complaints on record</dt>
              <dd class="text-[15px] leading-snug text-navy">{r().complaints_count}</dd>
            </div>
          </Show>
        </dl>
      </Show>

      <div class="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
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

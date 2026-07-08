import { For, Show } from "solid-js";
import type { ReraRegistration } from "~/lib/types";
import { titleCase } from "~/lib/format";
import ReraSeal from "./ReraSeal";

/**
 * The trust signature. Renders each RERA registration prominently: the seal,
 * the mono registration number, phase, authority, and an outbound verify link.
 */
export default function ReraBadges(props: { registrations: ReraRegistration[] }) {
  return (
    <Show
      when={props.registrations.length}
      fallback={
        <p class="rounded-[12px] border border-line bg-card p-4 text-sm text-slate">
          RERA registration details available on request.
        </p>
      }
    >
      <div class="rounded-[12px] border border-green/25 bg-green/[0.04] p-5">
        <div class="mb-4 flex items-center gap-3">
          <ReraSeal size="md" />
          <div>
            <h3 class="font-display text-lg font-semibold text-navy">RERA verified</h3>
            <p class="text-sm text-slate">
              Registered with the state authority. Verify on the official portal.
            </p>
          </div>
        </div>

        <ul class="space-y-3">
          <For each={props.registrations}>
            {(r) => (
              <li class="flex flex-col gap-2 rounded-[10px] border border-line bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="rera-num text-sm text-navy">{r.rera_number}</span>
                    <StatusPill status={r.status} />
                  </div>
                  <p class="mt-1 text-xs text-slate">
                    <Show when={r.phase}>{r.phase} · </Show>
                    {r.authority || r.state}
                    <Show when={r.valid_till}> · valid till {r.valid_till}</Show>
                  </p>
                </div>
                <Show when={r.source_url}>
                  <a
                    href={r.source_url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    class="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-gold hover:underline"
                  >
                    Verify
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M7 17 17 7M9 7h8v8" />
                    </svg>
                  </a>
                </Show>
              </li>
            )}
          </For>
        </ul>
      </div>
    </Show>
  );
}

function StatusPill(props: { status: string }) {
  const cls =
    props.status === "registered" ? "bg-green/10 text-green"
    : props.status === "applied" ? "bg-gold/15 text-[#8a6d24]"
    : "bg-red-100 text-red-700";
  return (
    <span class={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {titleCase(props.status)}
    </span>
  );
}

import { Show } from "solid-js";

/**
 * SIGNATURE — the RERA verified seal. A gold-edged green badge.
 * Used on cards (compact) and detail pages (with label).
 */
export default function ReraSeal(props: {
  label?: boolean;
  size?: "sm" | "md";
  class?: string;
}) {
  const dim = props.size === "md" ? 44 : 34;
  return (
    <span
      class={`inline-flex items-center gap-2 ${props.class ?? ""}`}
      title="RERA-verified project"
    >
      <span
        class="relative inline-grid place-items-center rounded-full bg-green text-white shadow-[0_0_0_2px_var(--color-gold)]"
        style={{ width: `${dim}px`, height: `${dim}px` }}
        aria-hidden="true"
      >
        <span
          class="absolute inset-[3px] rounded-full border border-gold-soft/60"
          aria-hidden="true"
        />
        <svg
          viewBox="0 0 24 24"
          width={dim * 0.5}
          height={dim * 0.5}
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
      <Show when={props.label}>
        <span class="flex flex-col leading-tight">
          <span class="eyebrow text-green">RERA</span>
          <span class="text-xs font-semibold text-navy">Verified</span>
        </span>
      </Show>
      <span class="sr-only">RERA verified</span>
    </span>
  );
}

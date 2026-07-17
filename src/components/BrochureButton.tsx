import { openLeadModal } from "~/lib/leadModal";

/**
 * "Download Brochure" CTA. The brochure is lead-gated: the click opens the
 * site-wide <LeadPopup> enquiry form rather than linking to a file.
 *
 * `variant` picks the treatment for the surface it sits on — "solid" gold on
 * light sections, "outline" gold on navy.
 */
export default function BrochureButton(props: {
  variant?: "solid" | "outline";
  label?: string;
  class?: string;
}) {
  const style = () =>
    props.variant === "outline"
      ? "border border-gold/60 text-gold-soft hover:bg-gold hover:text-navy-deep"
      : "bg-gold text-navy-deep hover:bg-gold-soft";

  return (
    <button
      type="button"
      onClick={openLeadModal}
      class={`inline-flex shrink-0 items-center justify-center gap-2 rounded-[var(--radius-btn)] px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-colors ${style()} ${props.class ?? ""}`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0" aria-hidden="true">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" />
      </svg>
      {props.label ?? "Download Brochure"}
    </button>
  );
}

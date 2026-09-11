import { Show } from "solid-js";
import { phoneOrUndefined, telHref } from "~/lib/contactPhone";

/**
 * Click-to-call button for a page whose record carries a `contact_phone`.
 *
 * Renders NOTHING when the number is blank — which is every project and every
 * township until the content team starts filling the field in. No placeholder,
 * no empty row, so a page with no number set looks exactly as it did before.
 *
 * Pass the raw payload value; the empty-string check lives here so no call site
 * has to remember that "unset" arrives as "" rather than null.
 */
export default function CallCta(props: {
  phone: string | null | undefined;
  /**
   * `solid` for a light background (the gold button used elsewhere on the
   * page), `glass` for the translucent treatment that sits over hero imagery.
   */
  variant?: "solid" | "glass";
  /** Hides the number below `sm`, leaving just "Call" — for tight button rows. */
  compactLabel?: boolean;
  class?: string;
}) {
  const phone = () => phoneOrUndefined(props.phone);

  const styles = () =>
    props.variant === "glass"
      ? "border border-white/25 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
      : "border border-navy/25 bg-white text-navy hover:bg-navy hover:text-white";

  return (
    <Show when={phone()}>
      {(number) => (
        <a
          href={telHref(number())}
          class={`inline-flex shrink-0 items-center justify-center gap-2 rounded-[var(--radius-btn)] px-6 py-3 text-sm font-semibold transition-colors ${styles()} ${props.class ?? ""}`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="shrink-0"
            aria-hidden="true"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
          </svg>
          {/* The number itself is the label — it reassures before the tap in a
              way a bare "Call" does not. Collapsed to "Call" only where the
              button shares a row with others on a narrow screen. */}
          <span class={props.compactLabel ? "hidden sm:inline" : ""}>{number()}</span>
          <Show when={props.compactLabel}>
            <span class="sm:hidden">Call</span>
          </Show>
        </a>
      )}
    </Show>
  );
}

import { Show, createEffect, onCleanup, onMount } from "solid-js";
import { useLocation } from "@solidjs/router";
import LeadForm from "./LeadForm";
import { leadModalOpen, leadModalContext, openLeadModal, closeLeadModal } from "~/lib/leadModal";

/** sessionStorage key — once set, the auto-popup won't show again this session. */
const SEEN_KEY = "ep_lead_popup_seen";
/** Delay before the popup appears on the first load of a session. */
const DELAY_MS = 3000;

/**
 * The project page's path shape. Read straight off the pathname rather than
 * from the loaded project, because this modal renders in the root layout —
 * outside the route — and must know the project the instant it opens, which is
 * 3s after arrival on a cold ad landing. Anything async would be undefined then.
 */
const PROJECT_PATH = /^\/project\/([^/?#]+)/;

/**
 * Lead popup — a site-wide modal shared by two triggers: it auto-opens once per
 * browser session, 3s after arrival (remembered via sessionStorage), and it also
 * opens on demand from the header "Talk to an advisor" button (via leadModal).
 * Closes on the backdrop, the ✕, or Escape, and locks body scroll while open.
 */
export default function LeadPopup() {
  const open = leadModalOpen;
  const close = closeLeadModal;
  const location = useLocation();

  /**
   * The project this enquiry is about. An explicit context from the trigger
   * wins (a listing card knows its project when the URL doesn't); otherwise the
   * route names it. Every lead from a project page now carries the slug —
   * previously the popup and every brochure CTA sent none, and the lead landed
   * unattributed however it had been triggered.
   */
  const projectSlug = () => {
    const explicit = leadModalContext().projectSlug;
    if (explicit) return explicit;
    const m = PROJECT_PATH.exec(location.pathname);
    return m ? decodeURIComponent(m[1]) : undefined;
  };

  onMount(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      // Private mode / storage disabled — treat as seen so we don't auto-loop.
      seen = true;
    }
    if (seen) return;

    const timer = setTimeout(() => {
      openLeadModal();
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* ignore */
      }
    }, DELAY_MS);
    onCleanup(() => clearTimeout(timer));
  });

  // Lock body scroll + Escape-to-close while the modal is open.
  createEffect(() => {
    if (!open()) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    onCleanup(() => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    });
  });

  return (
    <Show when={open()}>
      <div
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Enquiry"
      >
        {/* Backdrop */}
        <div
          class="absolute inset-0 bg-navy-deep/70 backdrop-blur-sm"
          onClick={close}
          aria-hidden="true"
        />

        {/* Card — wide (landscape) so the form's paired fields sit side by side */}
        <div class="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[18px] border border-line bg-card p-6 shadow-2xl sm:p-8">
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            class="absolute right-3.5 top-3.5 grid h-9 w-9 place-items-center rounded-full text-slate transition-colors hover:bg-navy/5 hover:text-navy"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
          <LeadForm
            heading="Talk to a property advisor"
            subheading="Share a few details and a verified advisor will help you shortlist RERA-verified options — no pressure, no spam."
            projectSlug={projectSlug()}
            citySlug={leadModalContext().citySlug}
            contextNote={leadModalContext().contextNote}
          />
        </div>
      </div>
    </Show>
  );
}

import { createSignal } from "solid-js";

/**
 * Context the modal's form should submit with. A trigger that knows which
 * project (or city) it is enquiring about passes it here; otherwise <LeadPopup>
 * falls back to the route. See the comment there for why both paths exist.
 */
export type LeadModalContext = {
  projectSlug?: string;
  citySlug?: string;
  /** Free-text note prepended to the lead's `message` — see LeadForm. */
  contextNote?: string;
};

/**
 * Shared open-state for the site-wide lead form modal. Both the first-visit
 * auto-popup and the header "Talk to an advisor" button drive this, so the same
 * <LeadPopup> modal serves every trigger.
 */
const [leadModalOpen, setLeadModalOpen] = createSignal(false);
const [leadModalContext, setLeadModalContext] = createSignal<LeadModalContext>({});

export { leadModalOpen, leadModalContext };

/**
 * Opens the modal. Pass a context from any trigger that is about a specific
 * project but sits on a route that doesn't name one (a listing card, say) —
 * without it the lead reaches the backend with no project and the click is
 * unattributed.
 */
export const openLeadModal = (ctx: LeadModalContext = {}) => {
  setLeadModalContext(ctx);
  setLeadModalOpen(true);
};

export const closeLeadModal = () => {
  setLeadModalOpen(false);
  setLeadModalContext({});
};

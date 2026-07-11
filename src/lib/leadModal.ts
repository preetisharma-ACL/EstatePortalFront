import { createSignal } from "solid-js";

/**
 * Shared open-state for the site-wide lead form modal. Both the first-visit
 * auto-popup and the header "Talk to an advisor" button drive this, so the same
 * <LeadPopup> modal serves every trigger.
 */
const [leadModalOpen, setLeadModalOpen] = createSignal(false);

export { leadModalOpen };
export const openLeadModal = () => setLeadModalOpen(true);
export const closeLeadModal = () => setLeadModalOpen(false);

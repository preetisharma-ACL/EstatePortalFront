/**
 * Which number the "Location Details" panel of the contact band shows.
 *
 * Most pages quote the portal desk. A few are fielded by a different desk, so
 * they are listed here rather than hardcoded at the call site — one place to
 * look when a number changes hands.
 *
 * Note these are display strings, formatted the way the panel renders them.
 */

/** Portal default — every page that isn't overridden below. */
export const DEFAULT_DESK_PHONE = "+91 98990 55893";

/** Desk that fields township enquiries. */
export const TOWNSHIP_DESK_PHONE = "+91 99533 26363";

/**
 * Projects fielded by a desk other than the portal default, keyed by the slug
 * the backend serves (the same one in the URL, e.g. /project/divyansh-orion-homes).
 * A slug that no longer exists just falls back to the default.
 */
const PROJECT_DESK_PHONES: Record<string, string> = {
  "divyansh-orion-homes": "+91 99533 26363",
};

export const deskPhoneForProject = (slug: string): string =>
  PROJECT_DESK_PHONES[slug] ?? DEFAULT_DESK_PHONE;

/**
 * Pages that carry a click-to-call button in the header, keyed by pathname.
 * Only campaign landing pages get one — everywhere else the header CTA is the
 * "Talk to an advisor" modal, which captures a lead instead of dropping the
 * visitor into a dialler.
 */
const HEADER_CALL_PHONES: Record<string, string> = {
  "/township/aditya-world-city": TOWNSHIP_DESK_PHONE,
};

/** The header's call number for a route, or undefined if it shouldn't show one. */
export const headerCallPhone = (pathname: string): string | undefined =>
  HEADER_CALL_PHONES[pathname.replace(/\/+$/, "") || "/"];

/** `tel:` target for a display number — strips the spaces, keeps the +91. */
export const telHref = (phone: string): string => `tel:${phone.replace(/[^\d+]/g, "")}`;

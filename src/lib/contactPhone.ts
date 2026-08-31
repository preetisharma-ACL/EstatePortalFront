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

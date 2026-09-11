/**
 * Which number a page quotes, and whether it offers a call CTA at all.
 *
 * Two sources, in priority order:
 *
 *   1. `contact_phone` on the project or locality payload, set per record in
 *      the admin. Always present, EMPTY STRING when unset. This is the one the
 *      content team controls, so it wins whenever it is filled in.
 *   2. The maps below — the numbers that predate that field. They stay as the
 *      fallback so nothing changes on a page whose record is still blank, and
 *      an entry becomes dead the moment its record gets a number.
 *
 * Empty at BOTH levels means render no call CTA: no placeholder, no empty row.
 *
 * Note these are display strings, formatted the way the panel renders them.
 */

/**
 * Normalises a payload `contact_phone` to "a number, or nothing".
 *
 * The backend sends "" rather than null for an unset number, and "" is falsy
 * but still a string — passing it straight to a `??` chain or a `<Show>` would
 * render an empty call button. Everything that reads the field goes through
 * here.
 */
export const phoneOrUndefined = (value: string | null | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

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
  "vvip-namah": "+91 99533 26363",
  "ska-imperia-wave-city": "+91 92173 28310",
  "rg-pleiaddes": "+91 92173 28310",
};

export const deskPhoneForProject = (slug: string): string =>
  PROJECT_DESK_PHONES[slug] ?? DEFAULT_DESK_PHONE;

/**
 * The number a project page quotes: its own `contact_phone` when the admin has
 * one, else the desk map above, else the portal default. Always resolves to
 * something — this is the "Location Details" row, which has always shown a
 * number. The call CTA is gated separately, on phoneOrUndefined alone.
 */
export const projectPhone = (contactPhone: string | null | undefined, slug: string): string =>
  phoneOrUndefined(contactPhone) ?? deskPhoneForProject(slug);

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

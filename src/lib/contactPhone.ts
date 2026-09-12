/**
 * Helpers for the admin-set contact details — the number and the email address.
 *
 * There is no default and no per-slug map any more. What a page shows is
 * whatever `contact_phone` / `contact_email` the API serves for that project or
 * locality, and nothing else: set it and the page shows it, leave it blank and
 * the page shows nothing at all — no heading, no empty row, no fallback desk
 * line, no portal-wide inbox.
 *
 * That last part is the point of the change. A default meant the detail could
 * never hide, so a visitor enquiring about any project was quoted a desk that
 * might not field it — and sending someone to the wrong desk is worse than
 * showing no contact at all.
 *
 * Every caller goes through the *OrUndefined helpers, because the backend sends
 * "" for unset rather than null, and "" is falsy but still a string: passed
 * straight to a `??` chain or a `<Show>` it renders an empty call button.
 */

/** A value, or nothing. Trims, and treats the empty string as unset. */
const setOrUndefined = (value: string | null | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

/** A number, or nothing. Trims, and treats the empty string as unset. */
export const phoneOrUndefined = setOrUndefined;

/** An email address, or nothing. Trims, and treats the empty string as unset. */
export const emailOrUndefined = setOrUndefined;

/** `tel:` target for a display number — strips the spaces, keeps the +91. */
export const telHref = (phone: string): string => `tel:${phone.replace(/[^\d+]/g, "")}`;

/** `mailto:` target for a display address. */
export const mailtoHref = (email: string): string => `mailto:${email}`;

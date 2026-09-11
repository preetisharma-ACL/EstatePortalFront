/**
 * Helpers for the admin-set contact number.
 *
 * There is no default and no per-slug map any more. The number a page shows is
 * whatever `contact_phone` the API serves for that project or locality, and
 * nothing else: set it and the page shows it, leave it blank and the page shows
 * no number at all — no heading, no empty row, no fallback desk line.
 *
 * That last part is the point of the change. A default meant the number could
 * never hide, so a visitor enquiring about any project was quoted a desk that
 * might not field it — and sending someone to the wrong desk is worse than
 * showing no number.
 *
 * Every caller goes through phoneOrUndefined, because the backend sends "" for
 * unset rather than null, and "" is falsy but still a string: passed straight
 * to a `??` chain or a `<Show>` it renders an empty call button.
 */

/** A number, or nothing. Trims, and treats the empty string as unset. */
export const phoneOrUndefined = (value: string | null | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

/** `tel:` target for a display number — strips the spaces, keeps the +91. */
export const telHref = (phone: string): string => `tel:${phone.replace(/[^\d+]/g, "")}`;

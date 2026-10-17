import { onMount } from "solid-js";
import { fireMetaLead, takeStashedMetaLead } from "~/lib/metaPixel";

/**
 * Fires the Meta pixel event for the enquiry that led here — the Meta twin of
 * <AdsConversion>, and for the same reasons: the pixel comes from the lead
 * response the form parked (it names the project the lead was ATTRIBUTED to),
 * and it runs in onMount so a client-side navigation here still fires.
 *
 * Nothing parked means nothing to send and no script loaded — the case for
 * every lead whose project has no pixel.
 */
export default function MetaPixelLead() {
  onMount(() => {
    const pending = takeStashedMetaLead();
    if (pending) fireMetaLead(pending.leadId, pending.pixel);
  });

  return null;
}

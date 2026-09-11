import { onMount } from "solid-js";
import { fireConversion, takeStashedConversion } from "~/lib/adsConversion";

/**
 * Fires the Google Ads conversion event for the enquiry that led here.
 *
 * Takes the conversion parked by the form at submit time (see stashConversion)
 * rather than deriving it from the URL or refetching the project: the lead
 * response is the authoritative source, because it names the project the lead
 * was actually ATTRIBUTED to, which is not always the project whose page the
 * visitor was on.
 *
 * onMount, not a <script> tag: a script injected after hydration does not
 * execute reliably, so a client-side navigation into this page — the normal
 * path after a form submit — would drop the conversion.
 *
 * Nothing parked means nothing to send. That is the ordinary case for anyone
 * who reaches /thank-you without submitting a form, and for every lead whose
 * project has no conversion label configured.
 */
export default function AdsConversion() {
  onMount(() => {
    const pending = takeStashedConversion();
    if (pending) fireConversion(pending.leadId, pending.conversion);
  });

  return null;
}

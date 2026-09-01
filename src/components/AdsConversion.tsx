import { createEffect, onCleanup } from "solid-js";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const AW_ID = "AW-16454201362";
/** Vite inlines this at build time — see src/global.d.ts. */
const LABEL = import.meta.env.VITE_GADS_CONVERSION_LABEL;
const SEND_TO = `${AW_ID}/${LABEL}`;

// gtag.js is loaded async. Its inline snippet defines window.gtag synchronously
// in <head>, so in practice the first attempt succeeds — the retry only covers
// the case where that snippet has not run yet.
const RETRY_MS = 250;
const MAX_ATTEMPTS = 20;

/**
 * Fires the Google Ads *conversion event* for a completed enquiry.
 *
 * Distinct from GoogleAdsTag, which loads the library and registers the
 * account (`config`). A `config` alone reports a page view, never a conversion
 * — Google Ads counts nothing until an `event`/`conversion` with `send_to`
 * arrives, which is what this sends.
 *
 * Runs from an effect rather than a <script> tag: a script injected after
 * hydration does not execute reliably, so a client-side navigation into the
 * page — the normal path after a form submit — would drop the conversion.
 *
 * `transactionId` is the lead id. Google Ads dedupes on it server-side, and the
 * sessionStorage guard below stops a refresh or a back-button return from even
 * sending the duplicate. Without one, every load of the page counts again.
 */
export default function AdsConversion(props: { transactionId?: string }) {
  let fired = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  // createEffect over onMount so a transactionId that resolves a tick late
  // (a search param on a client-side navigation) is still attached.
  createEffect(() => {
    const txn = props.transactionId;
    if (fired || !LABEL) return;
    // A re-run (transactionId resolving a tick late) abandons the previous
    // retry chain rather than racing a second one alongside it.
    if (timer) clearTimeout(timer);

    const key = txn ? `gads_conv_${txn}` : null;
    if (key) {
      try {
        if (sessionStorage.getItem(key)) return;
      } catch {
        // Private mode / storage blocked — fall through and send anyway.
        // A duplicate conversion beats a missing one; Google Ads still dedupes
        // on transaction_id.
      }
    }

    let attempts = 0;
    const send = () => {
      timer = undefined;
      if (fired) return;
      if (typeof window.gtag === "function") {
        fired = true;
        if (key) {
          try {
            sessionStorage.setItem(key, "1");
          } catch {}
        }
        window.gtag("event", "conversion", {
          send_to: SEND_TO,
          ...(txn ? { transaction_id: txn } : {}),
        });
        return;
      }
      if (attempts++ < MAX_ATTEMPTS) timer = setTimeout(send, RETRY_MS);
    };
    send();
  });

  // Navigating away mid-retry must not fire a conversion for a page the
  // visitor has already left.
  onCleanup(() => {
    if (timer) clearTimeout(timer);
  });

  return null;
}

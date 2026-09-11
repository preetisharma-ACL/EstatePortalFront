import { createUniqueId, onMount } from "solid-js";
import { useHead } from "@solidjs/meta";
import { ensureAdsAccount } from "~/lib/adsConversion";

/**
 * Google Ads (gtag.js) base tag for a single page.
 *
 * NOTE this is per page, not site-wide: entry-server.tsx carries only the GA4
 * tag. Any page that fires a conversion needs the Ads account registered, which
 * is why fireConversion() calls ensureAdsAccount() itself rather than assuming
 * one of these is present.
 *
 * The loader goes in <head> through useHead, so a visitor landing straight on
 * the page from an ad gets it in the server-rendered HTML; on a client-side
 * navigation into the page it is appended instead. The `config` call is left to
 * ensureAdsAccount — it pushes onto dataLayer, which works whether or not
 * gtag.js has finished loading, and is deduped against every other caller so
 * the account cannot be registered twice.
 */
export default function GoogleAdsTag(props: { id: string }) {
  useHead({
    tag: "script",
    props: { async: true, src: `https://www.googletagmanager.com/gtag/js?id=${props.id}` },
    setting: { close: true },
    id: createUniqueId(),
  });

  onMount(() => ensureAdsAccount(props.id, { scriptAlreadyPresent: true }));

  return null;
}

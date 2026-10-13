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
 * The loader goes in <head> through useHead, and the inline `gtag('config')`
 * snippet is rendered in the server HTML too — Google Ads' "check installation"
 * and Tag Assistant look for the literal snippet in the page source, and a
 * config pushed only after hydration was not detected. The snippet flags the
 * account on window.__adsConfigured so ensureAdsAccount does not config it a
 * second time.
 *
 * On a client-side navigation into the page the inline <script> is inserted but
 * never executed, so the flag is absent and ensureAdsAccount (onMount) does the
 * config instead — exactly once either way.
 */
export default function GoogleAdsTag(props: { id: string }) {
  useHead({
    tag: "script",
    props: { async: true, src: `https://www.googletagmanager.com/gtag/js?id=${props.id}` },
    setting: { close: true },
    id: createUniqueId(),
  });

  onMount(() => ensureAdsAccount(props.id, { scriptAlreadyPresent: true }));

  return (
    <script
      innerHTML={`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', '${props.id}');
(window.__adsConfigured = window.__adsConfigured || {})['${props.id}'] = true;`}
    />
  );
}

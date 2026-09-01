import { createUniqueId, onMount } from "solid-js";
import { useHead } from "@solidjs/meta";

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}

/**
 * Google Ads (gtag.js) tag for a single page.
 *
 * The loader goes in <head> through useHead, so a visitor landing straight on
 * the page from an ad gets it in the server-rendered HTML; on a client-side
 * navigation into the page it is appended instead. The `config` call runs in
 * onMount rather than as an inline <script> because an inline script injected
 * after hydration would not execute reliably — pushing onto dataLayer has the
 * same effect and works whether or not gtag.js has finished loading.
 *
 * `gtag` itself is already defined by the site-wide GA4 snippet in
 * entry-server.tsx; the guard below keeps this component standalone in case
 * that ever changes.
 */
export default function GoogleAdsTag(props: { id: string }) {
  useHead({
    tag: "script",
    props: { async: true, src: `https://www.googletagmanager.com/gtag/js?id=${props.id}` },
    setting: { close: true },
    id: createUniqueId(),
  });

  onMount(() => {
    window.dataLayer = window.dataLayer || [];
    // gtag.js expects the raw `arguments` object, exactly as its own snippet pushes it.
    function gtag(..._args: unknown[]) {
      window.dataLayer.push(arguments);
    }
    gtag("js", new Date());
    gtag("config", props.id);
  });

  return null;
}

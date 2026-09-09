import { createUniqueId, onMount } from "solid-js";
import { useHead } from "@solidjs/meta";

declare global {
  interface Window {
    /** Set by gtm.js, one entry per loaded container. */
    google_tag_manager?: Record<string, unknown>;
  }
}

/**
 * Google Tag Manager container for a single page.
 *
 * The official GTM snippet does exactly two things: push the `gtm.js` event
 * onto dataLayer, then inject the container loader. This splits them the same
 * way GoogleAdsTag does — the loader goes into <head> through useHead so a
 * visitor landing straight on the page gets it in the server-rendered HTML,
 * and the dataLayer push runs in onMount because an inline <script> injected
 * after hydration (the client-side navigation case) would not execute
 * reliably. GTM processes the `gtm.js` event whenever it arrives, so the push
 * landing after the container has loaded still fires the All Pages triggers.
 *
 * The <noscript> iframe is returned as markup rather than pushed into <head>,
 * because that is the one part of the snippet that has to sit in the body.
 * Only the SSR pass matters for it — a visitor with JavaScript off never
 * client-side navigates.
 */
export default function GoogleTagManager(props: { id: string }) {
  // A visitor going from a project page to its /thank-you page mounts this
  // twice for the same container: @solidjs/meta drops the first <script> on
  // unmount, so re-adding it would re-execute gtm.js and can leave two live
  // container instances, each firing the push below. Loading it once and
  // pushing per page is what an SPA wants anyway — the push is the page view.
  const alreadyLoaded =
    typeof window !== "undefined" && Boolean(window.google_tag_manager?.[props.id]);

  if (!alreadyLoaded) {
    useHead({
      tag: "script",
      props: { async: true, src: `https://www.googletagmanager.com/gtm.js?id=${props.id}` },
      setting: { close: true },
      id: createUniqueId(),
    });
  }

  onMount(() => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
  });

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${props.id}`}
        height="0"
        width="0"
        style="display:none;visibility:hidden"
      />
    </noscript>
  );
}

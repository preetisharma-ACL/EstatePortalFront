import { onMount } from "solid-js";
import { trackMetaPageView } from "~/lib/metaPixel";

/**
 * Initialises a project's Meta pixel and sends it this page's PageView.
 *
 * Render it only when the project HAS a pixel — the component's mere absence is
 * what keeps fbevents.js off every other page. Client-side only (onMount): no
 * Facebook script is in the server HTML of any page, and on a client-side
 * navigation an inline snippet would be inserted but never executed anyway.
 *
 * Mount it once per page view (keyed on the project), since each mount sends
 * one PageView to this pixel alone.
 */
export default function MetaPixel(props: { id: string }) {
  onMount(() => trackMetaPageView(props.id));
  return null;
}

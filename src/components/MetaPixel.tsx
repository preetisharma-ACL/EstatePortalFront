import { onMount } from "solid-js";
import { trackMetaPageView } from "~/lib/metaPixel";

/**
 * Meta Pixel base code for a single page. Per page, not site-wide — see
 * metaPixelFor in ~/lib/metaPixel for which pages carry which pixel.
 *
 * The snippet is rendered literally into the server HTML, like <GoogleAdsTag>,
 * so Meta's installation checks find it in the page source. It flags the URL it
 * tracked on window.__metaPixelPageView, and onMount sends the PageView only
 * when that flag is absent — i.e. on a client-side navigation, where the inline
 * <script> is inserted but never executed. Exactly one PageView either way.
 */
export default function MetaPixel(props: { id: string }) {
  onMount(() => trackMetaPageView(props.id));

  return (
    <>
      <script
        innerHTML={`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
if(!(window.__metaPixelInit||{})['${props.id}']){
fbq('init', '${props.id}');
(window.__metaPixelInit=window.__metaPixelInit||{})['${props.id}']=true;}
fbq('track', 'PageView');
(window.__metaPixelPageView=window.__metaPixelPageView||{})['${props.id}']=location.href;`}
      />
      <noscript
        innerHTML={`<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${props.id}&ev=PageView&noscript=1" />`}
      />
    </>
  );
}

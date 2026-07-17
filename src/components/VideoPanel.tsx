import { Show, createMemo, createSignal } from "solid-js";

type Embed =
  | { type: "youtube"; id: string; embed: string }
  | { type: "vimeo"; id: string; embed: string }
  | { type: "file" };

/** Work out how to play the URL: YouTube/Vimeo embed, else a direct file. */
function parseEmbed(url: string): Embed {
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([\w-]{11})/,
  );
  // No autoplay: the player mounts on page load, so it must sit idle until the
  // visitor presses play.
  if (yt) return { type: "youtube", id: yt[1], embed: `https://www.youtube.com/embed/${yt[1]}?rel=0` };
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return { type: "vimeo", id: vm[1], embed: `https://player.vimeo.com/video/${vm[1]}` };
  return { type: "file" };
}

/**
 * Media panel that plays a promo video *in place*. The real player is mounted
 * straight away — its own chrome (YouTube/Vimeo controls, or native controls for
 * a direct file), not a poster stand-in — so what you see is the video itself.
 */
export default function VideoPanel(props: { url: string; poster?: string; name: string }) {
  const [failed, setFailed] = createSignal(false);
  const info = createMemo(() => parseEmbed(props.url));

  return (
    <figure class="relative overflow-hidden rounded-[18px] border border-line bg-navy shadow-sm lg:sticky lg:top-24">
      <div class="relative aspect-[4/3] w-full overflow-hidden bg-black">
        <Show
          when={info().type !== "file"}
          fallback={
            <Show
              when={!failed()}
              fallback={
                <div class="absolute inset-0 grid place-items-center bg-navy p-6 text-center">
                  <div>
                    <p class="text-sm text-white/80">This video can't be played here.</p>
                    <a
                      href={props.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="mt-2 inline-block text-sm font-semibold text-gold-soft hover:underline"
                    >
                      Open video ↗
                    </a>
                  </div>
                </div>
              }
            >
              <video
                src={props.url}
                poster={props.poster}
                class="absolute inset-0 h-full w-full bg-black object-contain"
                controls
                playsinline
                preload="metadata"
                onError={() => setFailed(true)}
              />
            </Show>
          }
        >
          <iframe
            src={(info() as { embed: string }).embed}
            class="absolute inset-0 h-full w-full"
            title={`${props.name} video`}
            frameborder="0"
            loading="lazy"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowfullscreen
          />
        </Show>
      </div>
    </figure>
  );
}

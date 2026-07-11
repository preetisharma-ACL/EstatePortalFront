import { Show, createEffect, createMemo, createSignal } from "solid-js";

type Embed =
  | { type: "youtube"; id: string; embed: string }
  | { type: "vimeo"; id: string; embed: string }
  | { type: "file" };

/** Work out how to play the URL: YouTube/Vimeo embed, else a direct file. */
function parseEmbed(url: string): Embed {
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([\w-]{11})/,
  );
  if (yt) return { type: "youtube", id: yt[1], embed: `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0` };
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return { type: "vimeo", id: vm[1], embed: `https://player.vimeo.com/video/${vm[1]}?autoplay=1` };
  return { type: "file" };
}

/**
 * Media panel that plays a promo video *in place* — a poster with a play button
 * that, on click, swaps to an inline player (embedded iframe for YouTube/Vimeo,
 * a native <video> for direct files). No new tab, and no frontend placeholder
 * image: the poster is a real backend image, else the video's own thumbnail/frame.
 */
export default function VideoPanel(props: { url: string; poster?: string; name: string }) {
  const [playing, setPlaying] = createSignal(false);
  const [failed, setFailed] = createSignal(false);
  const info = createMemo(() => parseEmbed(props.url));
  // Poster: a real backend image if given, else YouTube's own thumbnail.
  const poster = () =>
    props.poster ?? (info().type === "youtube" ? `https://img.youtube.com/vi/${(info() as { id: string }).id}/hqdefault.jpg` : undefined);

  // For direct files, start playback from the user's click gesture so the
  // browser doesn't silently block autoplay (which leaves a black 0:00 frame).
  let videoRef: HTMLVideoElement | undefined;
  createEffect(() => {
    if (playing() && info().type === "file" && videoRef) {
      videoRef.play().catch(() => {
        /* Autoplay refused — native controls remain for manual play. */
      });
    }
  });

  return (
    <figure class="group relative overflow-hidden rounded-[18px] border border-line bg-navy shadow-sm lg:sticky lg:top-24">
      <div class="relative aspect-[4/3] w-full overflow-hidden bg-navy">
        <Show
          when={playing()}
          fallback={
            <button
              type="button"
              onClick={() => setPlaying(true)}
              class="absolute inset-0 grid place-items-center"
              aria-label={`Play ${props.name} video`}
            >
              <Show when={poster()}>
                <img
                  src={poster()!}
                  alt={`${props.name} video`}
                  class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </Show>
              <span class="img-scrim absolute inset-0" aria-hidden="true" />
              <span class="relative grid h-16 w-16 place-items-center rounded-full bg-white/90 text-navy shadow-lg transition-transform duration-200 group-hover:scale-110">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="ml-1"><path d="M8 5v14l11-7z" /></svg>
              </span>
              <figcaption class="absolute bottom-3 right-4 z-10 text-[11px] font-medium uppercase tracking-wider text-white/70">
                {props.name}
              </figcaption>
            </button>
          }
        >
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
                  ref={videoRef}
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
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowfullscreen
            />
          </Show>
        </Show>
      </div>
    </figure>
  );
}

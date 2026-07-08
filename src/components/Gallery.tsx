import { For, Show, createSignal, createMemo } from "solid-js";
import type { ProjectMedia } from "~/lib/types";

/** Project gallery: a large active image with a thumbnail strip. */
export default function Gallery(props: { media: ProjectMedia[]; name: string }) {
  const images = createMemo(() =>
    props.media
      .filter((m) => m.media_type !== "video" && m.image)
      .sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.order - b.order),
  );
  const [active, setActive] = createSignal(0);
  const current = () => images()[active()];

  return (
    <Show
      when={images().length}
      fallback={
        <div class="grid aspect-[16/9] w-full place-items-center rounded-[12px] border border-line bg-navy/5 text-navy/30">
          <span class="font-display text-2xl">{props.name}</span>
        </div>
      }
    >
      <div>
        <div class="img-scrim relative aspect-[16/9] w-full overflow-hidden rounded-[12px] border border-line bg-navy/5">
          <img
            src={current()?.image!}
            alt={current()?.caption || `${props.name} — image ${active() + 1}`}
            class="h-full w-full object-cover"
          />
          <Show when={current()?.caption}>
            <p class="absolute bottom-3 left-4 z-10 text-sm font-medium text-white/90">
              {current()!.caption}
            </p>
          </Show>
        </div>

        <Show when={images().length > 1}>
          <div class="mt-3 flex gap-2 overflow-x-auto pb-1">
            <For each={images()}>
              {(m, i) => (
                <button
                  type="button"
                  onClick={() => setActive(i())}
                  aria-label={`View image ${i() + 1}`}
                  aria-current={i() === active()}
                  class={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                    i() === active() ? "border-gold" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={m.image!} alt="" class="h-full w-full object-cover" />
                </button>
              )}
            </For>
          </div>
        </Show>
      </div>
    </Show>
  );
}

import { useNavigate } from "@solidjs/router";
import {
  createSignal, createMemo, For, Show, onCleanup, batch,
} from "solid-js";
import { autocomplete } from "~/lib/api";
import type { AutocompleteItem, AutocompleteType, ProjectType } from "~/lib/types";

const GROUP_ORDER: AutocompleteType[] = ["city", "locality", "project", "developer"];
const GROUP_LABEL: Record<AutocompleteType, string> = {
  city: "Cities",
  locality: "Localities",
  project: "Projects",
  developer: "Developers",
};

export default function SearchBar(props: {
  variant?: "hero" | "compact";
  showTypeToggle?: boolean;
  placeholder?: string;
}) {
  const navigate = useNavigate();
  const hero = props.variant !== "compact";
  const [q, setQ] = createSignal("");
  const [items, setItems] = createSignal<AutocompleteItem[]>([]);
  const [open, setOpen] = createSignal(false);
  const [loading, setLoading] = createSignal(false);
  const [ptype, setPtype] = createSignal<ProjectType | "">("");

  let timer: ReturnType<typeof setTimeout> | undefined;
  let ctrl: AbortController | undefined;
  onCleanup(() => {
    if (timer) clearTimeout(timer);
    ctrl?.abort();
  });

  const runSearch = (value: string) => {
    if (timer) clearTimeout(timer);
    if (value.trim().length < 2) {
      batch(() => {
        setItems([]);
        setOpen(false);
        setLoading(false);
      });
      return;
    }
    setLoading(true);
    timer = setTimeout(async () => {
      ctrl?.abort();
      ctrl = new AbortController();
      try {
        const res = await autocomplete(value.trim());
        batch(() => {
          setItems(res.results);
          setOpen(true);
          setLoading(false);
        });
      } catch {
        batch(() => {
          setItems([]);
          setLoading(false);
        });
      }
    }, 220);
  };

  const grouped = createMemo(() => {
    const by = new Map<AutocompleteType, AutocompleteItem[]>();
    for (const it of items()) {
      if (!by.has(it.type)) by.set(it.type, []);
      by.get(it.type)!.push(it);
    }
    return GROUP_ORDER.filter((g) => by.has(g)).map((g) => ({
      type: g,
      label: GROUP_LABEL[g],
      items: by.get(g)!,
    }));
  });

  const submitFreeText = (e: Event) => {
    e.preventDefault();
    const term = q().trim();
    const params = new URLSearchParams();
    if (term) params.set("search", term);
    if (ptype()) params.set("project_type", ptype());
    navigate(`/search${params.toString() ? `?${params}` : ""}`);
    setOpen(false);
  };

  return (
    <div class={hero ? "w-full" : "relative w-full"}>
      <Show when={props.showTypeToggle}>
        {/* On the navy hero the track and inactive labels must be light-on-dark;
            navy-on-navy fails WCAG AA. Centered under the hero, left on compact. */}
        <div class={`mb-3 flex ${hero ? "justify-center" : ""}`}>
          <div
            class={`inline-flex rounded-full p-1 text-sm font-medium ${
              hero ? "bg-white/10" : "bg-navy/5"
            }`}
          >
            <ToggleBtn hero={hero} active={ptype() === ""} onClick={() => setPtype("")}>All</ToggleBtn>
            <ToggleBtn hero={hero} active={ptype() === "residential"} onClick={() => setPtype("residential")}>
              Residential
            </ToggleBtn>
            <ToggleBtn hero={hero} active={ptype() === "commercial"} onClick={() => setPtype("commercial")}>
              Commercial
            </ToggleBtn>
          </div>
        </div>
      </Show>

      <form onSubmit={submitFreeText} class="relative" role="search">
        <div
          class={`flex items-stretch gap-2 ${
            hero
              ? "rounded-xl bg-white p-2 shadow-[0_24px_60px_-30px_rgba(14,27,51,.6)]"
              : "rounded-[8px] border border-line bg-white p-1.5"
          }`}
        >
          <div class="relative flex flex-1 items-center">
            <svg class="pointer-events-none absolute left-3 text-slate" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" stroke-linecap="round" />
            </svg>
            <input
              type="search"
              value={q()}
              autocomplete="off"
              placeholder={props.placeholder ?? "Search city, locality, project or developer"}
              class="w-full rounded-lg bg-transparent py-2.5 pl-10 pr-3 text-navy placeholder:text-slate/70 focus:outline-none"
              aria-label="Search projects"
              aria-expanded={open()}
              role="combobox"
              aria-controls="ac-listbox"
              onInput={(e) => {
                setQ(e.currentTarget.value);
                runSearch(e.currentTarget.value);
              }}
              onFocus={() => items().length && setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
            />
          </div>
          <button
            type="submit"
            class="shrink-0 rounded-[8px] bg-gold px-5 py-2.5 text-sm font-semibold text-navy transition-transform hover:-translate-y-0.5"
          >
            Search
          </button>
        </div>

        <Show when={open() && (grouped().length > 0 || loading())}>
          <div
            id="ac-listbox"
            role="listbox"
            class="absolute left-0 right-0 top-[calc(100%+8px)] z-40 max-h-96 overflow-auto rounded-xl border border-line bg-white p-2 text-left shadow-xl"
          >
            <Show when={!loading()} fallback={<p class="px-3 py-2 text-sm text-slate">Searching…</p>}>
              <Show
                when={grouped().length > 0}
                fallback={<p class="px-3 py-2 text-sm text-slate">No matches. Press Enter to search all.</p>}
              >
                <For each={grouped()}>
                  {(group) => (
                    <div class="mb-1 last:mb-0">
                      <p class="eyebrow px-3 pb-1 pt-2 text-slate/70">{group.label}</p>
                      <For each={group.items}>
                        {(it) => (
                          <button
                            type="button"
                            role="option"
                            class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-navy hover:bg-paper"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              navigate(it.url);
                              setOpen(false);
                            }}
                          >
                            <TypeDot type={it.type} />
                            <span class="font-medium">{it.label}</span>
                          </button>
                        )}
                      </For>
                    </div>
                  )}
                </For>
              </Show>
            </Show>
          </div>
        </Show>
      </form>
    </div>
  );
}

function ToggleBtn(props: {
  active: boolean;
  hero?: boolean;
  onClick: () => void;
  children: any;
}) {
  // Inactive label: off-white on navy (~10:1), navy on paper (~5.4:1). Active is unchanged.
  const inactive = () =>
    props.hero ? "text-white/85 hover:text-white" : "text-navy/70 hover:text-navy";
  return (
    <button
      type="button"
      aria-pressed={props.active}
      onClick={props.onClick}
      class={`rounded-full px-4 py-1.5 transition-colors ${
        props.active ? "bg-navy text-white" : inactive()
      }`}
    >
      {props.children}
    </button>
  );
}

function TypeDot(props: { type: AutocompleteType }) {
  const color =
    props.type === "developer" ? "bg-gold"
    : props.type === "project" ? "bg-navy"
    : props.type === "city" ? "bg-green"
    : "bg-slate";
  return <span class={`inline-block h-2 w-2 rounded-full ${color}`} aria-hidden="true" />;
}

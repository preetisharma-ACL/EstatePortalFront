import { A, useLocation } from "@solidjs/router";
import { For, Show, createEffect, createSignal, onCleanup } from "solid-js";
import { openLeadModal } from "~/lib/leadModal";
import { townshipList } from "~/lib/townships";

// Residential and Commercial point at the indexable hub routes, not
// /search?project_type=… — /search is noindex, so query-string destinations
// would leave two main nav entries unindexable.
const NAV = [
  { href: "/", label: "Home" },
  { href: "/residential", label: "Residential" },
  { href: "/commercial", label: "Commercial" },
  { href: "/developers", label: "Developers" },
  { href: "/search", label: "All Properties" },
];

// Township pages are content-registry driven, so the nav lists whatever is
// published — a new entry in src/lib/townships.ts appears here with no edit.
const TOWNSHIPS = townshipList();

export default function Header() {
  const location = useLocation();
  const [open, setOpen] = createSignal(false);
  const [townshipsOpen, setTownshipsOpen] = createSignal(false);
  const isActive = (href: string) =>
    location.pathname === href.split("?")[0] &&
    (href.includes("?")
      ? location.search.includes(href.split("?")[1])
      : location.pathname === href);
  const onTownshipPage = () => location.pathname.startsWith("/township/");

  // Close both menus on navigation — the sticky header survives route changes,
  // so an open panel would otherwise persist onto the new page.
  createEffect(() => {
    location.pathname;
    setTownshipsOpen(false);
    setOpen(false);
  });

  // Dismiss the desktop dropdown on outside click / Escape.
  createEffect(() => {
    if (!townshipsOpen()) return;
    const onDown = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-townships-menu]")) setTownshipsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTownshipsOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    onCleanup(() => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    });
  });

  return (
    <header class="sticky top-0 z-50 border-b border-line bg-card/80 backdrop-blur-md">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <A href="/" class="flex items-center" aria-label="Aajneeti home">
          <img src="/logo/acl-logo.png" alt="Aajneeti" class="h-14 w-auto shrink-0" />
        </A>

        <nav class="hidden items-center gap-7 md:flex" aria-label="Primary">
          {NAV.map((item) => (
            <A
              href={item.href}
              class="nav-link text-sm font-medium text-navy/85 transition-colors hover:text-navy"
              {...(isActive(item.href) ? { "data-active": "" } : {})}
            >
              {item.label}
            </A>
          ))}

          {/* Townships — a dropdown rather than a nav link, since there is no
              township index page: the menu itself is the index. */}
          <Show when={TOWNSHIPS.length}>
            <div class="relative" data-townships-menu>
              <button
                type="button"
                class="nav-link flex items-center gap-1.5 text-sm font-medium text-navy/85 transition-colors hover:text-navy"
                aria-expanded={townshipsOpen()}
                aria-haspopup="true"
                onClick={() => setTownshipsOpen((v) => !v)}
                {...(onTownshipPage() ? { "data-active": "" } : {})}
              >
                Townships
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="shrink-0 transition-transform duration-200"
                  classList={{ "rotate-180": townshipsOpen() }}
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              <Show when={townshipsOpen()}>
                <div class="absolute left-1/2 top-full z-50 mt-3 w-64 -translate-x-1/2 overflow-hidden rounded-[12px] border border-line bg-card shadow-[0_24px_50px_-24px_rgba(14,27,51,0.45)]">
                  <p class="border-b border-line bg-paper px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate">
                    Integrated townships
                  </p>
                  <ul>
                    <For each={TOWNSHIPS}>
                      {(t) => (
                        <li>
                          <A
                            href={`/township/${t.slug}`}
                            class="block border-b border-line px-4 py-3 transition-colors last:border-b-0 hover:bg-paper"
                            onClick={() => setTownshipsOpen(false)}
                          >
                            <span class="block text-sm font-semibold text-navy">{t.name}</span>
                            <span class="mt-0.5 block text-xs text-slate">
                              {t.tagline}, {t.cityName}
                            </span>
                          </A>
                        </li>
                      )}
                    </For>
                  </ul>
                </div>
              </Show>
            </div>
          </Show>
        </nav>

        <div class="hidden items-center gap-3 md:flex">
          <A
            href="/search"
            class="rounded-[8px] border border-navy/25 px-4 py-2 text-sm font-semibold text-navy transition-colors hover:border-navy hover:bg-navy hover:text-white"
          >
            Explore
          </A>
          <button
            type="button"
            onClick={() => openLeadModal()}
            class="rounded-[8px] bg-gold px-4 py-2 text-sm font-semibold text-navy shadow-sm transition-transform hover:-translate-y-0.5"
          >
            Talk to an advisor
          </button>
        </div>

        <button
          type="button"
          class="inline-flex items-center justify-center rounded-md p-2 text-navy md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open()}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <Show when={open()} fallback={<><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>}>
              <line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" />
            </Show>
          </svg>
        </button>
      </div>

      <Show when={open()}>
        <nav class="border-t border-line bg-card px-4 py-3 md:hidden" aria-label="Mobile">
          <ul class="flex flex-col gap-1">
            {NAV.map((item) => (
              <li>
                <A
                  href={item.href}
                  class="block rounded-md px-2 py-2 text-sm font-medium text-navy hover:bg-paper"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </A>
              </li>
            ))}
            {/* Townships listed inline rather than behind an accordion — three
                entries don't justify an extra tap. */}
            <Show when={TOWNSHIPS.length}>
              <li class="mt-2 border-t border-line pt-2">
                <p class="px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate">
                  Townships
                </p>
                <ul>
                  <For each={TOWNSHIPS}>
                    {(t) => (
                      <li>
                        <A
                          href={`/township/${t.slug}`}
                          class="block rounded-md px-2 py-2 text-sm font-medium text-navy hover:bg-paper"
                          onClick={() => setOpen(false)}
                        >
                          {t.name}
                          <span class="ml-1.5 text-xs font-normal text-slate">{t.cityName}</span>
                        </A>
                      </li>
                    )}
                  </For>
                </ul>
              </li>
            </Show>

            <li class="mt-2">
              <button
                type="button"
                class="block w-full rounded-[8px] bg-gold px-4 py-2 text-center text-sm font-semibold text-navy"
                onClick={() => { setOpen(false); openLeadModal(); }}
              >
                Talk to an advisor
              </button>
            </li>
          </ul>
        </nav>
      </Show>
    </header>
  );
}

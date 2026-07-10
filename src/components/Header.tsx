import { A, useLocation } from "@solidjs/router";
import { Show, createSignal } from "solid-js";

const NAV = [
  { href: "/search", label: "Search" },
  { href: "/search?project_type=residential", label: "Residential" },
  { href: "/search?project_type=commercial", label: "Commercial" },
  { href: "/developers", label: "Developers" },
];

export default function Header() {
  const location = useLocation();
  const [open, setOpen] = createSignal(false);
  const isActive = (href: string) =>
    location.pathname === href.split("?")[0] &&
    (href.includes("?")
      ? location.search.includes(href.split("?")[1])
      : location.pathname === href);

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
        </nav>

        <div class="hidden items-center gap-3 md:flex">
          <A
            href="/search"
            class="rounded-[8px] border border-navy/25 px-4 py-2 text-sm font-semibold text-navy transition-colors hover:border-navy hover:bg-navy hover:text-white"
          >
            Explore
          </A>
          <A
            href="/#enquire"
            class="rounded-[8px] bg-gold px-4 py-2 text-sm font-semibold text-navy shadow-sm transition-transform hover:-translate-y-0.5"
          >
            Talk to an advisor
          </A>
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
            <li class="mt-2">
              <A
                href="/#enquire"
                class="block rounded-[8px] bg-gold px-4 py-2 text-center text-sm font-semibold text-navy"
                onClick={() => setOpen(false)}
              >
                Talk to an advisor
              </A>
            </li>
          </ul>
        </nav>
      </Show>
    </header>
  );
}

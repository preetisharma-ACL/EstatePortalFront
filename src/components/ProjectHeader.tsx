import { A } from "@solidjs/router";
import { For, Show, createSignal, onCleanup, onMount } from "solid-js";
import { phoneOrUndefined, telHref } from "~/lib/contactPhone";
import { openLeadModal } from "~/lib/leadModal";

/**
 * One in-page destination in the project nav. `id` is the element id of the
 * section it scrolls to — the route owns those, and only passes the entries
 * whose sections it actually rendered, so a nav link here is never dead.
 */
export type ProjectSection = { id: string; label: string };

/**
 * Header for a project detail page.
 *
 * Replaces the site-wide <Header> on /project/* (see app.tsx). A visitor who
 * lands here from an ad is reading one long page, not browsing the catalogue —
 * so the nav is the page's own sections rather than Residential / Commercial /
 * Developers, and the CTA goes to the enquiry form instead of the lead modal.
 *
 * It renders inside the route rather than the root layout because the section
 * list depends on the project payload: sections are conditional on the backend
 * having content for them, and a nav link to a section that never rendered
 * would scroll nowhere.
 */
export default function ProjectHeader(props: {
  /** Shown beside the logo on wide screens, so the bar still says where you are. */
  projectName?: string;
  sections?: ProjectSection[];
  /** Raw `contact_phone` from the payload — blank means no call button. */
  phone?: string | null;
}) {
  const sections = () => props.sections ?? [];
  const callPhone = () => phoneOrUndefined(props.phone);
  const [active, setActive] = createSignal("");

  // Highlight the section currently under the header. The bottom margin keeps
  // a section from counting as "current" while it is only just entering from
  // the bottom of the viewport, which otherwise makes the highlight run ahead
  // of what the visitor is reading.
  onMount(() => {
    const ids = sections().map((s) => s.id);
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!els.length || typeof IntersectionObserver === "undefined") return;

    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        }
        // Document order, so the topmost visible section wins when two overlap.
        setActive(ids.find((id) => visible.has(id)) ?? "");
      },
      { rootMargin: "-120px 0px -55% 0px" },
    );
    els.forEach((el) => io.observe(el));
    onCleanup(() => io.disconnect());
  });

  return (
    <header class="sticky top-0 z-50 border-b border-line bg-card/90 backdrop-blur-md">
      <div class="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <A href="/" class="flex shrink-0 items-center" aria-label="Aajneeti home">
          <img src="/logo/acl-logo.png" alt="Aajneeti" class="h-12 w-auto shrink-0 sm:h-14" />
        </A>

        <Show when={props.projectName}>
          <span class="hidden min-w-0 border-l border-line pl-4 md:block lg:hidden xl:block">
            <span class="block truncate font-display text-base font-semibold text-navy">
              {props.projectName}
            </span>
          </span>
        </Show>

        {/* Above lg the anchors sit inline; below it they move to the scroll
            strip underneath, which suits a long anchor list better than a
            collapsed menu — every destination stays one tap away. */}
        <nav class="ml-auto hidden items-center gap-5 lg:flex" aria-label="Sections">
          <For each={sections()}>
            {(s) => (
              <a
                href={`#${s.id}`}
                class="nav-link whitespace-nowrap text-[13px] font-medium text-navy/85 transition-colors hover:text-navy"
                {...(active() === s.id ? { "data-active": "" } : {})}
              >
                {s.label}
              </a>
            )}
          </For>
        </nav>

        <div class="ml-auto flex shrink-0 items-center gap-2 lg:ml-5">
          <Show when={callPhone()}>
            {(phone) => (
              <a
                href={telHref(phone())}
                class="inline-flex items-center gap-2 rounded-[8px] border border-navy px-3 py-2 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
              >
                <PhoneIcon />
                <span class="hidden xl:inline">{phone()}</span>
                <span class="xl:hidden">Call</span>
              </a>
            )}
          </Show>
          {/* The enquiry band only exists once a project has resolved — on the
              loading and not-found states this would scroll nowhere, so the
              modal stands in. */}
          <Show
            when={props.projectName}
            fallback={
              <button
                type="button"
                onClick={() => openLeadModal()}
                class="rounded-[8px] bg-gold px-4 py-2 text-sm font-semibold text-navy shadow-sm transition-transform hover:-translate-y-0.5"
              >
                Enquire
              </button>
            }
          >
            <a
              href="#enquire"
              class="rounded-[8px] bg-gold px-4 py-2 text-sm font-semibold text-navy shadow-sm transition-transform hover:-translate-y-0.5"
            >
              Enquire
            </a>
          </Show>
        </div>
      </div>

      <Show when={sections().length}>
        <nav
          class="border-t border-line bg-card/90 lg:hidden"
          aria-label="Sections"
        >
          {/* Horizontally scrollable so eight anchors never wrap the bar into
              three rows on a phone. */}
          <ul class="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-3 py-1.5 sm:px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <For each={sections()}>
              {(s) => (
                <li>
                  <a
                    href={`#${s.id}`}
                    class="block whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium text-navy/80 transition-colors hover:bg-paper"
                    classList={{ "bg-navy text-white hover:bg-navy": active() === s.id }}
                  >
                    {s.label}
                  </a>
                </li>
              )}
            </For>
          </ul>
        </nav>
      </Show>
    </header>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" class="shrink-0" aria-hidden="true">
      <path d="M5 4h3l1.5 4-2 1.5a15 15 0 0 0 7 7l1.5-2L20 16v3c0 1.1-.9 2-2 2C10.3 21 3 13.7 3 6c0-1.1.9-2 2-2Z" />
    </svg>
  );
}

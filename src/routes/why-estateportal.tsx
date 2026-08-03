import { A } from "@solidjs/router";
import { Title, Meta, Link } from "@solidjs/meta";
import { For, Show, type JSX } from "solid-js";
import ReraSeal from "~/components/ReraSeal";
import LeadForm from "~/components/LeadForm";
import { COMPANY } from "~/lib/company";

/* Module-level data stays plain (no JSX) — JSX built at module scope would
   construct <A> outside the Router context and break SSR. */

const PILLARS = [
  {
    icon: "seal" as const,
    title: "Every project RERA-verified",
    body: "We publish the registration number, the phase it covers and the issuing authority for every listing — and point you at the official state portal to check it yourself. If a project cannot be verified, it does not go up.",
    link: { href: "/search", label: "Browse verified projects" },
  },
  {
    icon: "rupee" as const,
    title: "Pricing that comes from the developer",
    body: "Configuration-level pricing, carpet and built-up areas and price per sq. ft. sourced directly from developers — presented the same way for every project so you can actually compare. No hidden markup added by us, no mystery quotes.",
    link: { href: "/search?ordering=price_min", label: "Compare by price" },
  },
  {
    icon: "visit" as const,
    title: "Assisted site visits and documentation",
    body: "An advisor arranges the visit, gets you the brochure, floor plans and payment schedule, and sits with you through the developer's paperwork so you are reading the same documents they are.",
    link: { href: "/#enquire", label: "Book a site visit" },
  },
  {
    icon: "shield" as const,
    title: "Your details are not a commodity",
    body: "We ask for consent before anything else, use your number to help with the enquiry you made, and stop the moment you tell us to. We do not sell your data, and we never ask for payment through this site.",
    link: { href: "/privacy-policy", label: "Read the privacy policy" },
  },
];

const STEPS = [
  {
    title: "Search without giving up your number",
    body: "Filter by city, locality, budget, configuration, possession status and residential or commercial. Every filter lives in the URL, so a shortlist is a link you can send to your family or your CA.",
  },
  {
    title: "Read the full picture on one page",
    body: "Gallery, configurations with real carpet areas, floor plans, amenities, the developer's track record and the RERA registrations — all on the project page, not spread across five phone calls.",
  },
  {
    title: "Talk to an advisor when you are ready",
    body: "Tell us the budget, the configuration and whether it is for investment, end use or both. A verified advisor picks it up and shortlists what genuinely fits — including telling you when nothing does.",
  },
  {
    title: "Visit, verify, then decide",
    body: "We arrange the site visit and put the documentation in front of you. You verify the RERA registration on the state portal, take independent legal advice, and decide in your own time.",
  },
];

const AUDIENCES = [
  {
    label: "Investors",
    body: "Yield and appreciation first. Compare price per sq. ft. across micro-markets, filter the premium and 5 Cr+ collections, and read the developer's delivery record before the brochure.",
    href: "/search?purpose=investment",
    cta: "Investment picks",
  },
  {
    label: "NRIs",
    body: "Buying from another time zone means trusting what you read. Verifiable RERA numbers, developer-sourced pricing and a named advisor on call make that possible without a flight.",
    href: "/search",
    cta: "Start with a city",
  },
  {
    label: "End users",
    body: "Families buying a home to live in. Ready-to-move and new-launch collections, honest carpet areas, real floor plans and assisted visits so you know what you are walking into.",
    href: "/search?status=ready_to_move",
    cta: "Ready to move",
  },
  {
    label: "Commercial occupiers",
    body: "Offices, retail and grade-A commercial assets, with the same verification standard applied — because a commercial commitment is a longer one.",
    href: "/search?project_type=commercial",
    cta: "Commercial projects",
  },
];

const HONESTY = [
  "We are not the seller. Every project belongs to its developer — we list it, verify what we can, and introduce you.",
  "We take no payment from buyers. No booking amount, no token, no fee is ever collected through this site.",
  "Listing is not endorsement. A project appearing here means its registration checks out, not that we vouch for its returns.",
  "We do not give investment advice. Our collections are a way to browse, not a recommendation to buy.",
  "Details change. Prices, inventory and timelines move — always confirm the current position with the developer and the RERA portal before you commit.",
];

export default function WhyEstatePortalPage() {
  return (
    <>
      <Title>Why {COMPANY.brand} — verified property discovery across India</Title>
      <Meta
        name="description"
        content={`Why buyers and investors use ${COMPANY.brand}: RERA registrations published and verifiable, developer-sourced pricing, assisted site visits, and advisors who work to your requirement — not a call centre.`}
      />
      <Meta property="og:title" content={`Why ${COMPANY.brand}`} />
      <Meta property="og:type" content="website" />
      <Link rel="canonical" href="/why-estateportal" />

      {/* 1. HERO */}
      <section class="hero-gradient relative overflow-hidden text-white">
        <div class="blueprint pointer-events-none absolute inset-0" aria-hidden="true" />
        <div class="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <div class="max-w-3xl">
            <span class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5">
              <ReraSeal size="sm" />
              <span class="text-sm font-medium text-gold-soft">Verification is the product</span>
            </span>
            <h1 class="mt-6 font-display text-[38px] font-semibold leading-[1.05] sm:text-6xl">
              Why <span class="italic text-gold-soft">{COMPANY.brand}</span>
            </h1>
            <div class="gold-rule mt-6" />
            <p class="mt-6 text-base leading-relaxed text-white/75 sm:text-lg">
              Most property portals are built to capture your phone number. This one is
              built to answer your questions first — with registrations you can check,
              pricing that comes from the developer, and an advisor who only calls because
              you asked.
            </p>
            <div class="mt-8 flex flex-wrap gap-3">
              <A
                href="/search"
                class="rounded-[8px] bg-gold px-5 py-3 text-sm font-semibold text-navy transition-transform hover:-translate-y-0.5"
              >
                Explore projects
              </A>
              <A
                href="#enquire"
                class="rounded-[8px] border border-white/25 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-gold-soft hover:text-gold-soft"
              >
                Talk to an advisor
              </A>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE PROBLEM */}
      <section class="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <div class="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <p class="eyebrow">The problem</p>
            <h2 class="mt-3 font-display text-3xl font-semibold text-navy sm:text-4xl">
              Buying property in India is an{" "}
              <span class="italic text-gold">information problem</span>
            </h2>
            <div class="gold-rule mt-5" />
          </div>
          <div class="space-y-5 text-[15px] leading-relaxed text-slate">
            <p>
              The listing you found is six months stale. The price on the portal is not the
              price on the phone. The "premium" tag was bought, not earned. The RERA number
              is printed somewhere in the brochure but nobody expects you to check it. And
              the moment you show interest, four numbers you never gave consent to start
              calling.
            </p>
            <p>
              None of that is a technology problem — it is a discipline problem. We built{" "}
              {COMPANY.brand} around a small set of rules and then refused to break them:
              publish the registration, publish the developer's own pricing, ask before we
              call, and say plainly what we do not know.
            </p>
            <p class="font-semibold text-navy">
              The result is a portal that is slower to collect your number and considerably
              more useful once it does.
            </p>
          </div>
        </div>
      </section>

      {/* 3. PILLARS */}
      <section class="border-y border-line bg-[#f8f5f2] py-14 sm:py-20">
        <div class="mx-auto max-w-7xl px-4 sm:px-6">
          <div class="mx-auto max-w-2xl text-center">
            <p class="eyebrow">What we hold ourselves to</p>
            <h2 class="mt-3 font-display text-3xl font-semibold text-navy sm:text-4xl">
              Four commitments, <span class="italic text-gold">every listing</span>
            </h2>
            <div class="gold-rule mx-auto mt-5" />
          </div>

          <div class="mt-12 grid gap-5 md:grid-cols-2">
            <For each={PILLARS}>
              {(p) => (
                <article class="card-lift flex flex-col rounded-[14px] border border-line bg-card p-6 sm:p-8">
                  <div class="mb-5">
                    <Show when={p.icon === "seal"} fallback={<PillarIcon icon={p.icon} />}>
                      <ReraSeal size="md" />
                    </Show>
                  </div>
                  <h3 class="font-display text-xl font-semibold text-navy sm:text-2xl">
                    {p.title}
                  </h3>
                  <p class="mt-3 flex-1 text-[15px] leading-relaxed text-slate">{p.body}</p>
                  <A
                    href={p.link.href}
                    class="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:underline"
                  >
                    {p.link.label}
                    <span aria-hidden="true">→</span>
                  </A>
                </article>
              )}
            </For>
          </div>
        </div>
      </section>

      {/* 4. WHAT RERA-VERIFIED MEANS */}
      <section class="relative isolate overflow-hidden bg-navy py-16 text-white sm:py-20">
        <div
          class="pointer-events-none absolute inset-0 bg-fixed bg-cover bg-center"
          style="background-image:url('/banner/banner-3.jpg')"
          aria-hidden="true"
        />
        <div class="pointer-events-none absolute inset-0 bg-navy-deep/88" aria-hidden="true" />
        <div class="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div class="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
            <div>
              <p class="eyebrow text-gold-soft">The seal</p>
              <h2 class="mt-3 font-display text-3xl font-semibold sm:text-4xl">
                What our <span class="italic text-gold-soft">verified</span> badge actually
                means
              </h2>
              <div class="gold-rule mt-5" />
              <p class="mt-6 text-[15px] leading-relaxed text-white/75">
                The Real Estate (Regulation and Development) Act, 2016 requires most projects
                to be registered with a state authority before they can be advertised or
                sold. That registration is public — and it is the single most useful thing a
                buyer can check.
              </p>
              <p class="mt-4 text-[15px] leading-relaxed text-white/75">
                Plenty of portals mention RERA. Ours puts the number on the page in mono
                type, tells you which phase it covers and which authority issued it, and
                sends you to the official portal to confirm it. We would rather you trusted
                the regulator than trusted us.
              </p>
              <div class="mt-7 rounded-[12px] border border-gold/30 bg-white/[0.04] p-5">
                <p class="text-sm leading-relaxed text-white/80">
                  <strong class="font-semibold text-gold-soft">Always verify yourself.</strong>{" "}
                  Our badge is a convenience, not a certification. Before you pay any amount
                  or sign anything, check the registration, the approved plans and the
                  promoter's details on the official state RERA portal, and have the
                  documents reviewed independently.
                </p>
              </div>
            </div>

            <ul class="space-y-4 lg:pt-14">
              <For
                each={[
                  {
                    t: "The number, in full",
                    b: "Displayed in monospace so it reads as the official identifier it is — and so it wraps correctly on a phone instead of overflowing.",
                  },
                  {
                    t: "The phase it covers",
                    b: "A registration usually covers one phase of a project, not all of it. We say which one, because that distinction has caught out a lot of buyers.",
                  },
                  {
                    t: "The issuing authority",
                    b: "HARERA, MahaRERA, K-RERA and the rest each run their own portal. We name the authority so you know exactly where to go.",
                  },
                  {
                    t: "A route to the source",
                    b: "From the project page to the official state portal, so verification is a click rather than a research project.",
                  },
                ]}
              >
                {(item) => (
                  <li class="flex gap-4 rounded-[12px] border border-white/10 bg-white/[0.03] p-5">
                    <span class="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gold/15 text-gold-soft">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </span>
                    <div>
                      <h3 class="font-display text-lg font-semibold text-white">{item.t}</h3>
                      <p class="mt-1 text-sm leading-relaxed text-white/65">{item.b}</p>
                    </div>
                  </li>
                )}
              </For>
            </ul>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section class="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <div class="mx-auto max-w-2xl text-center">
          <p class="eyebrow">How it works</p>
          <h2 class="mt-3 font-display text-3xl font-semibold text-navy sm:text-4xl">
            Four steps, in <span class="italic text-gold">your</span> order
          </h2>
          <div class="gold-rule mx-auto mt-5" />
          <p class="mt-5 text-slate">
            Nothing here requires your phone number until you decide it does.
          </p>
        </div>

        <ol class="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <For each={STEPS}>
            {(s, i) => (
              <li class="card-lift relative rounded-[14px] border border-line bg-card p-6">
                <span class="font-display text-5xl font-semibold leading-none text-gold/25">
                  {String(i() + 1).padStart(2, "0")}
                </span>
                <h3 class="mt-3 font-display text-lg font-semibold text-navy">{s.title}</h3>
                <p class="mt-2 text-sm leading-relaxed text-slate">{s.body}</p>
              </li>
            )}
          </For>
        </ol>
      </section>

      {/* 6. WHO IT IS BUILT FOR */}
      <section class="border-y border-line bg-[#f8f5f2] py-14 sm:py-20">
        <div class="mx-auto max-w-7xl px-4 sm:px-6">
          <div class="mx-auto max-w-2xl text-center">
            <p class="eyebrow">Built for</p>
            <h2 class="mt-3 font-display text-3xl font-semibold text-navy sm:text-4xl">
              Four buyers, one <span class="italic text-gold">standard of proof</span>
            </h2>
            <div class="gold-rule mx-auto mt-5" />
          </div>

          <div class="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <For each={AUDIENCES}>
              {(a) => (
                <article class="card-lift flex flex-col rounded-[14px] border border-line bg-card p-6">
                  <h3 class="font-display text-xl font-semibold text-navy">{a.label}</h3>
                  <div class="gold-rule mt-3" />
                  <p class="mt-4 flex-1 text-sm leading-relaxed text-slate">{a.body}</p>
                  <A
                    href={a.href}
                    class="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:underline"
                  >
                    {a.cta}
                    <span aria-hidden="true">→</span>
                  </A>
                </article>
              )}
            </For>
          </div>
        </div>
      </section>

      {/* 7. WHAT WE DON'T DO */}
      <section class="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <div class="overflow-hidden rounded-[22px] border border-line bg-card lg:grid lg:grid-cols-[0.85fr_1.15fr]">
          <div class="hero-gradient relative overflow-hidden p-8 text-white sm:p-10 lg:p-12">
            <div class="blueprint pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
            <div class="relative">
              <p class="eyebrow text-gold-soft">Plainly stated</p>
              <h2 class="mt-3 font-display text-3xl font-semibold leading-tight sm:text-4xl">
                What we <span class="italic text-gold-soft">don't</span> do
              </h2>
              <div class="gold-rule mt-5" />
              <p class="mt-6 text-sm leading-relaxed text-white/70">
                A portal that is honest about its limits is more useful than one that claims
                to solve everything. These are ours — the same ones set out in our{" "}
                <A href="/terms" class="font-semibold text-gold-soft underline underline-offset-4">
                  terms &amp; conditions
                </A>
                .
              </p>
            </div>
          </div>

          <div class="p-8 sm:p-10 lg:p-12">
            <ul class="space-y-5">
              <For each={HONESTY}>
                {(line) => (
                  <li class="flex gap-4">
                    <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                    <p class="text-[15px] leading-relaxed text-slate">{line}</p>
                  </li>
                )}
              </For>
            </ul>
          </div>
        </div>
      </section>

      {/* 8. ADVISORY / CONTACT */}
      <section class="border-t border-line bg-[#f8f5f2] py-14 sm:py-20">
        <div class="mx-auto max-w-7xl px-4 sm:px-6">
          <div class="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center lg:gap-16">
            <div>
              <p class="eyebrow">The desk behind the site</p>
              <h2 class="mt-3 font-display text-3xl font-semibold text-navy sm:text-4xl">
                A named advisor, <span class="italic text-gold">not a call centre</span>
              </h2>
              <div class="gold-rule mt-5" />
              <p class="mt-6 text-[15px] leading-relaxed text-slate">
                Enquiries reach an advisory desk that works the city you asked about. They
                shortlist against the budget, configuration and purpose you gave — and they
                will tell you when the honest answer is that nothing on the list fits. You
                can ask us to stop contacting you at any time, and we will.
              </p>
            </div>

            <dl class="grid gap-4 rounded-[14px] border border-line bg-card p-6 sm:grid-cols-2 sm:p-8 lg:grid-cols-1">
              {/* Phone hidden for now — mirrors the footer. Restore when the number is live.
              <ContactRow label="Call us">
                <a href={`tel:${COMPANY.phoneHref}`} class="hover:text-gold">
                  {COMPANY.phone}
                </a>
              </ContactRow>
              */}
              <ContactRow label="Email">
                <a href={`mailto:${COMPANY.email}`} class="hover:text-gold">
                  {COMPANY.email}
                </a>
              </ContactRow>
              <ContactRow label="Working hours">
                Monday – Saturday, 10:00 AM – 8:00 PM
              </ContactRow>
            </dl>
          </div>
        </div>
      </section>

      {/* 9. LEAD */}
      <section id="enquire" class="scroll-mt-20 bg-paper py-16 sm:py-24">
        <div class="mx-auto max-w-3xl px-4 sm:px-6">
          <div class="rounded-[22px] border border-line bg-card p-6 shadow-[0_40px_90px_-50px_rgba(14,27,51,0.45)] sm:p-10">
            <LeadForm
              heading="Put us to the test"
              subheading="Tell us the requirement. We'll come back with RERA-verified options that fit — or tell you honestly that none do."
            />
          </div>
        </div>
      </section>
    </>
  );
}

function ContactRow(props: { label: string; children: JSX.Element }) {
  return (
    <div>
      <dt class="eyebrow">{props.label}</dt>
      <dd class="mt-1.5 font-display text-lg font-semibold text-navy">{props.children}</dd>
    </div>
  );
}

/** Fallback glyph for pillars that don't carry the RERA seal. */
function PillarIcon(props: { icon: "seal" | "rupee" | "visit" | "shield" }) {
  return (
    <span class="grid h-11 w-11 place-items-center rounded-full bg-gold/15 text-gold">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <Show when={props.icon === "rupee"}>
          <path d="M8 6h9M8 6a3 3 0 0 1 0 6H6l6 6M8 9h9M13 6c0 3-2 6-5 6" />
        </Show>
        <Show when={props.icon === "visit"}>
          <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
          <circle cx="12" cy="10" r="2.5" />
        </Show>
        <Show when={props.icon === "shield"}>
          <path d="M12 3l7 3v6c0 4.4-3 8-7 9-4-1-7-4.6-7-9V6l7-3Z" />
          <path d="m9 12 2 2 4-4" />
        </Show>
      </svg>
    </span>
  );
}

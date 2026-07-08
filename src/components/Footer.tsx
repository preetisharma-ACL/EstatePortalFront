import { A } from "@solidjs/router";
import ReraSeal from "./ReraSeal";

export default function Footer() {
  return (
    <footer class="hero-gradient mt-20 text-white/80">
      <div class="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div class="grid gap-10 md:grid-cols-4">
          <div class="md:col-span-1">
            <div class="flex items-center gap-2">
              <span class="font-display text-2xl font-semibold text-white">
                EstatePortal
              </span>
              <span class="mb-3 inline-block h-1.5 w-1.5 rounded-full bg-gold" />
            </div>
            <p class="mt-3 max-w-xs text-sm leading-relaxed text-white/65">
              A RERA-verifiable, content-rich portal for serious residential and
              commercial property discovery across India.
            </p>
            <div class="mt-5">
              <ReraSeal label size="md" />
            </div>
          </div>

          <FooterCol
            title="Discover"
            links={[
              { href: "/search", label: "All projects" },
              { href: "/search?status=ready_to_move", label: "Ready to move" },
              { href: "/search?status=prelaunch", label: "New launches" },
              { href: "/search?project_type=commercial", label: "Commercial" },
              { href: "/developers", label: "Developers" },
            ]}
          />
          <FooterCol
            title="Investor"
            links={[
              { href: "/search?min_price=50000000&ordering=-price_min", label: "Luxury 5 Cr+" },
              { href: "/search?max_price=10000000", label: "Under 1 Cr" },
              { href: "/search?purpose=investment", label: "Investment picks" },
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              { href: "/#trust", label: "Why EstatePortal" },
              { href: "/#enquire", label: "Talk to an advisor" },
              { href: "/sitemap.xml", label: "Sitemap" },
            ]}
          />
        </div>

        <div class="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} EstatePortal. All rights reserved.</p>
          <p class="max-w-xl">
            Property information is indicative. Always verify RERA registration
            details on the official state authority portal before transacting.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol(props: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h3 class="eyebrow text-gold-soft">{props.title}</h3>
      <ul class="mt-4 flex flex-col gap-2.5">
        {props.links.map((l) => (
          <li>
            <A href={l.href} class="text-sm text-white/70 transition-colors hover:text-gold-soft">
              {l.label}
            </A>
          </li>
        ))}
      </ul>
    </div>
  );
}

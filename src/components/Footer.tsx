import { A } from "@solidjs/router";
import type { JSX } from "solid-js";

export default function Footer() {
  return (
    <footer class="mt-16 overflow-hidden border-t-4 border-gold bg-[#f5f0ea] text-navy">
      <div class="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* The curved, outlined panel is the defining detail from the reference. */}
        <div class="pointer-events-none absolute bottom-0 left-[37%] top-8 hidden w-[72%] rounded-tl-[135px] border-l-2 border-t-2 border-gold/65 lg:block" aria-hidden="true" />

        <div class="relative grid gap-8 py-10 lg:grid-cols-[1.1fr_1.65fr] lg:gap-12 lg:py-10">
          <div class="max-w-sm pt-1">
            <img src="/logo/acl-logo.png" alt="Aajneeti" class="h-14 w-auto shrink-0" />
            <p class="mt-4 text-[15px] font-medium leading-7 text-navy/80">
              Your trusted partner for verified residential and commercial property
              discovery across India.
            </p>
            <p class="mt-6 eyebrow">Stay connected</p>
            <div class="mt-2.5 flex items-center gap-3">
              <SocialIcon label="Facebook"><path d="M14 8h3V4h-3c-3.1 0-5 1.9-5 5v3H6v4h3v4h4v-4h3l1-4h-4V9c0-.6.4-1 1-1Z" /></SocialIcon>
              <SocialIcon label="Instagram"><rect x="4" y="4" width="16" height="16" rx="4" /><circle cx="12" cy="12" r="3.5" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" /></SocialIcon>
              <SocialIcon label="LinkedIn"><path d="M7 9v8M7 6.5v.1M11 17v-4.5a3 3 0 0 1 6 0V17M11 10v7" /></SocialIcon>
            </div>
          </div>

          <div class="grid justify-items-center gap-x-8 gap-y-8 lg:pl-14 sm:grid-cols-2 xl:grid-cols-3">
            <div class="text-center">
              <FooterTitle>Feel free to contact us</FooterTitle>
              <ul class="mt-3.5 space-y-3 text-sm font-medium text-navy/85">
                <li><a href="mailto:info@estateportal.in" class="inline-flex items-center gap-3 transition-colors hover:text-gold"><MailIcon /> info@estateportal.in</a></li>
                <li><a href="tel:+919899055893" class="inline-flex items-center gap-3 transition-colors hover:text-gold"><PhoneIcon /> +91 98990 55893</a></li>
                <li><A href="/" class="inline-flex items-center gap-3 transition-colors hover:text-gold"><GlobeIcon /> www.estateportal.in</A></li>
              </ul>
            </div>

            
              <FooterCol title="Discover" links={[
                { href: "/search", label: "All projects" },
                { href: "/search?status=ready_to_move", label: "Ready to move" },
                { href: "/search?status=prelaunch", label: "New launches" },
                { href: "/search?project_type=commercial", label: "Commercial" },
                { href: "/developers", label: "Developers" },
              ]} />
            

            
              <FooterCol title="Investor" links={[
                { href: "/search?min_price=50000000&ordering=-price_min", label: "Luxury 5 Cr+" },
                { href: "/search?max_price=10000000", label: "Under 1 Cr" },
                { href: "/search?purpose=investment", label: "Investment picks" },
              ]} />
            

            <div class="sm:col-start-2 xl:col-start-2">
              <FooterCol title="Legal & policy" links={[
                { href: "/privacy-policy", label: "Privacy policy" },
                { href: "/terms", label: "Terms & conditions" },
              ]} />
            </div>

            <div class=" sm:col-start-1 xl:col-start-3">
              <FooterCol title="Company" links={[
                { href: "/#trust", label: "Why EstatePortal" },
                { href: "/#enquire", label: "Talk to an advisor" },
                { href: "/sitemap.xml", label: "Sitemap" },
              ]} />
            </div>
          </div>
        </div>
      </div>

      <div class="border-t border-gold/40 bg-navy-deep px-4 py-3.5 text-center text-xs leading-relaxed text-white/85 sm:px-6">
        <p class="mx-auto max-w-6xl">Property information is indicative. Always verify RERA registration details on the official state authority portal before transacting.</p>
        <p class="mt-1.5">© {new Date().getFullYear()} EstatePortal. All rights reserved.</p>
      </div>
    </footer>
  );
}

function FooterTitle(props: { children: string }) {
  return <h3 class="inline-block border-b-2 border-gold pb-1.5 font-display text-[1.35rem] font-semibold text-navy">{props.children}</h3>;
}

function FooterCol(props: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <FooterTitle>{props.title}</FooterTitle>
      <ul class="mt-3.5 flex flex-col  gap-2.5 text-sm font-medium">
        {props.links.map((link) => <li><A href={link.href} class="text-navy/85 transition-colors hover:text-gold">{link.label}</A></li>)}
      </ul>
    </div>
  );
}

function SocialIcon(props: { label: string; children: JSX.Element }) {
  return <a href="#" aria-label={props.label} class="grid h-11 w-11 place-items-center rounded-full border border-navy bg-navy text-white shadow-[0_8px_18px_-10px_rgba(14,27,51,0.85)] transition-all hover:-translate-y-0.5 hover:border-gold hover:bg-gold hover:text-navy-deep"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{props.children}</svg></a>;
}

function MailIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>; }
function PhoneIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h3l1.5 4-2 1.5a15 15 0 0 0 7 7l1.5-2L20 16v3c0 1.1-.9 2-2 2C10.3 21 3 13.7 3 6c0-1.1.9-2 2-2Z" /></svg>; }
function GlobeIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>; }

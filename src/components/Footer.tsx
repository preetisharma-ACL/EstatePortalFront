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
              <SocialIcon label="Facebook" href="https://www.facebook.com/people/Property-Updates-By-Alok/61572409943458/" brand="bg-[#1877F2]" viewBox="0 0 320 512"><path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" /></SocialIcon>
              <SocialIcon label="Instagram" href="https://www.instagram.com/propertyupdatesbyalok/?hl=en" brand="bg-[radial-gradient(circle_at_28%_106%,#fdf497_0%,#fd5949_45%,#d6249f_60%,#285AEB_90%)]" viewBox="0 0 448 512"><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" /></SocialIcon>
              <SocialIcon label="YouTube" href="https://www.youtube.com/channel/UC3UIZD32SLOr-B67Dhhby0Q" brand="bg-[#FF0000]" viewBox="0 0 576 512"><path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z" /></SocialIcon>
            </div>
          </div>

          <div class="grid justify-items-center gap-x-8 gap-y-8 lg:pl-14 sm:grid-cols-2 xl:grid-cols-3">
            <div class="text-center">
              <FooterTitle>Feel free to contact us</FooterTitle>
              <ul class="mt-3.5 space-y-3 text-sm font-medium text-navy/85">
                <li><a href="mailto:realestate@aajneeti.social" class="inline-flex items-center gap-3 transition-colors hover:text-gold"><MailIcon /> realestate@aajneeti.social</a></li>
                {/* Phone hidden for now — restore this line (and PhoneIcon below) when the number is live.
                <li><a href="tel:+919899055893" class="inline-flex items-center gap-3 transition-colors hover:text-gold"><PhoneIcon /> +91 98990 55893</a></li>
                */}
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
                { href: "/why-estateportal", label: "Why EstatePortal" },
                { href: "/#enquire", label: "Talk to an advisor" },
                // { href: "/sitemap.xml", label: "Sitemap" },
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

/* Brand glyphs are the official logo paths (Font Awesome Free 6, CC BY 4.0). */
function SocialIcon(props: { label: string; href: string; brand: string; viewBox: string; children: JSX.Element }) {
  return <a href={props.href} target="_blank" rel="noopener noreferrer" aria-label={props.label} class={`grid h-11 w-11 place-items-center rounded-full text-white shadow-[0_8px_18px_-10px_rgba(14,27,51,0.85)] transition-all hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_12px_22px_-10px_rgba(14,27,51,0.9)] ${props.brand}`}><svg height="18" viewBox={props.viewBox} fill="currentColor" class="max-w-[18px]" aria-hidden="true">{props.children}</svg></a>;
}

function MailIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>; }
function PhoneIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h3l1.5 4-2 1.5a15 15 0 0 0 7 7l1.5-2L20 16v3c0 1.1-.9 2-2 2C10.3 21 3 13.7 3 6c0-1.1.9-2 2-2Z" /></svg>; }
function GlobeIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>; }

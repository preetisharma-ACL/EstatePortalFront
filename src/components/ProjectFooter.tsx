import { COMPANY } from "~/lib/company";

/**
 * Footer for a project detail page.
 *
 * Replaces the site-wide <Footer> on /project/* (see app.tsx). The page is a
 * single-project landing page — the last thing it should do is offer a grid of
 * links back out to the catalogue — so this carries the disclaimer and nothing
 * else. Wording mirrors the terms and the legal-page footnote; keep the three
 * in step if any of them changes.
 */
export default function ProjectFooter() {
  return (
    <footer class="border-t-4 border-gold bg-navy-deep text-white/75">
      <div class="mx-auto max-w-4xl px-4 py-10 text-center sm:px-6 sm:py-12">
        <p class="eyebrow text-gold-soft">Disclaimer</p>
        <div class="gold-rule mx-auto my-3.5" />
        <div class="space-y-3.5 text-[13px] leading-relaxed">
          <p>
            Project particulars on this page — configurations, carpet and built-up areas,
            pricing, possession status, amenities, floor plans, images and developer
            details — are sourced from the developer or their authorised representatives
            and are <strong class="font-semibold text-white">indicative only</strong>. They
            are not an offer or a contract, and they may change without notice.
          </p>
          <p>
            The RERA registration shown here is a convenience, not a certification. Before
            you pay any amount or sign any document, verify the registration, the approved
            plans and the promoter's details on the official state RERA authority portal,
            and have the transaction documents reviewed independently.
          </p>
          <p>
            {COMPANY.brand} is not the seller of this project and collects no booking
            amount, token or fee through this site. Listing a project is not an
            endorsement, a recommendation, or investment advice.
          </p>
        </div>
        <p class="mt-7 border-t border-white/10 pt-5 text-xs text-white/55">
          © {new Date().getFullYear()} {COMPANY.brand}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

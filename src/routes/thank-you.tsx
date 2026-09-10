import { Title, Meta } from "@solidjs/meta";
import { A, useSearchParams } from "@solidjs/router";
import GoogleAdsTag from "~/components/GoogleAdsTag";
import AdsConversion from "~/components/AdsConversion";
import { deskPhoneForProject, telHref } from "~/lib/contactPhone";

const str = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

/**
 * Post-enquiry confirmation page.
 *
 * Its reason to exist is the Google Ads tag below: a distinct URL the ad
 * platform can count as a conversion, which a "thank you" swapped into the form
 * in place cannot give it. Reached by redirect from the enquiry forms that pass
 * `redirectTo` (see ProjectEnquiryForm) — every other form still confirms in
 * place, so no page that isn't running ads changes.
 *
 * `?project=<slug>` is optional and only picks the number to quote: several
 * projects are fielded by a desk other than the portal default, and sending a
 * visitor to the wrong one is worse than showing no number at all.
 *
 * noindex: a confirmation page has nothing to rank for, and one in the index
 * would let people land here without ever submitting a lead.
 */
export default function ThankYouPage() {
  const [params] = useSearchParams();
  const phone = () => deskPhoneForProject(str(params.project) ?? "");

  return (
    <div class="mx-auto max-w-xl px-4 py-24 text-center">
      <Title>Thank you | EstatePortal</Title>
      <Meta name="description" content="Your enquiry has reached our advisory team." />
      <Meta name="robots" content="noindex,follow" />

      {/* Loads gtag.js and registers the Ads account. */}
      <GoogleAdsTag id="AW-16454201362" />
      {/* Sends the conversion itself — `?lead=` is the lead id, used as the
          transaction_id so a refresh doesn't count twice. */}
      <AdsConversion transactionId={str(params.lead)} />

      <div class="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green text-white shadow-[0_0_0_3px_var(--color-gold)]">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>

      <h1 class="mt-6 font-display text-3xl font-semibold text-navy sm:text-4xl">
        Thank you for your enquiry
      </h1>
      <div class="gold-rule mx-auto my-4" />
      <p class="text-[15px] leading-relaxed text-slate">
        Your details have reached our advisory team. A verified property advisor will
        call you shortly with RERA-verified pricing, the brochure and an assisted
        site visit.
      </p>
      <p class="mt-3 text-sm text-slate">
        In a hurry? Call us on{" "}
        <a href={telHref(phone())} class="font-semibold text-navy underline decoration-gold underline-offset-4">
          {phone()}
        </a>
        , Monday to Saturday, 10:00 AM – 08:00 PM.
      </p>

      <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
        <A href="/search" class="rounded-[8px] bg-gold px-5 py-2.5 text-sm font-semibold text-navy transition-transform hover:-translate-y-0.5">
          Browse more projects
        </A>
        <A href="/" class="rounded-[8px] border border-navy/25 px-5 py-2.5 text-sm font-semibold text-navy hover:bg-navy hover:text-white">
          Back to home
        </A>
      </div>
    </div>
  );
}

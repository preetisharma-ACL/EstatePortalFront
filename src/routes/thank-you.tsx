import { Show } from "solid-js";
import { Title, Meta } from "@solidjs/meta";
import { A, createAsync, useSearchParams } from "@solidjs/router";
import { projectQuery } from "~/lib/queries";
import GoogleAdsTag from "~/components/GoogleAdsTag";
import AdsConversion from "~/components/AdsConversion";
import { phoneOrUndefined, telHref } from "~/lib/contactPhone";
import { ADS_ACCOUNT_ID } from "~/lib/adsConversion";

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
 * `?project=<slug>` is optional and picks the number to quote: several
 * projects are fielded by a desk other than the portal default, and sending a
 * visitor to the wrong one is worse than showing no number at all. It does NOT
 * pick the conversion action — that arrives from the form through
 * sessionStorage, because only the lead response knows which project the lead
 * was attributed to.
 *
 * noindex: a confirmation page has nothing to rank for, and one in the index
 * would let people land here without ever submitting a lead.
 */
export default function ThankYouPage() {
  const [params] = useSearchParams();

  /**
   * The project's own desk number, for the "in a hurry" line below.
   *
   * A fetch, but almost never a request: projectQuery is cached, and the
   * visitor arrived here from that project's page, which already resolved it.
   * Only for the phone — the conversion never comes from here, because the lead
   * response is the only thing that knows which project the lead was attributed
   * to. Blank, or no ?project= at all, and the line is simply omitted.
   */
  const project = createAsync(async () => {
    const slug = str(params.project);
    return slug ? await projectQuery(slug) : null;
  });
  const phone = () => phoneOrUndefined(project()?.contact_phone);

  return (
    <div class="mx-auto max-w-xl px-4 py-24 text-center">
      <Title>Thank you | Aajneeti Real Estate</Title>
      <Meta name="description" content="Your enquiry has reached our advisory team." />
      <Meta name="robots" content="noindex,follow" />

      {/* Registers the shared Ads account in the server-rendered <head>, so the
          loader is in flight before the conversion below is sent. Deduped
          against ensureAdsAccount, so it cannot double-count. */}
      <GoogleAdsTag id={ADS_ACCOUNT_ID} />
      {/* Sends the conversion parked by the form that redirected here. Fires
          once per lead — a refresh or a back-button return sends nothing. */}
      <AdsConversion />

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
      <Show when={phone()}>
        {(number) => (
          <p class="mt-3 text-sm text-slate">
            In a hurry? Call us on{" "}
            <a href={telHref(number())} class="font-semibold text-navy underline decoration-gold underline-offset-4">
              {number()}
            </a>
            , Monday to Saturday, 10:00 AM – 08:00 PM.
          </p>
        )}
      </Show>

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

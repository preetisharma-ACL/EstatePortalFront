import { createSignal, Show, onMount } from "solid-js";
import { createAsync, useNavigate } from "@solidjs/router";
import { submitLead, ApiError } from "~/lib/api";
import { citiesQuery } from "~/lib/queries";
import { getAttribution, captureAttribution } from "~/lib/attribution";
import { resolveCity } from "~/lib/leadCity";
import { fireConversion, reportUnconfiguredConversion, stashConversion } from "~/lib/adsConversion";
import type { LeadPayload } from "~/lib/types";

// First page of /cities/ backs the typed-city -> slug lookup on submit.
const CITY_PARAMS = { page: 1 } as const;

/**
 * The site-wide lead form (popup, home page, developer and why-us pages).
 *
 * Deliberately short: name, mobile number and city only. Everything else the
 * backend accepts on a lead is optional, and a three-field form converts better.
 * Matches ProjectEnquiryForm field-for-field — that one is the on-image variant
 * used inside dark hero banners.
 *
 * Confirms in place unless the caller passes `redirectTo`, which only
 * <LeadPopup> does, and only when the modal was opened ON a project page — see
 * the note there for why the route decides that rather than the mere presence
 * of a project slug.
 *
 * Either way the conversion is reported: inline it fires here off the 201, and
 * on the redirect it is parked for /thank-you. So the redirect is purely a UX
 * choice and never a measurement one.
 */
export default function LeadForm(props: {
  projectSlug?: string;
  citySlug?: string;
  /**
   * Where to send the visitor on success instead of confirming in place. Unset
   * everywhere except the modal on a project page.
   */
  redirectTo?: string;
  /**
   * Free-text note prepended to the lead's `message`, e.g. the township a
   * landing page is about. Mirrors ProjectEnquiryForm — the lead schema has no
   * field for page context.
   */
  contextNote?: string;
  heading?: string;
  subheading?: string;
}) {
  const [submitting, setSubmitting] = createSignal(false);
  const [done, setDone] = createSignal(false);
  const [formError, setFormError] = createSignal<string | null>(null);
  const [fieldErrors, setFieldErrors] = createSignal<Record<string, string>>({});

  const cities = createAsync(() => citiesQuery(CITY_PARAMS));
  const navigate = useNavigate();

  onMount(() => captureAttribution());

  const errFor = (name: string) => fieldErrors()[name];

  const onSubmit = async (e: Event) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);

    const strOrUndef = (v: FormDataEntryValue | null) => {
      const s = (v as string)?.trim();
      return s ? s : undefined;
    };

    if (!fd.get("consent")) {
      setFieldErrors({ consent_given: "Please accept the consent to proceed." });
      return;
    }

    const city = resolveCity(strOrUndef(fd.get("city")), cities()?.results ?? [], props.citySlug);
    // One message field carries both notes, so an unrecognised city never
    // silently displaces the page context (or vice versa).
    const message =
      [props.contextNote, city.message].filter(Boolean).join(" · ") || undefined;

    const attribution = getAttribution();
    const payload: LeadPayload = {
      name: (fd.get("name") as string)?.trim() ?? "",
      phone: (fd.get("phone") as string)?.trim() ?? "",
      project_slug: props.projectSlug,
      city_slug: city.city_slug,
      message,
      ...attribution,
      consent_given: true,
    };

    setSubmitting(true);
    try {
      const lead = await submitLead(payload);
      const leadId = lead?.id ?? null;
      const conversion = lead?.conversion ?? null;

      // Paid click that nothing can count — see reportUnconfiguredConversion.
      if (!conversion) {
        reportUnconfiguredConversion({
          leadId,
          projectSlug: props.projectSlug,
          gclid: attribution.gclid,
        });
      }

      if (props.redirectTo) {
        if (conversion) stashConversion(leadId, conversion);
        navigate(
          leadId == null
            ? props.redirectTo
            : `${props.redirectTo}${props.redirectTo.includes("?") ? "&" : "?"}lead=${leadId}`,
        );
      } else {
        fireConversion(leadId, conversion);
        setDone(true);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 400 && err.detail && typeof err.detail === "object") {
        const detail = err.detail as Record<string, unknown>;
        const fe: Record<string, string> = {};
        for (const [k, v] of Object.entries(detail)) {
          fe[k] = Array.isArray(v) ? String(v[0]) : String(v);
        }
        setFieldErrors(fe);
        if (fe.non_field_errors || fe.detail) setFormError(fe.non_field_errors || fe.detail);
      } else {
        setFormError("Something went wrong. Please try again or call us directly.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Show when={!done()} fallback={<ThankYou />}>
      <form onSubmit={onSubmit} class="space-y-4" novalidate>
        <div>
          <h3 class="font-display text-2xl font-semibold text-navy">
            {props.heading ?? "Talk to a property advisor"}
          </h3>
          <p class="mt-1 text-sm text-slate">
            {props.subheading ?? "Verified details, transparent pricing, assisted site visits."}
          </p>
        </div>

        <Show when={formError()}>
          <p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError()}</p>
        </Show>

        <div class="grid gap-4 sm:grid-cols-2">
          <Field label="Full Name" name="name" required error={errFor("name")}>
            <input name="name" id="name" required class={inputCls(!!errFor("name"))} placeholder="Your name" autocomplete="name" />
          </Field>
          {/* Capped at 10 digits (Indian mobile) — the placeholder drops the
              +91 prefix to match, since a prefixed number would truncate. */}
          <Field label="Mobile Number" name="phone" required error={errFor("phone")}>
            <input name="phone" id="phone" required type="tel" inputmode="tel" maxlength="10" class={inputCls(!!errFor("phone"))} placeholder="98xxxxxxxx" autocomplete="tel" />
          </Field>
        </div>

        {/* Plain free text — no suggestion list. What's typed is matched to a
            city record on submit (see resolveCity). */}
        <Field label="City" name="city" error={errFor("city_slug")}>
          <input name="city" id="city" class={inputCls(!!errFor("city_slug"))} placeholder="Your city" autocomplete="address-level2" />
        </Field>

        {/* Mandatory DPDP consent */}
        <div>
          <label class="flex cursor-pointer items-start gap-2.5 text-sm text-slate">
            <input type="checkbox" name="consent" class="mt-0.5 h-4 w-4 shrink-0 accent-[#1E7A54]" />
            <span>
              I agree to be contacted by Real Estate Aajneeti  and its verified partners about
              this enquiry via call, SMS, WhatsApp or email, and I consent to the
              processing of my personal data for this purpose under the Digital
              Personal Data Protection Act. 
            </span>
          </label>
          <Show when={errFor("consent_given")}>
            <p class="mt-1 text-xs text-red-600">{errFor("consent_given")}</p>
          </Show>
        </div>

        <button
          type="submit"
          disabled={submitting()}
          class="w-full rounded-[8px] bg-gold px-5 py-3 text-sm font-semibold text-navy transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting() ? "Submitting…" : "Request a callback"}
        </button>
      </form>
    </Show>
  );
}

function ThankYou() {
  return (
    <div class="rounded-[12px] border border-green/25 bg-green/[0.05] p-8 text-center">
      <div class="mx-auto grid h-14 w-14 place-items-center rounded-full bg-green text-white shadow-[0_0_0_3px_var(--color-gold)]">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <h3 class="mt-4 font-display text-2xl font-semibold text-navy">Thank you</h3>
      <p class="mx-auto mt-2 max-w-sm text-sm text-slate">
        Your enquiry has reached our advisory team. A verified property advisor will
        reach out shortly to help you with RERA-verified options and site visits.
      </p>
    </div>
  );
}

function Field(props: { label: string; name: string; required?: boolean; error?: string; children: any }) {
  return (
    <div>
      <label for={props.name} class="mb-1.5 block text-sm font-medium text-navy">
        {props.label}
        <Show when={props.required}>
          <span class="text-red-500"> *</span>
        </Show>
      </label>
      {props.children}
      <Show when={props.error}>
        <p class="mt-1 text-xs text-red-600">{props.error}</p>
      </Show>
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full rounded-[8px] border bg-card px-3 py-2.5 text-sm text-navy placeholder:text-slate/60 focus:outline-none focus:ring-2 focus:ring-gold/40 ${
    hasError ? "border-red-400" : "border-line"
  }`;
}

import { createSignal, Show, onMount } from "solid-js";
import { createAsync } from "@solidjs/router";
import { submitLead, ApiError } from "~/lib/api";
import { citiesQuery } from "~/lib/queries";
import { getAttribution, captureAttribution } from "~/lib/attribution";
import { resolveCity } from "~/lib/leadCity";
import type { LeadPayload } from "~/lib/types";

// First page of /cities/ backs the typed-city -> slug lookup on submit.
const CITY_PARAMS = { page: 1 } as const;

/**
 * The project enquiry fieldset, styled on-image (transparent inputs, white text).
 * Rendered both in the contact band and in the hero banner, so every field id is
 * namespaced by `idPrefix` — two instances share a page and duplicate ids would
 * point each label at the wrong input.
 *
 * Deliberately short: name, phone and city only. Everything else the backend
 * accepts on a lead is optional, and a three-field form converts better.
 */
export default function ProjectEnquiryForm(props: {
  projectSlug?: string;
  citySlug?: string;
  /**
   * Free-text note prepended to the lead's `message`, e.g. the township a
   * landing page is about. The lead schema has no field for that context, and
   * `landing_page` only records the session's FIRST page — so without this a
   * township enquiry is indistinguishable from a plain city enquiry.
   */
  contextNote?: string;
  /** Unique per instance on a page. */
  idPrefix: string;
  /** Tightens spacing and type for the narrow banner card. */
  compact?: boolean;
  submitLabel?: string;
  class?: string;
}) {
  const [submitting, setSubmitting] = createSignal(false);
  const [done, setDone] = createSignal(false);
  const [formError, setFormError] = createSignal<string | null>(null);
  const [fieldErrors, setFieldErrors] = createSignal<Record<string, string>>({});

  const cities = createAsync(() => citiesQuery(CITY_PARAMS));

  onMount(() => captureAttribution());

  const errFor = (name: string) => fieldErrors()[name];
  const id = (name: string) => `${props.idPrefix}-${name}`;
  const compact = () => !!props.compact;

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

    const payload: LeadPayload = {
      name: (fd.get("name") as string)?.trim() ?? "",
      phone: (fd.get("phone") as string)?.trim() ?? "",
      project_slug: props.projectSlug,
      city_slug: city.city_slug,
      message,
      ...getAttribution(),
      consent_given: true,
    };

    setSubmitting(true);
    try {
      await submitLead(payload);
      setDone(true);
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

  const input = (hasError: boolean) =>
    `w-full rounded-[8px] border bg-white/5 text-white placeholder:text-white/50 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40 ${
      compact() ? "px-2.5 py-1.5 text-[13px]" : "px-3 py-2.5 text-sm"
    } ${hasError ? "border-red-400" : "border-white/30"}`;

  const NameField = () => (
    <Field label="Full Name" for={id("name")} required compact={compact()} error={errFor("name")}>
      <input name="name" id={id("name")} required class={input(!!errFor("name"))} placeholder="Your name" autocomplete="name" />
    </Field>
  );
  const PhoneField = () => (
    <Field label="Mobile Number" for={id("phone")} required compact={compact()} error={errFor("phone")}>
      {/* Capped at 10 digits (Indian mobile). The placeholder drops the +91
          prefix to match — a prefixed number would silently truncate. */}
      <input name="phone" id={id("phone")} required type="tel" inputmode="tel" maxlength="10" class={input(!!errFor("phone"))} placeholder="98xxxxxxxx" autocomplete="tel" />
    </Field>
  );

  return (
    <Show when={!done()} fallback={<ThankYou compact={compact()} />}>
      <form onSubmit={onSubmit} class={`${compact() ? "space-y-2.5" : "space-y-4"} ${props.class ?? ""}`} novalidate>
        <Show when={formError()}>
          <p class="rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200">{formError()}</p>
        </Show>

        {/* One field per row — the form is short enough that stacking reads
            cleaner than pairing, and it keeps every control full-width. */}
        <NameField />
        <PhoneField />

        {/* Plain free text — no suggestion list. What's typed is matched to a
            city record on submit (see resolveCity). */}
        <Field label="City" for={id("city")} compact={compact()} error={errFor("city_slug")}>
          <input
            name="city"
            id={id("city")}
            class={input(!!errFor("city_slug"))}
            placeholder="Your city"
            autocomplete="address-level2"
          />
        </Field>

        {/* Mandatory DPDP consent */}
        <div>
          <label class={`flex cursor-pointer items-start gap-2.5 text-white/70 ${compact() ? "text-[11px] leading-snug" : "text-sm"}`}>
            <input type="checkbox" name="consent" class="mt-0.5 h-4 w-4 shrink-0 accent-[#1E7A54]" />
            <span>
              I agree to be contacted by EstatePortal and its verified partners about
              this enquiry via call, SMS, WhatsApp or email, and I consent to the
              processing of my personal data for this purpose under the Digital
              Personal Data Protection Act.
            </span>
          </label>
          <Show when={errFor("consent_given")}>
            <p class="mt-1 text-xs text-red-300">{errFor("consent_given")}</p>
          </Show>
        </div>

        <button
          type="submit"
          disabled={submitting()}
          class={`inline-flex items-center justify-center gap-2 rounded-[var(--radius-btn)] bg-gold font-semibold uppercase tracking-wider text-navy-deep transition-colors hover:bg-gold-soft disabled:cursor-not-allowed disabled:opacity-60 ${
            compact() ? "w-full px-4 py-2.5 text-xs" : "px-7 py-3.5 text-sm"
          }`}
        >
          {submitting() ? "Sending…" : props.submitLabel ?? "Request a callback"}
        </button>
      </form>
    </Show>
  );
}

function ThankYou(props: { compact?: boolean }) {
  return (
    <div class={`border border-gold/40 bg-white/5 text-center ${props.compact ? "p-5" : "mt-6 p-8"}`}>
      <div class={`mx-auto grid place-items-center rounded-full bg-gold text-navy-deep ${props.compact ? "h-10 w-10" : "h-14 w-14"}`}>
        <svg width={props.compact ? "20" : "26"} height={props.compact ? "20" : "26"} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
      </div>
      <h4 class={`mt-3 font-display font-semibold text-white ${props.compact ? "text-lg" : "mt-4 text-xl"}`}>Thank you</h4>
      <p class={`mx-auto mt-2 max-w-sm text-white/70 ${props.compact ? "text-xs" : "text-sm"}`}>
        Your enquiry has reached our advisory team. A verified property advisor will
        reach out shortly to help you with RERA-verified options and site visits.
      </p>
    </div>
  );
}

function Field(props: { label: any; for: string; required?: boolean; error?: string; compact?: boolean; children: any }) {
  return (
    <div>
      <label for={props.for} class={`mb-1.5 block font-medium text-white/85 ${props.compact ? "text-xs" : "text-sm"}`}>
        {props.label}
        <Show when={props.required}>
          <span class="text-gold"> *</span>
        </Show>
      </label>
      {props.children}
      <Show when={props.error}>
        <p class="mt-1 text-xs text-red-300">{props.error}</p>
      </Show>
    </div>
  );
}

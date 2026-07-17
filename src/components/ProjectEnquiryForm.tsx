import { createSignal, Show, For, onMount } from "solid-js";
import { submitLead, ApiError } from "~/lib/api";
import { getAttribution, captureAttribution } from "~/lib/attribution";
import type { LeadPayload, LeadTimeline, LeadPurpose } from "~/lib/types";

const TIMELINES: { value: LeadTimeline; label: string }[] = [
  { value: "immediate", label: "Immediately" },
  { value: "3_6", label: "3–6 months" },
  { value: "6_12", label: "6–12 months" },
  { value: "exploring", label: "Just exploring" },
];

const PURPOSES: { value: LeadPurpose; label: string; hint: string }[] = [
  { value: "investment", label: "Investment", hint: "Yield & appreciation" },
  { value: "end_use", label: "End use", hint: "To live / operate" },
  { value: "both", label: "Both", hint: "Invest & use" },
];

/**
 * The project enquiry fieldset, styled on-image (transparent inputs, white text).
 * Rendered both in the contact band and in the hero banner, so every field id is
 * namespaced by `idPrefix` — two instances share a page and duplicate ids would
 * point each label at the wrong input.
 */
export default function ProjectEnquiryForm(props: {
  projectSlug?: string;
  citySlug?: string;
  configurations?: string[];
  /** Unique per instance on a page. */
  idPrefix: string;
  /** Tightens spacing and type for the narrow banner card. */
  compact?: boolean;
  submitLabel?: string;
  class?: string;
}) {
  const [submitting, setSubmitting] = createSignal(false);
  const [done, setDone] = createSignal(false);
  const [purpose, setPurpose] = createSignal<LeadPurpose | "">("investment");
  const [formError, setFormError] = createSignal<string | null>(null);
  const [fieldErrors, setFieldErrors] = createSignal<Record<string, string>>({});

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

    const numOrUndef = (v: FormDataEntryValue | null) => {
      const s = (v as string)?.trim();
      if (!s) return undefined;
      const n = Number(s);
      return Number.isFinite(n) ? n : undefined;
    };
    const strOrUndef = (v: FormDataEntryValue | null) => {
      const s = (v as string)?.trim();
      return s ? s : undefined;
    };

    if (!fd.get("consent")) {
      setFieldErrors({ consent_given: "Please accept the consent to proceed." });
      return;
    }

    const payload: LeadPayload = {
      name: (fd.get("name") as string)?.trim() ?? "",
      phone: (fd.get("phone") as string)?.trim() ?? "",
      email: strOrUndef(fd.get("email")),
      budget_min: numOrUndef(fd.get("budget_min")),
      budget_max: numOrUndef(fd.get("budget_max")),
      timeline: (strOrUndef(fd.get("timeline")) as LeadTimeline) || undefined,
      purpose: (purpose() || undefined) as LeadPurpose | undefined,
      configuration_preference: strOrUndef(fd.get("configuration_preference")),
      message: strOrUndef(fd.get("message")),
      project_slug: props.projectSlug,
      city_slug: props.citySlug,
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

  // Declared once, arranged differently per layout below.
  const NameField = () => (
    <Field label="Full Name" for={id("name")} compact={compact()} error={errFor("name")}>
      <input name="name" id={id("name")} required class={input(!!errFor("name"))} placeholder="Your name" autocomplete="name" />
    </Field>
  );
  const PhoneField = () => (
    <Field label="Phone" for={id("phone")} required compact={compact()} error={errFor("phone")}>
      <input name="phone" id={id("phone")} required type="tel" inputmode="tel" class={input(!!errFor("phone"))} placeholder={compact() ? "98xxxxxxxx" : "+91 98xxxxxxxx"} autocomplete="tel" />
    </Field>
  );
  const EmailField = () => (
    <Field label="Email" for={id("email")} compact={compact()} error={errFor("email")}>
      <input name="email" id={id("email")} type="email" class={input(!!errFor("email"))} placeholder="you@email.com" autocomplete="email" />
    </Field>
  );

  return (
    <Show when={!done()} fallback={<ThankYou compact={compact()} />}>
      <form onSubmit={onSubmit} class={`${compact() ? "space-y-2.5" : "space-y-4"} ${props.class ?? ""}`} novalidate>
        <Show when={formError()}>
          <p class="rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200">{formError()}</p>
        </Show>

        {/* Compact packs name/phone/email onto one row; the roomier band form
            keeps email on its own line. */}
        <Show
          when={compact()}
          fallback={
            <>
              <div class="grid gap-4 sm:grid-cols-2">
                <NameField />
                <PhoneField />
              </div>
              <EmailField />
            </>
          }
        >
          <div class="grid grid-cols-3 gap-2.5">
            <NameField />
            <PhoneField />
            <EmailField />
          </div>
        </Show>

        {/* Purpose */}
        <div>
          <label class={`mb-1.5 block font-medium text-white/85 ${compact() ? "text-xs" : "text-sm"}`}>Purpose</label>
          <div class="grid grid-cols-3 gap-2">
            <For each={PURPOSES}>
              {(pp) => (
                <button
                  type="button"
                  onClick={() => setPurpose(pp.value)}
                  aria-pressed={purpose() === pp.value}
                  class={`rounded-[8px] border text-left transition-colors ${compact() ? "px-2 py-1.5" : "px-3 py-2.5"} ${
                    purpose() === pp.value
                      ? "border-gold bg-gold/15"
                      : "border-white/30 bg-white/5 hover:border-gold-soft"
                  }`}
                >
                  <span class={`block font-semibold text-white ${compact() ? "text-[11px] leading-tight" : "text-sm"}`}>{pp.label}</span>
                  <Show when={!compact()}>
                    <span class="block text-xs text-white/60">{pp.hint}</span>
                  </Show>
                </button>
              )}
            </For>
          </div>
        </div>

        {/* Budget and timeline/config stay two-across at every width — these
            pairs read as one control and the fields are short. */}
        <div class={`grid grid-cols-2 ${compact() ? "gap-2.5" : "gap-4"}`}>
          <Field label="Budget min (₹)" for={id("budget_min")} compact={compact()}>
            <input name="budget_min" id={id("budget_min")} type="number" min="0" step="100000" class={input(false)} placeholder="e.g. 5000000" />
          </Field>
          <Field label="Budget max (₹)" for={id("budget_max")} compact={compact()}>
            <input name="budget_max" id={id("budget_max")} type="number" min="0" step="100000" class={input(false)} placeholder="e.g. 20000000" />
          </Field>
        </div>

        <div class={`grid grid-cols-2 ${compact() ? "gap-2.5" : "gap-4"}`}>
          <Field label="Timeline" for={id("timeline")} compact={compact()}>
            <select name="timeline" id={id("timeline")} class={input(false)}>
              <option value="">Select timeline</option>
              <For each={TIMELINES}>{(t) => <option value={t.value}>{t.label}</option>}</For>
            </select>
          </Field>
          {/* "Configuration preference" wraps to two lines in a half-width
              column and knocks this select out of line with Timeline, so the
              label shortens wherever the column is narrow. */}
          <Field
            label={
              compact() ? (
                "Configuration"
              ) : (
                <>
                  <span class="sm:hidden">Configuration</span>
                  <span class="hidden sm:inline">Configuration preference</span>
                </>
              )
            }
            for={id("configuration_preference")}
            compact={compact()}
          >
            <Show
              when={props.configurations?.length}
              fallback={<input name="configuration_preference" id={id("configuration_preference")} class={input(false)} placeholder="e.g. 3 BHK" />}
            >
              <select name="configuration_preference" id={id("configuration_preference")} class={input(false)}>
                <option value="">Any configuration</option>
                <For each={props.configurations}>{(c) => <option value={c}>{c}</option>}</For>
              </select>
            </Show>
          </Field>
        </div>

        <Field label="Message" for={id("message")} compact={compact()}>
          <textarea name="message" id={id("message")} rows={compact() ? "2" : "3"} class={input(false)} placeholder="Anything specific you're looking for?" />
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
          {submitting() ? "Sending…" : props.submitLabel ?? "Send Message"}
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

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

export default function LeadForm(props: {
  projectSlug?: string;
  citySlug?: string;
  configurations?: string[];
  heading?: string;
  subheading?: string;
}) {
  const [submitting, setSubmitting] = createSignal(false);
  const [done, setDone] = createSignal(false);
  const [purpose, setPurpose] = createSignal<LeadPurpose | "">("investment");
  const [formError, setFormError] = createSignal<string | null>(null);
  const [fieldErrors, setFieldErrors] = createSignal<Record<string, string>>({});

  onMount(() => captureAttribution());

  const errFor = (name: string) => fieldErrors()[name];

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
          <Field label="Full name" name="name" error={errFor("name")}>
            <input name="name" id="name" required class={inputCls(!!errFor("name"))} placeholder="Your name" autocomplete="name" />
          </Field>
          <Field label="Phone" name="phone" required error={errFor("phone")}>
            <input name="phone" id="phone" required type="tel" inputmode="tel" class={inputCls(!!errFor("phone"))} placeholder="+91 98xxxxxxxx" autocomplete="tel" />
          </Field>
        </div>

        <Field label="Email" name="email" error={errFor("email")}>
          <input name="email" id="email" type="email" class={inputCls(!!errFor("email"))} placeholder="you@email.com" autocomplete="email" />
        </Field>

        {/* Purpose — surfaced prominently for the investor audience */}
        <div>
          <label class="mb-1.5 block text-sm font-medium text-navy">Purpose</label>
          <div class="grid grid-cols-3 gap-2">
            <For each={PURPOSES}>
              {(p) => (
                <button
                  type="button"
                  onClick={() => setPurpose(p.value)}
                  aria-pressed={purpose() === p.value}
                  class={`rounded-[8px] border px-3 py-2.5 text-left transition-colors ${
                    purpose() === p.value
                      ? "border-gold bg-gold/10"
                      : "border-line bg-card hover:border-gold-soft"
                  }`}
                >
                  <span class="block text-sm font-semibold text-navy">{p.label}</span>
                  <span class="block text-xs text-slate">{p.hint}</span>
                </button>
              )}
            </For>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <Field label="Budget min (₹)" name="budget_min">
            <input name="budget_min" id="budget_min" type="number" min="0" step="100000" class={inputCls(false)} placeholder="e.g. 5000000" />
          </Field>
          <Field label="Budget max (₹)" name="budget_max">
            <input name="budget_max" id="budget_max" type="number" min="0" step="100000" class={inputCls(false)} placeholder="e.g. 20000000" />
          </Field>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <Field label="Timeline" name="timeline">
            <select name="timeline" id="timeline" class={inputCls(false)}>
              <option value="">Select timeline</option>
              <For each={TIMELINES}>{(t) => <option value={t.value}>{t.label}</option>}</For>
            </select>
          </Field>
          <Field label="Configuration preference" name="configuration_preference">
            <Show
              when={props.configurations?.length}
              fallback={<input name="configuration_preference" id="configuration_preference" class={inputCls(false)} placeholder="e.g. 3 BHK" />}
            >
              <select name="configuration_preference" id="configuration_preference" class={inputCls(false)}>
                <option value="">Any configuration</option>
                <For each={props.configurations}>{(c) => <option value={c}>{c}</option>}</For>
              </select>
            </Show>
          </Field>
        </div>

        <Field label="Message" name="message">
          <textarea name="message" id="message" rows="3" class={inputCls(false)} placeholder="Anything specific you're looking for?" />
        </Field>

        {/* Mandatory DPDP consent */}
        <div>
          <label class="flex cursor-pointer items-start gap-2.5 text-sm text-slate">
            <input type="checkbox" name="consent" class="mt-0.5 h-4 w-4 shrink-0 accent-[#1E7A54]" />
            <span>
              I agree to be contacted by EstatePortal and its verified partners about
              this enquiry via call, SMS, WhatsApp or email, and I consent to the
              processing of my personal data for this purpose under the Digital
              Personal Data Protection Act. This overrides any DND registration.
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

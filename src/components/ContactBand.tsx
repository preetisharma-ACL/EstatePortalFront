import { DEFAULT_DESK_PHONE } from "~/lib/contactPhone";
import ProjectEnquiryForm from "./ProjectEnquiryForm";

/**
 * Contact band — a full-bleed parallax section (fixed background image, navy
 * scrim) carrying a "Location Details" panel beside the project enquiry form.
 * The image stays fixed while the content scrolls over it. The fieldset itself
 * lives in ProjectEnquiryForm, shared with the hero banner card.
 *
 * Address is real project data; the phone/email/hours are portal defaults —
 * swap them for the desk that actually fields these enquiries. Pages fielded by
 * a different desk pass their own `phone` — see src/lib/contactPhone.ts.
 */
export default function ContactBand(props: {
  image: string;
  address: string;
  projectSlug?: string;
  citySlug?: string;
  /** Overrides the form heading — a township band isn't about one project. */
  heading?: string;
  /** Passed through to the lead's `message` (see ProjectEnquiryForm). */
  contextNote?: string;
  /** Overrides the portal default number for the desk that owns this page. */
  phone?: string;
  /** Sends a successful enquiry to this URL instead of confirming in place. */
  redirectTo?: string;
}) {
  return (
    <section class="relative isolate overflow-hidden">
      {/* Fixed parallax background */}
      <div
        class="absolute inset-0 bg-fixed bg-cover bg-center"
        style={`background-image:url('${props.image}')`}
        aria-hidden="true"
      />
      <div class="absolute inset-0 bg-navy-deep/85" aria-hidden="true" />

      <div class="relative mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-start">
        {/* Location Details */}
        <div class="border border-white/25 p-8 sm:p-10 lg:sticky lg:top-24">
          <h3 class="font-display text-2xl font-semibold text-white">Location Details</h3>
          <dl class="mt-7 space-y-6">
            <Detail label="Address">{props.address}</Detail>
            <Detail label="Phone">{props.phone ?? DEFAULT_DESK_PHONE}</Detail>
            <Detail label="Email">info@estateportal.in</Detail>
            <Detail label="Working Hours">
              Monday – Saturday
              <br />
              10:00 AM – 08:00 PM
            </Detail>
          </dl>
        </div>

        {/* Project enquiry form — full fieldset, on-image styling */}
        <div>
          <h3 class="font-display text-3xl font-semibold text-gold">
            {props.heading ?? "Enquire about this project"}
          </h3>
          <p class="mt-1.5 text-sm text-white/70">
            Get verified pricing, the brochure and an assisted site visit.
          </p>

          <ProjectEnquiryForm
            idPrefix="contact"
            class="mt-6"
            projectSlug={props.projectSlug}
            citySlug={props.citySlug}
            contextNote={props.contextNote}
            redirectTo={props.redirectTo}
          />
        </div>
      </div>
    </section>
  );
}

function Detail(props: { label: string; children: any }) {
  return (
    <div>
      <dt class="font-display text-lg font-semibold text-white">{props.label}</dt>
      <dd class="mt-1 text-sm leading-relaxed text-white/80">{props.children}</dd>
    </div>
  );
}

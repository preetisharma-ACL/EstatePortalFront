import ProjectEnquiryForm from "./ProjectEnquiryForm";

/**
 * Contact band — a full-bleed parallax section (fixed background image, navy
 * scrim) carrying a "Location Details" panel beside the project enquiry form.
 * The image stays fixed while the content scrolls over it. The fieldset itself
 * lives in ProjectEnquiryForm, shared with the hero banner card.
 *
 * Address is real project data; the phone/email/hours are portal defaults —
 * swap them for the desk that actually fields these enquiries.
 */
export default function ContactBand(props: {
  image: string;
  address: string;
  projectSlug?: string;
  citySlug?: string;
  configurations?: string[];
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
            <Detail label="Phone">+91 98990 55893</Detail>
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
          <h3 class="font-display text-3xl font-semibold text-gold">Enquire about this project</h3>
          <p class="mt-1.5 text-sm text-white/70">
            Get verified pricing, the brochure and an assisted site visit.
          </p>

          <ProjectEnquiryForm
            idPrefix="contact"
            class="mt-6"
            projectSlug={props.projectSlug}
            citySlug={props.citySlug}
            configurations={props.configurations}
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

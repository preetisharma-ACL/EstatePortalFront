// Single source of truth for the company/contact details quoted across the
// legal pages (privacy policy, terms). Edit here — both pages read from this.
//
// Values wrapped in «guillemets» are placeholders that MUST be filled in with
// the real registered particulars before these pages go live.

export const COMPANY = {
  /** Consumer-facing brand used throughout the site. */
  brand: "EstatePortal",
  /** Legal entity that operates the brand. */
  legalName: "Real Estate Aajneeti",
  /** Registered office — required on Indian consumer-facing legal pages. */
  address: "«Registered office address, city, state, PIN»",
  /** Company identification number / GSTIN, if the entity is incorporated. */
  cin: "«CIN / LLPIN / GSTIN»",

  email: "realestate@aajneeti.social",
  /** Not displayed anywhere at the moment — the footer and the Why page both
      have their phone rows commented out. Kept for when the number goes live. */
  phone: "+91 98990 55893",
  phoneHref: "+919899055893",
  website: "realestate.aajneeti.social",

  /** DPDP Act, 2023 s.13 + IT Rules, 2021 r.3(2) require a named officer. */
  grievanceOfficer: "«Name of Grievance Officer»",
  grievanceEmail: "grievance@aajneeti.social",

  /** Courts named in the governing-law clause of the Terms. */
  jurisdiction: "New Delhi",

  /** Shown on both legal pages. Bump whenever the text changes materially. */
  effectiveDate: "3 August 2026",
} as const;

// EstatePortal API - TypeScript contract
// Generated from the Django/DRF backend. All endpoints are under /api/v1/.
//
// CONTRACT NOTE - DECIMALS ARE STRINGS.
// DRF serializes DecimalField to a STRING by default (COERCE_DECIMAL_TO_STRING).
// So bhk, carpet_area, saleable_area, price_per_sqft, area_min/area_max,
// latitude and longitude arrive as strings ("2.0", "1250.50"). Integer money
// fields (price, price_min, price_max) arrive as numbers. Parse decimals with
// Number()/parseFloat before any math or comparison. The types below reflect
// this precisely - do not "fix" the string types.

export type ProjectType = "residential" | "commercial" | "mixed";
export type ProjectStatus =
  | "prelaunch" | "under_construction" | "ready_to_move" | "completed";
export type ConfigCategory = "residential" | "commercial";
export type ConfigSubType =
  | "studio" | "1bhk" | "2bhk" | "3bhk" | "4bhk" | "5bhk"
  | "penthouse" | "villa" | "plot"
  | "office" | "retail" | "showroom" | "warehouse" | "coworking" | "sco";
export type ReraStatus = "registered" | "applied" | "expired";
export type LeadTimeline = "immediate" | "3_6" | "6_12" | "exploring";
export type LeadPurpose = "investment" | "end_use" | "both";
export type LeadPropertyType = "residential" | "commercial" | "mixed";
export type MediaType =
  | "gallery" | "floor_plan" | "master_plan" | "location_map" | "video";
export type DocType =
  | "brochure" | "rera_certificate" | "price_sheet" | "floor_plan_pdf";
// "township" spans multiple sectors and multiple developers; its members are
// resolved through Locality.parent, so use ?township= to list them — never a
// name search (see ProjectFilters.township).
export type LocalityType = "locality" | "sector" | "micromarket" | "township";
/**
 * Whether a price is confirmed. Drives the price list and the headline figure:
 * anything but `verified` prints the LABEL instead of the number, even when a
 * number exists.
 */
export type PriceStatus = "verified" | "not_verified" | "on_request";

/** Splits location advantages into the two tables the template specifies. */
export type LocationCategory =
  | "connectivity" | "school" | "hospital" | "shopping" | "employment";

/** Provenance of a distance or travel time. */
export type LocationSource = "verified" | "marketing" | "unverified";

export type AmenityCategory =
  | "sports" | "safety" | "convenience" | "leisure" | "environment" | "connectivity";

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Country {
  id: number; name: string; slug: string;
  iso_code: string; currency_code: string;
}
export interface State {
  id: number; name: string; slug: string; country: string;
  rera_authority_name: string; rera_portal_url: string;
}
export interface CityList {
  id: number; name: string; slug: string;
  state: string; state_slug: string; tier: 1 | 2 | 3;
  // Absolute URL when the city has a hero photo, else null (schema declares it
  // required/uri, but the API serializes an empty image as null). CityDetail
  // inherits this field. Falls back to a gradient tile when null.
  image: string | null;
}
export interface CityDetail extends CityList {
  latitude: string | null; longitude: string | null;
  locality_count: number;
  meta_title: string; meta_description: string; og_image: string | null;
}
export interface Locality {
  id: number; name: string; slug: string;
  locality_type: LocalityType;
  city: string; city_slug: string; parent: number | null;
  /**
   * Desk number for this locality, set per township in the admin. ALWAYS
   * present, empty string when unset — which is the common case today. Empty
   * means render no call CTA at all, not a placeholder.
   */
  contact_phone: string;
  latitude: string | null; longitude: string | null;
  meta_title: string; meta_description: string;
}

export interface LocationStub {
  locality: string; locality_slug: string;
  city: string; city_slug: string;
  state: string; state_slug: string;
}

export interface DeveloperList {
  id: number; name: string; slug: string;
  logo: string | null; established_year: number | null;
  is_verified: boolean; project_count: number;
}
export interface DeveloperDetail {
  id: number; name: string; slug: string;
  description: string; logo: string | null; website: string;
  established_year: number | null; headquarters: string;
  is_verified: boolean; project_count: number;
  meta_title: string; meta_description: string; og_image: string | null;
}
export interface DeveloperStub {
  name: string; slug: string; logo: string | null; is_verified: boolean;
}

export interface Amenity {
  id: number; name: string; slug: string;
  category: AmenityCategory; icon: string;
}
export interface Configuration {
  id: number;
  category: ConfigCategory;
  sub_type: ConfigSubType;
  sub_type_display: string;
  bhk: string | null;
  carpet_area: string | null;
  saleable_area: string | null;
  area_unit: string;
  price: number | null;
  price_per_sqft: string | null;
  /**
   * Whether the price on this row is confirmed. An unverified price must be
   * LABELLED, never printed as if confirmed and never silently dropped —
   * portals disagree with each other and with the developer, so "we don't
   * know" is a publishable answer and is the credibility of the page.
   */
  price_status: PriceStatus;
  price_status_display: string;
  floor_plan: string | null;
  is_available: boolean;
}
export interface ReraRegistration {
  id: number; rera_number: string; phase: string;
  status: ReraStatus; valid_till: string | null; source_url: string;
  state: string;
  authority: string;
  registration_date: string | null;
  /**
   * The company registered against the project, which is often NOT the brand
   * marketing it. Blank means they are the same — fall back to the developer.
   */
  promoter: string;
  /** Can differ from the marketed project_type. Show both; do not reconcile. */
  registered_project_type: string;
  proposed_start_date: string | null;
  declared_completion_date: string | null;
  district: string;
  tehsil: string;
  registered_address: string;
  /**
   * ZERO IS MEANINGFUL — "zero complaints" — and null means nobody checked.
   * Rendering null as 0 would publish a claim we have not verified.
   */
  complaints_count: number | null;
  /**
   * When this record was last read off the RERA portal. Records change, so the
   * block carries its own as-of date rather than implying it is current.
   */
  record_checked_on: string | null;
}
export interface ProjectMedia {
  id: number; media_type: MediaType;
  image: string | null; video_url: string;
  caption: string; is_cover: boolean; order: number;
}
export interface ProjectDocument {
  id: number; doc_type: DocType; title: string; file: string;
}

// Luxury-listing extras. The backend serializes these ordered by `order`, so
// render them as received. Empty arrays / null scalars mean "not provided" —
// the detail page hides the corresponding section rather than showing it blank.
export interface LocationAdvantage {
  id: number; label: string; time_or_distance: string; order: number;
  /** Splits the two tables: connectivity, vs everything else. */
  category: LocationCategory;
  category_display: string;
  distance: string;
  travel_time: string;
  /**
   * Where the timing came from. A marketing estimate must print AS one — the
   * difference between a claim and a measurement is the point, so this is never
   * dropped to tidy the table.
   */
  source: LocationSource;
  source_display: string;
}
export interface KeyFeature {
  id: number; title: string; description: string; order: number;
}
export interface ProjectFAQ {
  id: number; question: string; answer: string; order: number;
}

/**
 * A dated construction or approval milestone.
 *
 * `date_label` is what gets printed ("06 May 2026", "Q1 2026-27").
 * `happened_on` exists only to order the list and may be approximate — never
 * format it for display, or an approximate date acquires a false precision.
 */
export interface ProjectUpdate {
  id: number;
  happened_on: string | null;
  date_label: string;
  title: string;
  detail: string;
  order: number;
}

/** A fit-and-finish line, grouped by room or trade. */
export interface Specification {
  id: number;
  category: string;
  category_display: string;
  detail: string;
  order: number;
}

/**
 * One facet of the investment case.
 *
 * The set deliberately includes Main Risks and Investment Conclusion. Those are
 * not to be styled as positives, and not to be dropped when the section runs
 * long — a balanced analysis that quietly loses its risks is worse than none.
 */
export interface InvestmentPoint {
  id: number;
  aspect: string;
  aspect_display: string;
  detail: string;
  order: number;
}

/**
 * Whether the project suits an audience, and why.
 *
 * `is_suitable: false` means a POOR fit and the detail is a caveat. It must
 * read differently from a positive — a studio project saying "not suited to
 * families" is the section doing its job, not an error to hide.
 */
export interface BuyerProfile {
  id: number;
  audience: string;
  audience_display: string;
  detail: string;
  is_suitable: boolean;
}

/**
 * Why pick THIS project — the argument, as distinct from the facts.
 *
 * Deliberately its own field rather than folded into the others, and the
 * rendering keeps the distinction:
 *
 *   highlights_list      facts        "Approx. 17.212-acre parcel"
 *   key_features         what it IS   Concept, Design, Open Spaces
 *   why_choose_points    why PICK it  the case against a comparable project
 *   considerations_list  the caveats  "price not verified"
 *
 * Merging these into highlights would mix arguments with the factual bullets
 * that sit on all 361 projects and weaken both.
 */
export interface WhyChoosePoint {
  id: number;
  title: string;
  /** Backs the title up. May be blank — the title alone still stands. */
  detail: string;
  order: number;
}

/** A comparable project, read from the real record so the row can link to it. */
export interface NearbyProject {
  id: number;
  name: string;
  slug: string;
  locality: string;
  city: string;
  configurations_summary: string[];
  price_min: number | null;
  price_max: number | null;
  price_status: PriceStatus;
  price_status_display: string;
  status: ProjectStatus;
  status_display: string;
}

export interface ProjectListItem {
  id: number; name: string; slug: string;
  developer: string; developer_slug: string;
  project_type: ProjectType; status: ProjectStatus;
  possession_date: string | null;
  price_min: number | null; price_max: number | null;
  area_min: string | null; area_max: string | null;
  location: LocationStub;
  cover_image: string | null;
  primary_rera: string | null;
  configurations_summary: string[];
  is_featured: boolean;
  // ISO 8601 with offset. Present on the LIST serializer, so `-created_at`
  // results can be re-sorted client-side after merging several responses.
  created_at: string;
}
export interface ProjectDetail {
  id: number; name: string; slug: string;
  /** Short line under the name, e.g. "Studio Apartments & Commercial Shops". */
  tagline: string;
  /**
   * The company registered against the project, as distinct from the brand
   * marketing it. NOT interchangeable with `developer` — buyers are told to
   * check the promoter specifically. Blank means they are the same.
   */
  legal_promoter: string;
  /** Percent complete from the latest RERA QPR, e.g. 1.92. Null when unknown. */
  construction_progress: number | null;
  /** Governs the headline price the same way it governs each price-list row. */
  price_status: PriceStatus;
  project_type: ProjectType; status: ProjectStatus;
  possession_date: string | null; launched_on: string | null;
  address: string;
  /**
   * Desk number for this project, set per project in the admin. ALWAYS present,
   * empty string when unset. Empty means render no call CTA — see
   * src/lib/contactPhone.ts.
   */
  contact_phone: string;
  latitude: string | null; longitude: string | null;
  description: string; highlights_list: string[];
  price_min: number | null; price_max: number | null;
  area_min: string | null; area_max: string | null;
  // Luxury-listing facts. Decimal land area arrives as a string (see contract
  // note above); towers/units as nullable numbers; labels as (possibly empty) strings.
  land_area_value: string | null; land_area_unit: string;
  total_towers: number | null; total_units: number | null;
  floors_label: string; possession_label: string;
  developer: DeveloperStub;
  location: LocationStub;
  configurations: Configuration[];
  rera_registrations: ReraRegistration[];
  amenities: Amenity[];
  media: ProjectMedia[];
  documents: ProjectDocument[];
  location_advantages: LocationAdvantage[];
  key_features: KeyFeature[];
  faqs: ProjectFAQ[];
  /**
   * Advantages AND things to consider, as one block of HTML.
   *
   * The SEO team writes both halves into this single field with their own
   * bold sub-headings, and their content doc treats it as one section — so
   * this is not the "downsides" counterpart to highlights_list that the
   * earlier array was. Rendering it under a consider-the-downsides heading
   * would invert the meaning of everything above the second sub-heading.
   *
   * Sanitised server-side: p, br, strong, em, h3, ul, ol, li, a[href]. h2 is
   * excluded so their sub-headings cannot collide with the section's own.
   */
  considerations: string;
  /** HTML, like `description`. Written once per locality, shared by its projects. */
  locality_about: string;
  /**
   * Plain text, per project: where this project sits and what that means.
   * Distinct from `locality_about`, which is about the locality generally and
   * is shared by every project in it.
   */
  location_description: string;
  updates: ProjectUpdate[];
  specifications: Specification[];
  investment_points: InvestmentPoint[];
  buyer_profiles: BuyerProfile[];
  nearby_projects: NearbyProject[];
  why_choose_points: WhyChoosePoint[];
  /**
   * This project's Google Ads conversion action, or null when it has no label
   * configured. Only useful for pre-loading a DIFFERENT Ads account's base tag
   * before a submit — the authoritative copy is the one on the lead response,
   * which reflects the project the lead was actually attributed to.
   */
  conversion: ConversionConfig | null;
  meta_title: string; meta_description: string; og_image: string | null;
}

export type AutocompleteType = "city" | "locality" | "project" | "developer";
export interface AutocompleteItem {
  type: AutocompleteType; label: string; slug: string; url: string;
}
export interface AutocompleteResponse {
  query: string; results: AutocompleteItem[];
}

export interface ProjectFilters {
  city?: string; state?: string; locality?: string; developer?: string;
  /**
   * Locality slug. Returns that locality AND every descendant (sectors,
   * pockets) via the Locality.parent tree — a database relationship, so a
   * project merely addressed "opposite <township>" is structurally excluded.
   * An unknown slug returns 0 results, never an unfiltered list.
   *
   * This is the ONLY correct way to list a township's projects. `search` is
   * fuzzy text for a search box and must never be used for membership.
   */
  township?: string;
  project_type?: ProjectType; status?: ProjectStatus;
  bhk?: number; sub_type?: ConfigSubType;
  min_price?: number; max_price?: number;
  min_area?: number; max_area?: number;
  amenity?: string; is_featured?: boolean;
  search?: string;
  ordering?:
    | "price_min" | "-price_min"
    | "created_at" | "-created_at"
    | "possession_date" | "-possession_date";
  page?: number; page_size?: number;
}

export interface LeadPayload {
  name: string; phone: string; email?: string;
  project_slug?: string; city_slug?: string;
  budget?: number; // single budget figure, INR
  property_type?: LeadPropertyType;
  timeline?: LeadTimeline; purpose?: LeadPurpose;
  configuration_preference?: string; message?: string;
  utm_source?: string; utm_medium?: string; utm_campaign?: string;
  utm_term?: string; utm_content?: string;
  gclid?: string; fbclid?: string; landing_page?: string;
  /**
   * The page the form was actually submitted from. `landing_page` is
   * first-touch for the whole session, so on a multi-page visit the two differ
   * — and the backend prefers this one for attribution and CRM routing. Not
   * derivable server-side: the API is cross-origin, so Referer arrives stripped
   * to the bare origin.
   */
  submitted_page?: string;
  consent_given: true;
}
/**
 * The Google Ads conversion action a completed enquiry reports to.
 *
 * A conversion is `<account>/<label>`. The account is shared across campaigns;
 * the label is what makes one project's conversion distinct — so per-project
 * config is normally just a label inheriting the shared account. The backend
 * assembles both halves into `send_to`.
 */
export interface ConversionConfig {
  /** Ready-assembled `<account>/<label>` — pass straight to gtag. */
  send_to: string;
  /** Conversion value. Per project and editable in the admin — never hardcode. */
  value: number | null;
  /**
   * ISO currency for `value`; Google Ads rejects a value without one. Null
   * whenever `value` is null — an action that has never carried a value must
   * keep not carrying one, or its history in Ads changes retroactively.
   */
  currency: string | null;
  /**
   * The account half of `send_to`, on its own — the account that must be
   * registered on the page before the event can carry this `send_to`. Usually
   * the shared account; a project on its own Ads account differs here.
   *
   * The payload makes no claim about whether it is already registered — that is
   * a property of the document, which the backend cannot observe. Pass it to
   * ensureAdsAccount() and let that decide.
   */
  conversion_id: string;
}

export interface LeadResponse extends LeadPayload {
  id: number;
  /**
   * Conversion action for the project this lead was ATTRIBUTED to, which is not
   * always the project whose page it was submitted from. Null when that project
   * has no label configured, or when the lead has no project at all (homepage,
   * township, city and search enquiries). Null means fire nothing — not an error.
   */
  conversion: ConversionConfig | null;
}

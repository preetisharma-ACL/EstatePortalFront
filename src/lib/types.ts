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
export type MediaType =
  | "gallery" | "floor_plan" | "master_plan" | "location_map" | "video";
export type DocType =
  | "brochure" | "rera_certificate" | "price_sheet" | "floor_plan_pdf";
export type LocalityType = "locality" | "sector" | "micromarket";
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
  floor_plan: string | null;
  is_available: boolean;
}
export interface ReraRegistration {
  id: number; rera_number: string; phase: string;
  status: ReraStatus; valid_till: string | null; source_url: string;
  state: string;
  authority: string;
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
}
export interface KeyFeature {
  id: number; title: string; description: string; order: number;
}
export interface ProjectFAQ {
  id: number; question: string; answer: string; order: number;
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
}
export interface ProjectDetail {
  id: number; name: string; slug: string;
  project_type: ProjectType; status: ProjectStatus;
  possession_date: string | null; launched_on: string | null;
  address: string;
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
  budget_min?: number; budget_max?: number;
  timeline?: LeadTimeline; purpose?: LeadPurpose;
  configuration_preference?: string; message?: string;
  utm_source?: string; utm_medium?: string; utm_campaign?: string;
  utm_term?: string; utm_content?: string;
  gclid?: string; fbclid?: string; landing_page?: string;
  consent_given: true;
}
export interface LeadResponse extends LeadPayload { id: number; }

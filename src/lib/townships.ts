// Township landing pages — content registry.
//
// The backend has no township model (LocalityType is locality | sector |
// micromarket), so a township's identity — name, hero imagery, about copy,
// headline stats — is authored here. The project listing on each page is NOT
// authored here: it is fetched live from /projects/?search=<searchTerm>, so a
// newly published project appears on its township page without a code change.
//
// TO ADD A TOWNSHIP: append one entry to TOWNSHIPS. Nothing else to wire up —
// /township/<slug> starts resolving immediately, and any slug not listed here
// renders a 404.
//
// CONTENT NOTE: the `stats`, `about` and `highlights` below are marketing copy,
// not API data. Have the content team verify acreage, tower counts and
// connectivity timings against the developer's own material before go-live.

export interface TownshipStat {
  label: string;
  value: string;
}

export interface TownshipHighlight {
  title: string;
  description: string;
}

export interface Township {
  slug: string;
  name: string;
  /** Hero eyebrow — the micro-market, e.g. "Greater Noida West". */
  tagline: string;
  /** Master developer, shown under the title. Omit when it's a multi-developer township. */
  developer?: string;

  /**
   * City slug as it exists in the backend. Drives the breadcrumb link and is
   * sent as `city_slug` on every lead raised from this page, so it MUST match a
   * real city record — otherwise the lead lands without a city.
   */
  citySlug: string;
  cityName: string;

  /**
   * Passed to /projects/?search=. The backend matches this against project
   * name, developer and locality, so keep it broad enough to catch every phase
   * ("Gaur City" catches 1st/2nd/... Avenue) but narrow enough not to drag in
   * unrelated inventory. Verify what it returns before publishing a page.
   */
  searchTerm: string;

  /**
   * Hero backdrop images, served from src/public (e.g.
   * "/township/gaur-city-1.jpg"). Leave empty to use the site's stock banners —
   * BannerSlideshow also falls back on its own if a file is missing or is too
   * small to work as a hero.
   */
  heroImages: string[];

  /**
   * CSS object-position for the hero crop. A wide banner can only show a slim
   * horizontal band of a tall or square image, so set this when the part worth
   * showing isn't in the middle — "top", "center 30%", "bottom" etc.
   * Default: centre.
   */
  heroPosition?: string;

  /** Address line for the contact band. */
  address: string;

  metaTitle: string;
  metaDescription: string;

  /** Glass chips in the hero. Keep to 3–4 — more wraps badly on mobile. */
  stats: TownshipStat[];
  /** About section body, one string per paragraph. */
  about: string[];
  /** "Why buy here" cards under the about copy. */
  highlights: TownshipHighlight[];
}

export const TOWNSHIPS: Record<string, Township> = {
  "gaur-city": {
    slug: "gaur-city",
    name: "Gaur City",
    tagline: "Greater Noida West",
    developer: "Gaursons India",
    citySlug: "noida",
    cityName: "Noida",
    searchTerm: "Gaur City",
    heroImages: [],
    address: "Gaur City, Greater Noida West Link Road, Greater Noida West, Uttar Pradesh 201318",
    metaTitle: "Gaur City, Greater Noida West — Projects, Price & Floor Plans | EstatePortal",
    metaDescription:
      "Explore RERA-verified projects in Gaur City, Greater Noida West. Compare 2, 3 and 4 BHK apartments, prices, floor plans and possession dates across every Gaur City avenue.",
    stats: [
      { label: "Township", value: "237 acres" },
      { label: "Location", value: "Greater Noida West" },
      { label: "Inventory", value: "RERA-verified" },
    ],
    about: [
      "Gaur City is an integrated township developed by Gaursons India along the Greater Noida West Link Road, spread across roughly 237 acres and planned in two phases — Gaur City 1 and Gaur City 2. It is one of the largest self-contained residential addresses in the Noida Extension belt, built around a mix of mid-rise and high-rise apartment towers.",
      "The township is designed to keep daily life inside its own boundary. A retail mall, schools, healthcare, a sports complex and landscaped open spaces sit within the campus, so residents are not dependent on the surrounding sectors for essentials. Wide internal roads and a gated, single-entry layout keep through-traffic out of the residential clusters.",
      "For buyers, Gaur City offers a rare combination in this micro-market: a completed, occupied township with an established resident community, alongside newer phases that are still releasing inventory. That mix makes it equally relevant to end-users who want to move in now and to investors tracking rental demand from the Noida and Greater Noida employment corridors.",
    ],
    highlights: [
      {
        title: "Direct link-road connectivity",
        description:
          "Positioned on the Greater Noida West Link Road, with access towards Noida sectors, the Noida–Greater Noida Expressway and onward to Delhi via the FNG corridor.",
      },
      {
        title: "Self-contained social infrastructure",
        description:
          "Gaur City Mall, schools, clinics and a sports complex sit inside the township, so schooling, shopping and healthcare are all within walking distance.",
      },
      {
        title: "An occupied, proven township",
        description:
          "Large parts of the township are complete and lived in — buyers can inspect finished towers and a working community rather than buying purely off a brochure.",
      },
      {
        title: "Deep, liquid resale and rental market",
        description:
          "Scale and occupancy give the township one of the most active resale and rental markets in Greater Noida West, which matters when it's time to exit.",
      },
    ],
  },

  "wave-city": {
    slug: "wave-city",
    name: "Wave City",
    tagline: "NH-9, Ghaziabad",
    developer: "Wave Infratech",
    citySlug: "ghaziabad",
    cityName: "Ghaziabad",
    searchTerm: "Wave City",
    heroImages: [],
    address: "Wave City, NH-9 (Delhi–Meerut Expressway), Ghaziabad, Uttar Pradesh 201002",
    metaTitle: "Wave City, Ghaziabad — Plots, Apartments & Villas on NH-9 | EstatePortal",
    metaDescription:
      "RERA-verified projects in Wave City, Ghaziabad. Compare plots, floors, apartments and villas on NH-9 (Delhi–Meerut Expressway) with prices, layouts and possession timelines.",
    stats: [
      { label: "Township", value: "Hi-tech city" },
      { label: "Location", value: "NH-9, Ghaziabad" },
      { label: "Inventory", value: "RERA-verified" },
    ],
    about: [
      "Wave City is a large planned township by Wave Infratech on NH-9, the Delhi–Meerut Expressway corridor in Ghaziabad. Developed under Uttar Pradesh's hi-tech city policy, it is master-planned as a full city rather than a single gated colony — with its own road grid, utility network, commercial districts and phased residential pockets.",
      "The product mix is unusually broad for the region. Alongside apartment towers, the township offers residential plots, independent floors and villas, which lets buyers choose between a ready home and building to their own plan. Plotted inventory in particular has driven much of the long-term interest here.",
      "The Delhi–Meerut Expressway is the township's defining advantage. It has materially cut drive times towards East Delhi and the Ghaziabad city centre, and has pulled sustained investor attention to addresses sitting directly on the corridor. With the RRTS corridor and expressway improvements reshaping the region, Wave City sits in one of the more actively developing growth pockets of NCR.",
    ],
    highlights: [
      {
        title: "On the Delhi–Meerut Expressway",
        description:
          "Frontage on the NH-9 corridor gives a fast, signal-free run towards East Delhi, with onward connectivity to Meerut and the wider western UP belt.",
      },
      {
        title: "Plots, floors, villas and apartments",
        description:
          "One of the few NCR townships offering the full spread of formats, so buyers can pick between ready-built homes and building on their own plot.",
      },
      {
        title: "Master-planned hi-tech city",
        description:
          "Developed under the UP hi-tech city policy with its own internal road network, utility infrastructure and planned commercial and institutional zones.",
      },
      {
        title: "A long-horizon growth corridor",
        description:
          "Expressway and RRTS-led infrastructure upgrades continue to reshape this stretch of Ghaziabad, which is what draws investors to the corridor.",
      },
    ],
  },

  "aditya-world-city": {
    slug: "aditya-world-city",
    name: "Aditya World City",
    tagline: "NH-24, Ghaziabad",
    developer: "Aditya Group",
    citySlug: "ghaziabad",
    cityName: "Ghaziabad",
    searchTerm: "Aditya World City",
    // Landscape entrance photo (1709×920) — composed for a wide crop, with the
    // gate just below the midline, so the default centre framing keeps sky,
    // signage and approach road all in frame.
    heroImages: ["/banner/adityaworldcity.png"],
    address: "Aditya World City, NH-24, Bamheta, Ghaziabad, Uttar Pradesh 201002",
    metaTitle: "Aditya World City, Ghaziabad — Projects, Price & Layouts | EstatePortal",
    metaDescription:
      "Explore RERA-verified projects in Aditya World City, NH-24 Ghaziabad. Compare apartments, floors and plots with prices, layouts and possession dates in one place.",
    stats: [
      { label: "Township", value: "Integrated" },
      { label: "Location", value: "NH-24, Ghaziabad" },
      { label: "Inventory", value: "RERA-verified" },
    ],
    about: [
      "Aditya World City is an integrated township by the Aditya Group on NH-24 in Ghaziabad, laid out as a gated, self-contained address combining residential clusters with retail, institutional and recreational space. It sits on the same Delhi–Meerut Expressway corridor that has redrawn accessibility across this side of Ghaziabad.",
      "The township is planned around a central spine of open landscape, with residential formats ranging from apartments to independent floors and plotted development. Internal social infrastructure — a school, a club, retail streets and sports facilities — is built into the master plan rather than left to the surrounding area.",
      "Its position makes it a practical option for buyers working across East Delhi, Noida and Ghaziabad who want township living at a lower entry price than the equivalent inside Noida. RERA-registered inventory across multiple phases means there is usually something available at several different budget points.",
    ],
    highlights: [
      {
        title: "NH-24 expressway address",
        description:
          "Direct access to the Delhi–Meerut Expressway corridor, with a straightforward run towards East Delhi and connectivity onward to Noida.",
      },
      {
        title: "Township living, entry-level pricing",
        description:
          "Gated township infrastructure at a materially lower per-square-foot entry point than comparable addresses inside Noida.",
      },
      {
        title: "Amenities inside the master plan",
        description:
          "School, club, retail street and sports facilities are planned within the township rather than depending on the surrounding neighbourhood.",
      },
      {
        title: "Multiple formats and budgets",
        description:
          "Apartments, independent floors and plotted inventory across phases, so the township covers several buyer profiles at once.",
      },
    ],
  },
};

/** All townships, in registry order — for index pages and nav menus. */
export const townshipList = (): Township[] => Object.values(TOWNSHIPS);

/** Resolve a township by slug, or null when the slug isn't in the registry. */
export const getTownship = (slug: string): Township | null =>
  TOWNSHIPS[slug.toLowerCase()] ?? null;

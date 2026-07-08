# EstatePortal — Frontend

SolidStart 1.x + TypeScript + TailwindCSS v4, SSR enabled. A pan-India real-estate
discovery + lead-generation portal (residential **and** commercial) that consumes
the Django/DRF backend at `{API_BASE}/api/v1/`.

## Requirements

- Node.js ≥ 20 (22 LTS recommended)
- The **Django backend running and reachable** — this frontend renders no data
  without it.

## Setup

```bash
npm install
cp .env.example .env    # then point both URLs at the backend
npm run dev             # http://localhost:3000
```

### Environment (`.env`)

| Var | Used by | Purpose |
| --- | --- | --- |
| `API_BASE_URL` | SSR / route preload (server) | Base URL the server uses for data loading |
| `VITE_API_BASE_URL` | Browser (client) | Base URL for client-side calls (autocomplete, lead submit) |

Point both at wherever the backend runs — `http://localhost:8000` locally, or a
shared dev URL. Both default to `http://localhost:8000`.

> **Dev port & CORS.** The backend allows CORS for `http://localhost:3000`, so run
> the dev server on **3000**. SSR reads are server-side and unaffected by CORS, but
> client-side calls (autocomplete, lead POST) need the frontend origin in the
> backend's `CORS_ALLOWED_ORIGINS`. If 3000 is occupied and Vite falls back to 3001,
> either free 3000 or add the fallback origin to the backend allowlist.

## Scripts

- `npm run dev` — dev server (SSR)
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run typecheck` — `tsc --noEmit`

## Architecture

- **`src/lib/types.ts`** — the backend contract (verbatim). DRF `DecimalField`s
  arrive as **strings** (`bhk`, areas, `price_per_sqft`, lat/lng); integer money
  fields (`price`, `price_min/max`) are numbers. Parse decimals with `Number()`.
- **`src/lib/api.ts`** — the only place raw `fetch` lives. SSR-safe base-URL
  resolution (server `process.env`, client `import.meta.env`).
- **`src/lib/queries.ts`** — `query()` wrappers for route `preload` + `createAsync`,
  so every public read is SSR'd (the SEO point — verify with view-source).
- **`src/lib/format.ts`** — INR (lakh/crore, Indian grouping), price/area ranges.
- **`src/lib/filters.ts`** — URL query params ⇄ `ProjectFilters`. Filters live in
  the URL (shareable + SSR-able); the grid reads them back.
- **`src/lib/attribution.ts`** — captures UTM / gclid / fbclid on landing, persists
  in `sessionStorage`, and stamps every lead payload + `landing_page`.

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Home — hero + collections + featured + investor strip + trust band + cities + enquiry |
| `/search` | Discovery: filter rail + sortable grid, driven entirely by URL query |
| `/[city]` | City landing (SEO) + results grid pre-filtered to the city |
| `/[city]/[locality]` | Locality landing + results grid scoped to the locality |
| `/project/[slug]` | Project detail: gallery, configs, RERA seal + registrations, amenities, developer, lead form |
| `/developer/[slug]` | Developer profile + their projects |
| `/developers` | Developer directory |

## Design tokens

`navy #16294B`, `navy-deep #0E1B33`, `gold #C2A15A`, `gold-soft #D8BE86`,
`green #1E7A54`, `paper #F7F7F5`, `card #FFFFFF`, `line #E8E7E2`, `slate #5B6472`.
Fonts: **Fraunces** (display), **Manrope** (UI/body), **IBM Plex Mono** (RERA
numbers only). The RERA verified-seal + navy trust band are the visual signature.

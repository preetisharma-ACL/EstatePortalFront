// Formatting helpers.
// Money fields (price, price_min, price_max) arrive as NUMBERS.
// Decimal fields (bhk, areas, price_per_sqft, lat/lng) arrive as STRINGS —
// always parse with Number()/num() before any math, and guard nulls.

const CRORE = 10_000_000;
const LAKH = 100_000;

/** Parse a DRF string-decimal (or null) into a finite number, else null. */
export function num(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * INR with Indian grouping + lakh/crore shorthand.
 *  24_000_000 -> "₹2.40 Cr"
 *   8_500_000 -> "₹85.00 L"
 *      45_000 -> "₹45,000"
 */
export function formatINR(value: number | null | undefined): string {
  const n = num(value ?? null);
  if (n === null) return "Price on request";
  if (n >= CRORE) return `₹${(n / CRORE).toFixed(2)} Cr`;
  if (n >= LAKH) return `₹${(n / LAKH).toFixed(2)} L`;
  return `₹${indianGroup(Math.round(n))}`;
}

/** Indian digit grouping (12,34,567) for a whole number. */
export function indianGroup(n: number): string {
  const neg = n < 0;
  const s = Math.abs(Math.round(n)).toString();
  if (s.length <= 3) return (neg ? "-" : "") + s;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3);
  const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return (neg ? "-" : "") + grouped + "," + last3;
}

/**
 * Price-range display.
 *  (min, max) -> "₹X – ₹Y"     (collapses to "₹X" when equal)
 *  (min, null) -> "₹X onwards"
 *  (null, null) -> "Price on request"
 */
export function priceRange(
  min: number | null | undefined,
  max: number | null | undefined,
): string {
  const lo = num(min ?? null);
  const hi = num(max ?? null);
  if (lo !== null && hi !== null) {
    return lo === hi ? formatINR(lo) : `${formatINR(lo)} – ${formatINR(hi)}`;
  }
  if (lo !== null) return `${formatINR(lo)} onwards`;
  if (hi !== null) return `Up to ${formatINR(hi)}`;
  return "Price on request";
}

/**
 * Area range using string decimals + a unit (e.g. "sq.ft.").
 *  ("1250.00", "1875.50", "sq.ft.") -> "1,250 – 1,876 sq.ft."
 */
export function areaRange(
  min: string | null | undefined,
  max: string | null | undefined,
  unit = "sq.ft.",
): string | null {
  const lo = num(min ?? null);
  const hi = num(max ?? null);
  if (lo === null && hi === null) return null;
  const fmt = (v: number) => indianGroup(Math.round(v));
  if (lo !== null && hi !== null) {
    return lo === hi ? `${fmt(lo)} ${unit}` : `${fmt(lo)} – ${fmt(hi)} ${unit}`;
  }
  return `${fmt((lo ?? hi)!)} ${unit}`;
}

/** Price per sq.ft. from a string decimal. */
export function pricePerSqft(value: string | null | undefined): string | null {
  const n = num(value ?? null);
  if (n === null) return null;
  return `₹${indianGroup(Math.round(n))}/sq.ft.`;
}

const STATUS_LABEL: Record<string, string> = {
  prelaunch: "New Launch",
  under_construction: "Under Construction",
  ready_to_move: "Ready to Move",
  completed: "Completed",
};
export function statusLabel(s: string): string {
  return STATUS_LABEL[s] ?? titleCase(s);
}

const TYPE_LABEL: Record<string, string> = {
  residential: "Residential",
  commercial: "Commercial",
  mixed: "Mixed-use",
};
export function typeLabel(t: string): string {
  return TYPE_LABEL[t] ?? titleCase(t);
}

export function titleCase(s: string): string {
  return s
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** "2028-06-30" -> "Jun 2028"; null -> null. */
export function possession(date: string | null | undefined): string | null {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

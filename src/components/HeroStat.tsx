/**
 * Compact glass stat pill for the dark page banners (city, search).
 * Single-line rather than a stacked tile — stacked tiles dominate the banner
 * height. flex-row-reverse shows the value first while keeping `dt` before
 * `dd` in the DOM, so the markup stays a valid description list.
 *
 * Render inside a <dl>.
 */
export default function HeroStat(props: { label: string; value: string }) {
  return (
    <div class="inline-flex flex-row-reverse items-baseline gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 backdrop-blur-sm">
      <dt class="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/70">
        {props.label}
      </dt>
      <dd class="font-display text-[15px] font-semibold text-white">{props.value}</dd>
    </div>
  );
}

/** Small green verified tick for verified developers. */
export default function VerifiedTick(props: { class?: string; size?: number }) {
  const s = props.size ?? 15;
  return (
    <svg
      class={`inline-block shrink-0 text-green ${props.class ?? ""}`}
      viewBox="0 0 24 24"
      width={s}
      height={s}
      fill="none"
      stroke="currentColor"
      stroke-width="2.2"
      stroke-linecap="round"
      stroke-linejoin="round"
      role="img"
      aria-label="Verified"
    >
      <circle cx="12" cy="12" r="9.5" />
      <path d="M8.4 12.2l2.4 2.4 4.6-4.9" />
    </svg>
  );
}

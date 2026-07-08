import { A } from "@solidjs/router";

/** Graceful fallback when a backend read fails (e.g. API unreachable). */
export default function DataError(props: { reset?: () => void }) {
  return (
    <div class="mx-auto max-w-xl px-4 py-24 text-center">
      <div class="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold/15 text-gold">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
        </svg>
      </div>
      <h1 class="mt-5 font-display text-2xl font-semibold text-navy">
        We couldn't load this right now
      </h1>
      <p class="mt-2 text-slate">
        The property catalogue is temporarily unavailable. Please try again in a
        moment.
      </p>
      <div class="mt-6 flex items-center justify-center gap-3">
        {props.reset && (
          <button
            type="button"
            onClick={props.reset}
            class="rounded-[8px] bg-gold px-5 py-2.5 text-sm font-semibold text-navy transition-transform hover:-translate-y-0.5"
          >
            Try again
          </button>
        )}
        <A href="/" class="rounded-[8px] border border-navy/25 px-5 py-2.5 text-sm font-semibold text-navy hover:bg-navy hover:text-white">
          Back to home
        </A>
      </div>
    </div>
  );
}

import { A } from "@solidjs/router";
import { HttpStatusCode } from "@solidjs/start";
import { Title } from "@solidjs/meta";

/** Graceful 404 for a missing slug (sets a real 404 status for crawlers). */
export default function NotFound(props: { kind?: string }) {
  const label = props.kind ?? "page";
  return (
    <div class="mx-auto max-w-xl px-4 py-24 text-center">
      <Title>Not found | EstatePortal</Title>
      <HttpStatusCode code={404} />
      <p class="eyebrow">404</p>
      <h1 class="mt-3 font-display text-3xl font-semibold text-navy">
        This {label} isn't listed
      </h1>
      <p class="mt-2 text-slate">
        It may have been removed or the link is incorrect. Explore our RERA-verified
        catalogue instead.
      </p>
      <div class="mt-6 flex items-center justify-center gap-3">
        <A href="/search" class="rounded-[8px] bg-gold px-5 py-2.5 text-sm font-semibold text-navy transition-transform hover:-translate-y-0.5">
          Browse projects
        </A>
        <A href="/" class="rounded-[8px] border border-navy/25 px-5 py-2.5 text-sm font-semibold text-navy hover:bg-navy hover:text-white">
          Back to home
        </A>
      </div>
    </div>
  );
}

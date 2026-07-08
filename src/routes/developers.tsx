import {
  createAsync, useSearchParams, type RouteDefinition,
} from "@solidjs/router";
import { Title, Meta, Link } from "@solidjs/meta";
import { createMemo, For, Show } from "solid-js";
import { developersQuery } from "~/lib/queries";
import DeveloperCard from "~/components/DeveloperCard";

export const route = {
  preload: ({ location }) => {
    const q = location.query as Record<string, string>;
    void developersQuery({ search: q.search, page: q.page ? Number(q.page) : 1 });
  },
} satisfies RouteDefinition;

export default function DevelopersPage() {
  const [sp, setParams] = useSearchParams();
  const params = createMemo(() => ({
    search: (sp.search as string) || undefined,
    page: sp.page ? Number(sp.page) : 1,
  }));
  const data = createAsync(() => developersQuery(params()));

  return (
    <>
      <Title>RERA-verified developers across India | EstatePortal</Title>
      <Meta name="description" content="Browse verified real-estate developers across India — their track record, project count and live inventory." />
      <Link rel="canonical" href="/developers" />

      <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <header class="mb-8">
          <p class="eyebrow">Trusted names</p>
          <h1 class="mt-2 font-display text-3xl font-semibold text-navy sm:text-4xl">Developers</h1>
          <p class="mt-2 max-w-2xl text-slate">Established builders with verified track records and RERA-registered projects.</p>
        </header>

        <div class="mb-6 max-w-md">
          <input
            type="search"
            placeholder="Search developers"
            value={(sp.search as string) ?? ""}
            class="w-full rounded-[8px] border border-line bg-card px-4 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-gold/40"
            onInput={(e) => setParams({ search: e.currentTarget.value || null, page: null }, { scroll: false })}
          />
        </div>

        <Show when={data()} fallback={<p class="text-slate">Loading developers…</p>}>
          <Show
            when={data()!.results.length}
            fallback={<p class="rounded-[12px] border border-dashed border-line bg-card p-8 text-center text-slate">No developers found.</p>}
          >
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <For each={data()!.results}>{(d) => <DeveloperCard developer={d} />}</For>
            </div>
          </Show>
        </Show>
      </div>
    </>
  );
}

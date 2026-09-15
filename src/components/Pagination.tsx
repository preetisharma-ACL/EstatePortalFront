import { Show } from "solid-js";
import type { Paginated } from "~/lib/types";

/** Page size is a backend setting, so derive it from the response rather than
    hardcoding it here — a stale constant overstates the page count and walks
    Next straight into a 404. A page with a successor is by definition full, so
    its length is the page size; on the last page the earlier pages give it. */
function pageSizeOf(data: Paginated<unknown>, page: number): number {
  if (data.next) return data.results.length;
  if (page > 1) return Math.ceil((data.count - data.results.length) / (page - 1));
  return data.results.length;
}

export default function Pagination(props: {
  data: Paginated<unknown> | undefined;
  page: number;
  setParam: (key: string, value: string | number | undefined) => void;
}) {
  const totalPages = () => {
    const d = props.data;
    if (!d || !d.count) return 1;
    const size = pageSizeOf(d, props.page);
    return size > 0 ? Math.max(1, Math.ceil(d.count / size)) : 1;
  };

  return (
    <Show when={props.data && totalPages() > 1}>
      <nav class="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
        <PageBtn
          disabled={props.page <= 1}
          onClick={() => props.setParam("page", props.page - 1 <= 1 ? undefined : props.page - 1)}
        >
          ← Prev
        </PageBtn>
        <span class="px-3 text-sm text-slate">
          Page <span class="font-semibold text-navy">{props.page}</span> of {totalPages()}
        </span>
        {/* `next` is authoritative: trust it over the derived count. */}
        <PageBtn
          disabled={!props.data!.next}
          onClick={() => props.setParam("page", props.page + 1)}
        >
          Next →
        </PageBtn>
      </nav>
    </Show>
  );
}

function PageBtn(props: { disabled: boolean; onClick: () => void; children: any }) {
  return (
    <button
      type="button"
      disabled={props.disabled}
      onClick={props.onClick}
      class="rounded-[8px] border border-line bg-card px-4 py-2 text-sm font-semibold text-navy transition-colors hover:border-gold disabled:cursor-not-allowed disabled:opacity-40"
    >
      {props.children}
    </button>
  );
}

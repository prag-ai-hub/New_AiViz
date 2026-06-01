import { useInfiniteQuery } from "@tanstack/react-query";
import { listEntries } from "@/features/library/api";
import type { NotebookEntry, Paginated } from "@/features/library/types";

type Filters = {
  tool?: string;
  tag?: string;
  q?: string;
};

export const notebookKey = (filters: Filters) =>
  ["notebook", "entries", filters] as const;

function nextPageFrom(next: string | null): number | null {
  if (!next) return null;
  try {
    const url = new URL(next);
    const p = url.searchParams.get("page");
    return p ? Number(p) : null;
  } catch {
    return null;
  }
}

export function useNotebookEntries(filters: Filters = {}) {
  return useInfiniteQuery<Paginated<NotebookEntry>>({
    queryKey: notebookKey(filters),
    queryFn: ({ pageParam = 1 }) =>
      listEntries({
        page: pageParam as number,
        tool: filters.tool,
        tag: filters.tag,
        q: filters.q,
      }),
    initialPageParam: 1,
    getNextPageParam: (last) => nextPageFrom(last.next),
  });
}

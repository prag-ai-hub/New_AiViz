import { useInfiniteQuery } from "@tanstack/react-query";
import { listImages } from "@/features/image-gen/api";
import type { ImageAsset, Paginated } from "@/features/image-gen/types";

export const historyKey = ["image", "history"] as const;

function nextPageFrom(next: string | null): number | null {
  if (!next) return null;
  try {
    const url = new URL(next);
    const page = url.searchParams.get("page");
    return page ? Number(page) : null;
  } catch {
    return null;
  }
}

export function useImageHistory() {
  return useInfiniteQuery<Paginated<ImageAsset>>({
    queryKey: historyKey,
    queryFn: ({ pageParam = 1 }) => listImages(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (last) => nextPageFrom(last.next),
  });
}

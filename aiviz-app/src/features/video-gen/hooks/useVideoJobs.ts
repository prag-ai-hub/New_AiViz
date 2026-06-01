import { useInfiniteQuery } from "@tanstack/react-query";
import { listVideoJobs } from "@/features/video-gen/api";
import type { Paginated, VideoJob } from "@/features/video-gen/types";

export const videoJobsKey = ["video", "jobs"] as const;

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

export function useVideoJobs() {
  return useInfiniteQuery<Paginated<VideoJob>>({
    queryKey: videoJobsKey,
    queryFn: ({ pageParam = 1 }) => listVideoJobs(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (last) => nextPageFrom(last.next),
    refetchOnWindowFocus: false,
  });
}

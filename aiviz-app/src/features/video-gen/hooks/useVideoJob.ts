import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { showToast } from "@/core/providers";
import { getVideoJob } from "@/features/video-gen/api";
import { isActive, type VideoJob } from "@/features/video-gen/types";
import { videoJobsKey } from "./useVideoJobs";

export const videoJobKey = (id: number) => ["video", "job", id] as const;

/**
 * React Query auto-polls in-flight jobs every 5 seconds and stops once the
 * job lands on a terminal state. A ref-guard fires a one-shot success toast
 * when the local cache flips from active -> succeeded so users get a ping
 * even when the screen has been backgrounded.
 */
export function useVideoJob(id: number | null) {
  const qc = useQueryClient();
  const lastStatusRef = useRef<string | null>(null);

  const query = useQuery<VideoJob>({
    queryKey: id == null ? ["video", "job", "noop"] : videoJobKey(id),
    queryFn: () => getVideoJob(id as number),
    enabled: id != null,
    refetchInterval: (q) => {
      const data = q.state.data as VideoJob | undefined;
      if (!data) return 5000;
      return isActive(data.status) ? 5000 : false;
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const next = query.data?.status ?? null;
    const prev = lastStatusRef.current;
    if (prev && next && prev !== next && next === "succeeded") {
      showToast.success({
        title: "Video ready",
        message: "Tap to view in your queue.",
      });
      qc.invalidateQueries({ queryKey: videoJobsKey });
    }
    if (next) lastStatusRef.current = next;
  }, [query.data?.status, qc]);

  return query;
}

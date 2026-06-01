import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showToast } from "@/core/providers";
import { cancelVideoJob } from "@/features/video-gen/api";
import type { VideoJob } from "@/features/video-gen/types";
import { videoJobKey } from "./useVideoJob";
import { videoJobsKey } from "./useVideoJobs";

export function useCancelVideoJob() {
  const qc = useQueryClient();

  return useMutation<VideoJob, unknown, number>({
    mutationFn: (id) => cancelVideoJob(id),
    onSuccess: (job) => {
      qc.setQueryData(videoJobKey(job.id), job);
      qc.invalidateQueries({ queryKey: videoJobsKey });
      showToast.info({ title: "Job canceled" });
    },
    onError: () => {
      showToast.error({
        title: "Could not cancel",
        message: "The job has already started.",
      });
    },
  });
}

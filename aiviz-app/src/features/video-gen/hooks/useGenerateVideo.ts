import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ApiError } from "@/core/api";
import { showToast } from "@/core/providers";
import { generateVideo } from "@/features/video-gen/api";
import type { GenerateVideoRequest, VideoJob } from "@/features/video-gen/types";
import { videoJobsKey } from "./useVideoJobs";

export function useGenerateVideo(opts?: {
  onSuccess?: (job: VideoJob) => void;
}) {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation<VideoJob, unknown, GenerateVideoRequest>({
    mutationFn: (req) => generateVideo(req),
    onSuccess: (job) => {
      qc.invalidateQueries({ queryKey: videoJobsKey });
      qc.setQueryData(["video", "job", job.id], job);
      showToast.info({
        title: "Video queued",
        message: "Generating your clip — this takes about a minute.",
      });
      opts?.onSuccess?.(job);
    },
    onError: (err) => {
      const status = err instanceof ApiError ? err.status : undefined;
      if (status === 409) {
        showToast.info({
          title: "Already generating",
          message: "Wait for your current video to finish before starting another.",
        });
      } else if (status === 402) {
        showToast.error({
          title: "Daily limit reached",
          message: "Tap to upgrade for more video generations.",
        });
        router.push("/(tabs)/profile/billing" as never);
      } else if (status === 503) {
        showToast.error({
          title: "Video service offline",
          message: "Server is missing fal.ai or OpenAI credentials.",
        });
      } else {
        showToast.error({
          title: "Generation failed",
          message: "Please try again.",
        });
      }
    },
  });
}

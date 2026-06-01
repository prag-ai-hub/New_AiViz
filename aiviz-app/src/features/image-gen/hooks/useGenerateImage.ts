import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ApiError } from "@/core/api";
import { showToast } from "@/core/providers";
import { generateImage } from "@/features/image-gen/api";
import type { GenerateRequest, ImageAsset } from "@/features/image-gen/types";
import { historyKey } from "./useImageHistory";

export function useGenerateImage(opts?: { onSuccess?: (asset: ImageAsset) => void }) {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation<ImageAsset, unknown, GenerateRequest>({
    mutationFn: (req) => generateImage(req),
    onSuccess: (asset) => {
      qc.invalidateQueries({ queryKey: historyKey });
      showToast.success({ title: "Image ready" });
      opts?.onSuccess?.(asset);
    },
    onError: (err) => {
      const status = err instanceof ApiError ? err.status : undefined;
      if (status === 402) {
        showToast.error({
          title: "Daily limit reached",
          message: "Tap to upgrade for unlimited generations.",
        });
        router.push("/(tabs)/profile/billing" as never);
      } else if (status === 503) {
        showToast.error({
          title: "Image service offline",
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

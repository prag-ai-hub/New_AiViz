import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ApiError } from "@/core/api";
import { showToast } from "@/core/providers";
import { updateProfileApi } from "@/features/profile/api";
import type { ProfilePatchPayload } from "@/features/onboarding/types";

export function useUpdateProfile() {
  const router = useRouter();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: ProfilePatchPayload) => updateProfileApi(patch),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["me"] });
      showToast.success({ title: "Profile updated" });
      router.back();
    },
    onError: (err) => {
      const code = err instanceof ApiError ? err.code : "network_error";
      showToast.error({
        title: "Update failed",
        message: code === "validation_error" ? "Some values were rejected." : "Please try again.",
      });
    },
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ApiError } from "@/core/api";
import { showToast } from "@/core/providers";
import { saveOnboarding } from "@/features/onboarding/services";

export function useSaveOnboarding() {
  const router = useRouter();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveOnboarding,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["me"] });
      showToast.success({ title: "Profile saved" });
      router.replace("/(tabs)/dashboard");
    },
    onError: (err) => {
      const code = err instanceof ApiError ? err.code : "network_error";
      showToast.error({
        title: "Couldn't save profile",
        message: code === "validation_error" ? "Some values were rejected." : "Please try again.",
      });
    },
  });
}

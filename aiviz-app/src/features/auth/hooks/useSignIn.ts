import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ApiError } from "@/core/api";
import { showToast } from "@/core/providers";
import { routeAfterAuth, signIn } from "@/features/auth/services";
import type { LoginPayload } from "@/features/auth/types";

const ERROR_LABEL: Record<string, string> = {
  invalid_credentials: "Wrong email or password.",
  user_inactive: "This account has been deactivated.",
};

export function useSignIn() {
  const router = useRouter();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: LoginPayload) => signIn(payload),
    onSuccess: async (res) => {
      showToast.success({ title: `Welcome back, ${res.user.first_name || res.user.email}` });
      await qc.invalidateQueries({ queryKey: ["me"] });
      const dest = await routeAfterAuth();
      router.replace(dest);
    },
    onError: (err) => {
      const code = err instanceof ApiError ? err.code : "network_error";
      showToast.error({ title: "Sign in failed", message: ERROR_LABEL[code] ?? "Please try again." });
    },
  });
}

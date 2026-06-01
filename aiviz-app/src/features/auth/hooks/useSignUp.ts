import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ApiError } from "@/core/api";
import { showToast } from "@/core/providers";
import { routeAfterAuth, signUp } from "@/features/auth/services";
import type { SignupPayload } from "@/features/auth/types";

const ERROR_LABEL: Record<string, string> = {
  duplicate_account: "An account with that email or phone already exists.",
  invalid: "Please check the form for errors.",
  weak_password:
    "Password must be 8+ characters with at least one letter and one digit.",
  invalid_phone: "Phone must be in E.164 format (e.g. +919876543210).",
  network_error: "Couldn't reach the server. Is it running on :8000?",
};

function firstFieldError(detail: unknown): string | null {
  if (!detail || typeof detail !== "object") return null;
  // DRF wraps field errors as { field: [ "message", ... ], ... }
  for (const [field, value] of Object.entries(detail as Record<string, unknown>)) {
    if (Array.isArray(value) && value.length) {
      const msg = typeof value[0] === "string" ? value[0] : String(value[0]);
      return field === "non_field_errors" ? msg : `${field}: ${msg}`;
    }
    if (typeof value === "string") return `${field}: ${value}`;
  }
  return null;
}

export function useSignUp() {
  const router = useRouter();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SignupPayload) => signUp(payload),
    onSuccess: async () => {
      showToast.success({ title: "Welcome to AIVIZ" });
      await qc.invalidateQueries({ queryKey: ["me"] });
      // New signups always have a null profile → force onboarding.
      const dest = await routeAfterAuth({ forceOnboarding: true });
      router.replace(dest);
    },
    onError: (err) => {
      const apiErr = err instanceof ApiError ? err : null;
      const code = apiErr?.code ?? "network_error";
      const fieldMessage =
        code === "invalid" || code === "validationerror"
          ? firstFieldError(apiErr?.detail)
          : null;
      const message =
        fieldMessage ?? ERROR_LABEL[code] ?? "Please try again.";
      showToast.error({ title: "Sign up failed", message });
    },
  });
}

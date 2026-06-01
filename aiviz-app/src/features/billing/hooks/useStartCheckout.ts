import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/core/api";
import { showToast } from "@/core/providers";
import { startCheckout } from "@/features/billing/services";
import type { PlanCode } from "@/features/billing/types";

const ERROR_LABEL: Record<string, string> = {
  payments_not_configured: "Payments aren't configured on this server yet.",
  plan_not_found: "That plan can't be purchased.",
};

export function useStartCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (planCode: PlanCode) => startCheckout(planCode),
    onSuccess: async () => {
      // Whether they actually paid is decided server-side via the webhook.
      // Just re-fetch subscription + quota; the user will see Pro flip when the webhook arrives.
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["billing", "subscription"] }),
        qc.invalidateQueries({ queryKey: ["billing", "quota"] }),
      ]);
      showToast.info({
        title: "Payment window closed",
        message: "Your plan will refresh once Razorpay confirms.",
      });
    },
    onError: (err) => {
      const code = err instanceof ApiError ? err.code : "network_error";
      showToast.error({
        title: "Checkout failed",
        message: ERROR_LABEL[code] ?? "Please try again.",
      });
    },
  });
}

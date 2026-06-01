import { useQuery } from "@tanstack/react-query";
import { getSubscriptionApi } from "@/features/billing/api";
import { useAuthStore } from "@/features/auth/state";

export function useSubscription() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ["billing", "subscription"],
    queryFn: getSubscriptionApi,
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}

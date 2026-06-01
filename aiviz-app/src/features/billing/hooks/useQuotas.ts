import { useQuery } from "@tanstack/react-query";
import { getQuotaApi } from "@/features/billing/api";
import { useAuthStore } from "@/features/auth/state";
import type { QuotaLimit, QuotaSnapshot } from "@/features/billing/types";

const EMPTY: QuotaLimit = { used: 0, limit: null, remaining: null };

export function useQuotas() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const q = useQuery<QuotaSnapshot>({
    queryKey: ["billing", "quota"],
    queryFn: getQuotaApi,
    enabled: isAuthenticated,
    staleTime: 15_000,
  });

  function limitFor(toolKey: string): QuotaLimit {
    return q.data?.limits[toolKey] ?? EMPTY;
  }

  return { ...q, limitFor };
}

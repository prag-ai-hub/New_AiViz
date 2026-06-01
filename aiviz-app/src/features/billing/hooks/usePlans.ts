import { useQuery } from "@tanstack/react-query";
import { listPlansApi } from "@/features/billing/api";

export function usePlans() {
  return useQuery({
    queryKey: ["billing", "plans"],
    queryFn: listPlansApi,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

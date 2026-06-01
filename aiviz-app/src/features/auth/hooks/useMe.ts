import { useQuery } from "@tanstack/react-query";
import { meApi } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/state";

export function useMe() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ["me"],
    queryFn: meApi,
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}

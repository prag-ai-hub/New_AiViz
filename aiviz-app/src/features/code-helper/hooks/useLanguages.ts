import { useQuery } from "@tanstack/react-query";
import { getLanguages } from "@/features/code-helper/api";

export const languagesKey = ["code", "languages"] as const;

export function useLanguages() {
  return useQuery({
    queryKey: languagesKey,
    queryFn: getLanguages,
    staleTime: 1000 * 60 * 30, // 30 min; grade rarely changes
  });
}

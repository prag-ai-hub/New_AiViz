import { useQuery } from "@tanstack/react-query";
import { listTags } from "@/features/library/api";

export function useTags() {
  return useQuery({
    queryKey: ["notebook", "tags"] as const,
    queryFn: listTags,
    staleTime: 60_000,
  });
}

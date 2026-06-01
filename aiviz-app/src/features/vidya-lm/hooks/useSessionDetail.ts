import { useQuery } from "@tanstack/react-query";
import { getSession } from "@/features/vidya-lm/api";

export const sessionDetailKey = (id: number) =>
  ["lm", "session", id] as const;

export function useSessionDetail(id: number | null) {
  return useQuery({
    queryKey: sessionDetailKey(id ?? 0),
    queryFn: () => getSession(id as number),
    enabled: id != null,
  });
}

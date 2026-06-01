import { useQuery } from "@tanstack/react-query";
import { listSessions } from "@/features/vidya-lm/api";

export const sessionsKey = ["lm", "sessions"] as const;

export function useSessions() {
  return useQuery({
    queryKey: sessionsKey,
    queryFn: listSessions,
  });
}

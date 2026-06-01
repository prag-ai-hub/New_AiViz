import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showToast } from "@/core/providers";
import { createSession } from "@/features/vidya-lm/api";
import { sessionsKey } from "./useSessions";

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (title?: string) => createSession(title),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sessionsKey });
    },
    onError: () => {
      showToast.error({ title: "Couldn't start chat", message: "Please try again." });
    },
  });
}

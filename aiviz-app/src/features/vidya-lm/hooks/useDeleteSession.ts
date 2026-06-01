import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showToast } from "@/core/providers";
import { deleteSession } from "@/features/vidya-lm/api";
import { sessionDetailKey } from "./useSessionDetail";
import { sessionsKey } from "./useSessions";

export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteSession(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: sessionsKey });
      qc.removeQueries({ queryKey: sessionDetailKey(id) });
      showToast.success({ title: "Chat deleted" });
    },
    onError: () => {
      showToast.error({ title: "Delete failed", message: "Please try again." });
    },
  });
}

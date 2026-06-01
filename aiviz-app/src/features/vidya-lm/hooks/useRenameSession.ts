import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showToast } from "@/core/providers";
import { patchSessionTitle } from "@/features/vidya-lm/api";
import { sessionDetailKey } from "./useSessionDetail";
import { sessionsKey } from "./useSessions";

export function useRenameSession(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (title: string) => patchSessionTitle(id, title),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sessionsKey });
      qc.invalidateQueries({ queryKey: sessionDetailKey(id) });
    },
    onError: () => {
      showToast.error({ title: "Rename failed" });
    },
  });
}

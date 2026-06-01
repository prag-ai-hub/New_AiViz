import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showToast } from "@/core/providers";
import { deleteEntry } from "@/features/library/api";

export function useDeleteEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteEntry(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notebook", "entries"] });
      showToast.success({ title: "Removed from notebook" });
    },
    onError: () => {
      showToast.error({ title: "Delete failed", message: "Please try again." });
    },
  });
}

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { showToast } from "@/core/providers";
import { continueWith } from "@/features/library/api";
import type { ContinueTarget } from "@/features/library/types";

type Args = { id: number; target: ContinueTarget };

export function useContinueWith() {
  const router = useRouter();
  return useMutation({
    mutationFn: ({ id, target }: Args) => continueWith(id, target),
    onSuccess: (data) => {
      // Coerce all values to strings for Expo Router params.
      const params: Record<string, string> = {};
      for (const [k, v] of Object.entries(data.params)) {
        params[k] = String(v);
      }
      router.push({ pathname: data.route as never, params: params as never });
    },
    onError: () => {
      showToast.error({
        title: "Couldn't open that tool",
        message: "This transition isn't supported yet.",
      });
    },
  });
}

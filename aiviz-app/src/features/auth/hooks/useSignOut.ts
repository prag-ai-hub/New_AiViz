import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { signOut } from "@/features/auth/services";

export function useSignOut() {
  const router = useRouter();
  const qc = useQueryClient();
  return useCallback(async () => {
    await signOut();
    qc.clear();
    router.replace("/(auth)/login");
  }, [qc, router]);
}

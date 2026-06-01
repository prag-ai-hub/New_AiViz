import { clearTokens } from "@/core/storage";
import { useAuthStore } from "@/features/auth/state";

export async function signOut(): Promise<void> {
  await clearTokens();
  useAuthStore.getState().signOut();
}

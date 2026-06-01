import { setTokens } from "@/core/storage";
import { googleApi } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/state";
import type { AuthResponse } from "@/features/auth/types";

export async function googleSignIn(idToken: string): Promise<AuthResponse> {
  const res = await googleApi({ id_token: idToken });
  await setTokens(res.tokens.access, res.tokens.refresh);
  const store = useAuthStore.getState();
  store.setUser(res.user);
  store.setAuthenticated(true);
  return res;
}

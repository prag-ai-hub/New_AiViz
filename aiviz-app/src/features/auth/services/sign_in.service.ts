import { setTokens } from "@/core/storage";
import { loginApi } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/state";
import type { AuthResponse, LoginPayload } from "@/features/auth/types";

export async function signIn(payload: LoginPayload): Promise<AuthResponse> {
  const res = await loginApi(payload);
  await setTokens(res.tokens.access, res.tokens.refresh);
  const store = useAuthStore.getState();
  store.setUser(res.user);
  store.setAuthenticated(true);
  return res;
}

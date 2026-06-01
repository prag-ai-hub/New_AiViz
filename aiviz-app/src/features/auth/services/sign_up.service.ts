import { setTokens } from "@/core/storage";
import { signupApi } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/state";
import type { AuthResponse, SignupPayload } from "@/features/auth/types";

export async function signUp(payload: SignupPayload): Promise<AuthResponse> {
  const res = await signupApi(payload);
  await setTokens(res.tokens.access, res.tokens.refresh);
  const store = useAuthStore.getState();
  store.setUser(res.user);
  store.setAuthenticated(true);
  return res;
}

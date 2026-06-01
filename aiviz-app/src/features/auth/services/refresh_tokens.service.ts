import { getRefreshToken, setTokens } from "@/core/storage";
import { refreshApi } from "@/features/auth/api";

/** Used by the axios interceptor. Returns the new access token. Throws on failure. */
export async function refreshTokens(): Promise<string> {
  const refresh = await getRefreshToken();
  if (!refresh) throw new Error("No refresh token");
  const next = await refreshApi(refresh);
  await setTokens(next.access, next.refresh);
  return next.access;
}

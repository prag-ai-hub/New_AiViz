import { getAccessToken } from "@/core/storage";
import { meApi } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/state";

/** Boot-time: read access token, set isAuthenticated, optionally fetch /me. Always sets hydrated=true at the end. */
export async function hydrateAuth(): Promise<void> {
  const store = useAuthStore.getState();
  try {
    const token = await getAccessToken();
    if (!token) {
      store.setAuthenticated(false);
      return;
    }
    store.setAuthenticated(true);
    try {
      const { user } = await meApi();
      store.setUser(user);
    } catch {
      // /me may 401 — the axios interceptor will run refresh-or-clear on its own.
      // If clear happens, isAuthenticated flips back to false via the sign-out path.
    }
  } finally {
    store.setHydrated(true);
  }
}

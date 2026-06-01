import { useAuthStore } from "@/features/auth/state";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrated = useAuthStore((s) => s.hydrated);
  return { user, isAuthenticated, hydrated };
}

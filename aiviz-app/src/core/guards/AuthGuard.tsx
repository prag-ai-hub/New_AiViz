import { Redirect } from "expo-router";
import { ReactNode } from "react";
import { useAuthStore } from "@/features/auth/state";

export function AuthGuard({ children }: { children: ReactNode }) {
  const hydrated = useAuthStore((s) => s.hydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!hydrated) return null; // Splash holds the visual; this branch only renders if a protected route was deep-linked pre-hydration.
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;
  return <>{children}</>;
}

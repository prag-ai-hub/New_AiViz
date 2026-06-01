import { useMe } from "@/features/auth/hooks";
import { useAuthStore } from "@/features/auth/state";

export function useProfile() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrated = useAuthStore((s) => s.hydrated);
  const me = useMe();
  // When the query is disabled (not authenticated yet), me.isLoading is false but
  // data is undefined. Reflect that as "still loading" until auth has hydrated
  // AND the actual fetch has completed.
  const waitingForHydration = !hydrated;
  const waitingForFetch = isAuthenticated && me.isPending && !me.isError;
  return {
    user: me.data?.user ?? null,
    profile: me.data?.profile ?? null,
    isLoading: waitingForHydration || waitingForFetch,
    isAuthenticated,
    isError: me.isError,
    refetch: me.refetch,
  };
}

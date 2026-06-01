/** Module-local Promise dedup so a 401 storm triggers exactly one /auth/refresh call. */
let inflight: Promise<string> | null = null;

export function withSharedRefresh(run: () => Promise<string>): Promise<string> {
  if (inflight) return inflight;
  inflight = run().finally(() => {
    inflight = null;
  });
  return inflight;
}

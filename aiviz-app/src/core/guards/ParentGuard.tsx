import { ReactNode } from "react";

/** Day 1 stub: passes children through. Day 17 enforces role === 'parent'. */
export function ParentGuard({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

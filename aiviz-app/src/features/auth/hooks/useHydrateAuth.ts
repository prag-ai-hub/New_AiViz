import { useEffect } from "react";
import { hydrateAuth } from "@/features/auth/services";

export function useHydrateAuth() {
  useEffect(() => {
    void hydrateAuth();
  }, []);
}

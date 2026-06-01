import { useEffect, useState } from "react";
import { getSetting } from "@/core/storage";
import { useMe } from "./useMe";

/** True when the user has no grade yet AND they haven't tapped "I'll do this later". */
export function useShouldOnboard(): boolean {
  const me = useMe();
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    getSetting<boolean>("onboarding_dismissed", false).then((v) => {
      if (!cancelled) setDismissed(v);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // While either source is loading, return false to avoid a redirect race.
  if (!me.isSuccess || dismissed === null) return false;
  if (dismissed) return false;
  return me.data.profile?.grade == null;
}

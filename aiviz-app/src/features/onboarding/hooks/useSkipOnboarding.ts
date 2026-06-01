import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { skipOnboarding } from "@/features/onboarding/services";

export function useSkipOnboarding() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const skip = useCallback(async () => {
    setIsLoading(true);
    try {
      await skipOnboarding();
      router.replace("/(tabs)/dashboard");
    } finally {
      setIsLoading(false);
    }
  }, [router]);
  return { skip, isLoading };
}

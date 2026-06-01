import { setSetting } from "@/core/storage";
import { useOnboardingStore } from "@/features/onboarding/state";

/** User chose 'I'll do this later' — remember so we don't redirect them again on every cold boot. */
export async function skipOnboarding(): Promise<void> {
  await setSetting("onboarding_dismissed", true);
  useOnboardingStore.getState().reset();
}

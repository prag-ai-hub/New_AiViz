/** Step ordering — used by OnboardingShell to draw the progress bar and by Continue/Skip routing. */

export type OnboardingRoute =
  | "/(auth)/onboarding/grade"
  | "/(auth)/onboarding/board"
  | "/(auth)/onboarding/subjects"
  | "/(auth)/onboarding/language"
  | "/(auth)/onboarding/learning-style";

export const ONBOARDING_STEPS: readonly OnboardingRoute[] = [
  "/(auth)/onboarding/grade",
  "/(auth)/onboarding/board",
  "/(auth)/onboarding/subjects",
  "/(auth)/onboarding/language",
  "/(auth)/onboarding/learning-style",
];

export const ONBOARDING_STEP_COUNT = ONBOARDING_STEPS.length;

export function nextStep(current: OnboardingRoute): OnboardingRoute | null {
  const i = ONBOARDING_STEPS.indexOf(current);
  if (i < 0 || i === ONBOARDING_STEPS.length - 1) return null;
  return ONBOARDING_STEPS[i + 1];
}

export function stepIndex(current: OnboardingRoute): number {
  return ONBOARDING_STEPS.indexOf(current) + 1; // 1-based for display
}

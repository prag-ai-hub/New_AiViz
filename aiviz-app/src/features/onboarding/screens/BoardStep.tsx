import { useRouter } from "expo-router";
import {
  OnboardingFooter,
  OnboardingShell,
  OptionCard,
} from "@/features/onboarding/components";
import { BOARDS, stepIndex } from "@/features/onboarding/constants";
import { useOnboardingStore } from "@/features/onboarding/state";

export function BoardStep() {
  const router = useRouter();
  const board = useOnboardingStore((s) => s.board);
  const setBoard = useOnboardingStore((s) => s.setBoard);

  const goNext = () => router.push("/(auth)/onboarding/subjects");

  return (
    <OnboardingShell
      stepNumber={stepIndex("/(auth)/onboarding/board")}
      title="Which board do you follow?"
      subtitle="Your examples will match your syllabus."
      footer={
        <OnboardingFooter
          onPrimary={goNext}
          primaryDisabled={board === null}
          onSkipStep={goNext}
        />
      }
    >
      {BOARDS.map((b) => (
        <OptionCard
          key={b.value}
          title={b.label}
          selected={board === b.value}
          onPress={() => setBoard(b.value)}
        />
      ))}
    </OnboardingShell>
  );
}

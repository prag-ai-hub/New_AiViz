import { useState } from "react";
import {
  OnboardingFooter,
  OnboardingShell,
  QuizQuestion,
} from "@/features/onboarding/components";
import {
  QUIZ_QUESTION_COUNT,
  QUIZ_QUESTIONS,
  stepIndex,
  type LearningStyleValue,
} from "@/features/onboarding/constants";
import {
  useSaveOnboarding,
  useSkipOnboarding,
  useSubmitQuiz,
} from "@/features/onboarding/hooks";

export function LearningStyleStep() {
  const [answers, setAnswers] = useState<(LearningStyleValue | null)[]>(
    Array(QUIZ_QUESTION_COUNT).fill(null),
  );
  const submitQuiz = useSubmitQuiz();
  const saveOnboarding = useSaveOnboarding();
  const { skip: skipAllOnboarding, isLoading: skipping } = useSkipOnboarding();

  const setAt = (i: number, style: LearningStyleValue) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[i] = style;
      return next;
    });
  };

  const allAnswered = answers.every((a) => a !== null);
  const busy = submitQuiz.isPending || saveOnboarding.isPending || skipping;

  const onFinish = async () => {
    if (!allAnswered || busy) return;
    try {
      await submitQuiz.mutateAsync(answers as LearningStyleValue[]);
      saveOnboarding.mutate();
    } catch {
      // Both submitQuiz.onError and saveOnboarding.onError already surface a toast.
    }
  };

  // Skip-this-step on the LAST step = bypass entirely (no network call).
  // The "I'll do this later" link does the same, but Skip-this-step keeps the wizard's
  // footer affordance consistent across all 5 screens.
  const onSkipStep = () => {
    void skipAllOnboarding();
  };

  return (
    <OnboardingShell
      stepNumber={stepIndex("/(auth)/onboarding/learning-style")}
      title="How do you learn best?"
      subtitle="Four quick questions — pick the option closest to you."
      footer={
        <OnboardingFooter
          primaryLabel="Finish"
          onPrimary={onFinish}
          primaryDisabled={!allAnswered || busy}
          primaryLoading={busy}
          onSkipStep={onSkipStep}
        />
      }
    >
      {QUIZ_QUESTIONS.map((q, i) => (
        <QuizQuestion
          key={q.prompt}
          index={i + 1}
          question={q}
          value={answers[i]}
          onChange={(style) => setAt(i, style)}
        />
      ))}
    </OnboardingShell>
  );
}

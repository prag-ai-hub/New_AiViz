import { submitQuizApi, type QuizResponse } from "@/features/onboarding/api";
import type { LearningStyleValue } from "@/features/onboarding/constants";
import { useOnboardingStore } from "@/features/onboarding/state";

export async function submitLearningStyleQuiz(answers: LearningStyleValue[]): Promise<QuizResponse> {
  const res = await submitQuizApi(answers);
  useOnboardingStore.getState().setLearningStyle(res.learning_style);
  return res;
}

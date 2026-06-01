import { useMutation } from "@tanstack/react-query";
import { ApiError } from "@/core/api";
import { showToast } from "@/core/providers";
import type { LearningStyleValue } from "@/features/onboarding/constants";
import { submitLearningStyleQuiz } from "@/features/onboarding/services";

export function useSubmitQuiz() {
  return useMutation({
    mutationFn: (answers: LearningStyleValue[]) => submitLearningStyleQuiz(answers),
    onError: (err) => {
      const code = err instanceof ApiError ? err.code : "network_error";
      showToast.error({
        title: "Quiz submission failed",
        message: code === "validation_error" ? "Please answer all 4 questions." : "Please try again.",
      });
    },
  });
}

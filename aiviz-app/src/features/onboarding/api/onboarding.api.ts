import { apiClient } from "@/core/api";
import type { LearningStyleValue } from "@/features/onboarding/constants";
import type { Profile } from "@/features/auth/types";
import type { ProfilePatchPayload } from "@/features/onboarding/types";

export async function updateProfileApi(patch: ProfilePatchPayload): Promise<Profile> {
  const { data } = await apiClient.patch<Profile>("/auth/me/profile", patch);
  return data;
}

export type QuizResponse = {
  learning_style: LearningStyleValue;
  scores: Record<LearningStyleValue, number>;
};

export async function submitQuizApi(answers: LearningStyleValue[]): Promise<QuizResponse> {
  const { data } = await apiClient.post<QuizResponse>("/auth/me/learning-style-quiz", { answers });
  return data;
}

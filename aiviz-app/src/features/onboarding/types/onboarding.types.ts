import type { BoardValue, LanguageValue, LearningStyleValue } from "@/features/onboarding/constants";

export type OnboardingDraft = {
  grade: number | null;
  board: BoardValue | null;
  subjects: string[];
  lang: LanguageValue | null;
  learning_style: LearningStyleValue | null;
};

export type ProfilePatchPayload = Partial<OnboardingDraft> & { goals?: string[] };

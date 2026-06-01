import { create } from "zustand";
import type { BoardValue, LanguageValue, LearningStyleValue } from "@/features/onboarding/constants";
import type { OnboardingDraft } from "@/features/onboarding/types";

type Actions = {
  setGrade: (g: number | null) => void;
  setBoard: (b: BoardValue | null) => void;
  setSubjects: (s: string[]) => void;
  setLang: (l: LanguageValue | null) => void;
  setLearningStyle: (s: LearningStyleValue | null) => void;
  reset: () => void;
};

const empty: OnboardingDraft = {
  grade: null,
  board: null,
  subjects: [],
  lang: null,
  learning_style: null,
};

/** In-memory only. App kill mid-flow → user restarts; acceptable for a 5-step one-time wizard. */
export const useOnboardingStore = create<OnboardingDraft & Actions>((set) => ({
  ...empty,
  setGrade: (grade) => set({ grade }),
  setBoard: (board) => set({ board }),
  setSubjects: (subjects) => set({ subjects }),
  setLang: (lang) => set({ lang }),
  setLearningStyle: (learning_style) => set({ learning_style }),
  reset: () => set(empty),
}));

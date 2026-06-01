export const LANGUAGES = [
  { value: "en", label: "English",  hint: "English" },
  { value: "hi", label: "हिन्दी",    hint: "Hindi" },
  { value: "mr", label: "मराठी",     hint: "Marathi" },
] as const;

export type LanguageValue = (typeof LANGUAGES)[number]["value"];

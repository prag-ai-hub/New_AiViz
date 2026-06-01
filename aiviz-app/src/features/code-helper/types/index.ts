export type CodeAction = "suggest" | "explain" | "debug" | "tests";
export type CodeLanguage =
  | "scratch"
  | "html"
  | "css"
  | "javascript"
  | "python"
  | "sql";

export type LanguageItem = { value: CodeLanguage; label: string };
export type LanguagesResponse = { default: CodeLanguage; items: LanguageItem[] };

export const CODE_ACTIONS: CodeAction[] = ["suggest", "explain", "debug", "tests"];

export const CODE_ACTION_LABEL: Record<CodeAction, string> = {
  suggest: "Suggest",
  explain: "Explain",
  debug: "Debug",
  tests: "Tests",
};

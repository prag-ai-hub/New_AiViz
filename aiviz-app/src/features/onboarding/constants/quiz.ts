export type LearningStyleValue = "visual" | "auditory" | "kinesthetic";

export type QuizOption = { label: string; style: LearningStyleValue };
export type QuizQuestion = { prompt: string; options: readonly QuizOption[] };

export const QUIZ_QUESTIONS: readonly QuizQuestion[] = [
  {
    prompt: "When you learn something new, you prefer to…",
    options: [
      { label: "See a diagram or example",          style: "visual" },
      { label: "Hear someone explain it",           style: "auditory" },
      { label: "Try it hands-on",                   style: "kinesthetic" },
    ],
  },
  {
    prompt: "When studying for a test, you usually…",
    options: [
      { label: "Draw mind maps or flashcards",      style: "visual" },
      { label: "Read your notes aloud",             style: "auditory" },
      { label: "Practice problems repeatedly",      style: "kinesthetic" },
    ],
  },
  {
    prompt: "Remembering how to get somewhere, you…",
    options: [
      { label: "Picture the route in your head",    style: "visual" },
      { label: "Repeat street names to yourself",   style: "auditory" },
      { label: "Walk through it once to feel it",   style: "kinesthetic" },
    ],
  },
  {
    prompt: "In your free time, you'd rather…",
    options: [
      { label: "Draw, paint, or watch videos",      style: "visual" },
      { label: "Listen to music or podcasts",       style: "auditory" },
      { label: "Play a sport or build things",      style: "kinesthetic" },
    ],
  },
];

export const QUIZ_QUESTION_COUNT = QUIZ_QUESTIONS.length;

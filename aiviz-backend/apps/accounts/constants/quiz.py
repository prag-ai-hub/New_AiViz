"""4-question learning-style quiz. Each option is mapped to one of the 3 styles.
Frontend renders the prompts (or its own translated versions); backend only validates the chosen styles."""

from .learning_styles import LearningStyle

QUIZ_QUESTIONS = [
    {
        "prompt": "When you learn something new, you prefer to…",
        "options": [
            {"label": "See a diagram or example",       "style": LearningStyle.VISUAL},
            {"label": "Hear someone explain it",        "style": LearningStyle.AUDITORY},
            {"label": "Try it hands-on",                "style": LearningStyle.KINESTHETIC},
        ],
    },
    {
        "prompt": "When studying for a test, you usually…",
        "options": [
            {"label": "Draw mind maps or flashcards",   "style": LearningStyle.VISUAL},
            {"label": "Read your notes aloud",          "style": LearningStyle.AUDITORY},
            {"label": "Practice problems repeatedly",   "style": LearningStyle.KINESTHETIC},
        ],
    },
    {
        "prompt": "Remembering how to get somewhere, you…",
        "options": [
            {"label": "Picture the route in your head", "style": LearningStyle.VISUAL},
            {"label": "Repeat street names to yourself","style": LearningStyle.AUDITORY},
            {"label": "Walk through it once to feel it","style": LearningStyle.KINESTHETIC},
        ],
    },
    {
        "prompt": "In your free time, you'd rather…",
        "options": [
            {"label": "Draw, paint, or watch videos",   "style": LearningStyle.VISUAL},
            {"label": "Listen to music or podcasts",    "style": LearningStyle.AUDITORY},
            {"label": "Play a sport or build things",   "style": LearningStyle.KINESTHETIC},
        ],
    },
]

QUIZ_QUESTION_COUNT = len(QUIZ_QUESTIONS)

from apps.accounts.constants import LearningStyle

# Tie-break: prefer visual > auditory > kinesthetic when counts are equal.
_PRIORITY = (LearningStyle.VISUAL, LearningStyle.AUDITORY, LearningStyle.KINESTHETIC)


def infer_learning_style(answers: list[str]) -> tuple[str, dict[str, int]]:
    """Count votes per style; return (winner, scores). Deterministic tie-break."""
    scores: dict[str, int] = {style.value: 0 for style in LearningStyle}
    for choice in answers:
        if choice in scores:
            scores[choice] += 1
    winner = max(_PRIORITY, key=lambda s: scores[s.value]).value
    return winner, scores

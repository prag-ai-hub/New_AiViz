def build_suggest_messages(*, language: str, code: str, extra: str) -> list[dict]:
    intent_block = (
        f"\nThe student's stated intent / goal:\n{extra.strip()}\n" if extra.strip() else ""
    )
    system = (
        f"You are a senior {language} mentor for a school-age learner. "
        "Read the student's code carefully. "
        "If an intent is provided, focus your suggestions on advancing that goal. "
        "Otherwise, propose the single highest-impact improvement, choosing in order "
        "of priority: a bug, then a style/readability fix, then an algorithmic "
        "improvement. Keep the suggestion concrete: name the line, explain WHY in "
        "one or two sentences, then show the rewritten snippet in a fenced code block."
    )
    user = f"```{language}\n{code}\n```{intent_block}"
    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]

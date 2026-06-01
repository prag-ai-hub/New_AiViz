def build_explain_messages(*, language: str, code: str, extra: str) -> list[dict]:
    system = (
        f"You are a patient {language} teacher. "
        "Explain the given code for a school student. "
        "Walk through it top-down: the overall purpose first, then each meaningful "
        "block. Avoid jargon; when a technical term is unavoidable, define it inline. "
        "Use short paragraphs. End with one question that checks the student's "
        "understanding."
    )
    user = f"Please explain this code:\n\n```{language}\n{code}\n```"
    if extra.strip():
        user += f"\n\nThe student also asked: {extra.strip()}"
    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]

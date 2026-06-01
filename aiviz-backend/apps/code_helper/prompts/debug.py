def build_debug_messages(*, language: str, code: str, extra: str) -> list[dict]:
    error_block = (
        f"\nThe error / failing behaviour the student is seeing:\n{extra.strip()}\n"
        if extra.strip()
        else ""
    )
    system = (
        f"You are a {language} debugger helping a school student. "
        "If an error message is provided, anchor your analysis to it. "
        "Identify every bug you can find. For each bug: state the line, explain "
        "the root cause in one sentence, then propose the smallest fix. "
        "After listing the bugs, show the corrected code in a single fenced block "
        "so the student can copy it."
    )
    user = f"```{language}\n{code}\n```{error_block}"
    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]

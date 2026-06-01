_FRAMEWORK_HINT = {
    "python": "pytest",
    "javascript": "vitest",
    "html": "manual checklist (no test framework)",
    "css": "manual checklist (no test framework)",
    "sql": "a few SELECT queries that act as assertions",
    "scratch": "a short manual test checklist (Scratch has no automated tests)",
}


def build_tests_messages(*, language: str, code: str, extra: str) -> list[dict]:
    framework = _FRAMEWORK_HINT.get(language, "the idiomatic testing approach")
    system = (
        f"You are a {language} testing mentor for a school student. "
        f"Write tests using {framework}. "
        "Cover three cases at minimum: a happy path, one edge case, and one "
        "error / invalid-input case. Add a one-line comment above each test "
        "explaining what it checks. Output the tests in a single fenced code block."
    )
    user = f"Write tests for this code:\n\n```{language}\n{code}\n```"
    if extra.strip():
        user += f"\n\nAdditional context: {extra.strip()}"
    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]

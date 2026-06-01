from apps.code_helper.constants import CodeAction

from .debug import build_debug_messages
from .explain import build_explain_messages
from .suggest import build_suggest_messages
from .tests import build_tests_messages

_BUILDERS = {
    CodeAction.SUGGEST: build_suggest_messages,
    CodeAction.EXPLAIN: build_explain_messages,
    CodeAction.DEBUG: build_debug_messages,
    CodeAction.TESTS: build_tests_messages,
}


def build_prompt(*, action: str, language: str, code: str, extra: str = "") -> list[dict]:
    builder = _BUILDERS.get(action)
    if builder is None:
        raise ValueError(f"Unknown code action: {action!r}")
    return builder(language=language, code=code, extra=extra)


__all__ = ["build_prompt"]

"""Versioned Socratic system prompts. Dispatch by Session.system_prompt_version."""

from .socratic_v1 import build_socratic_prompt as _v1


def build_prompt(*, version: str, grade: int | None, board: str, lang: str) -> str:
    if version == "v1":
        return _v1(grade=grade, board=board, lang=lang)
    raise ValueError(f"Unknown system_prompt_version: {version!r}")


__all__ = ["build_prompt"]

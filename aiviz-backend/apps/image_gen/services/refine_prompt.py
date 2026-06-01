"""OpenAI-powered prompt rewriter for image generation.

Takes the user's short prompt + optional style preset and returns a longer,
more descriptive prompt suitable for diffusion models. Falls back to the
deterministic Day-9 style suffix when OpenAI is unavailable so the upstream
flow never breaks.
"""

from __future__ import annotations

import logging

from django.conf import settings

from apps.image_gen.constants import STYLE_PROMPT_SUFFIX, StylePreset
from infrastructure.openai import (
    OpenAIError,
    OpenAINotConfigured,
    chat_completion,
)

logger = logging.getLogger(__name__)

_DEFAULT_REFINE_MODEL = "gpt-4o-mini"

_SYSTEM_PROMPT = (
    "You are an expert visual prompt engineer for kid-safe AI image generation. "
    "Rewrite the user's idea into a vivid, descriptive prompt of 1-2 sentences. "
    "Keep all imagery age-appropriate. If a style is specified, weave it "
    "naturally into the description. Output ONLY the rewritten prompt — no "
    "preamble, no quotes."
)


def _style_label(style: str) -> str:
    if not style:
        return "free"
    return dict(StylePreset.choices).get(style, style)


def _fallback(user_prompt: str, style: str) -> str:
    base = user_prompt.strip()
    suffix = STYLE_PROMPT_SUFFIX.get(style)
    if suffix:
        return f"{base}, {suffix}"
    return base


def refine_prompt(*, user_prompt: str, style: str = "") -> str:
    """Return a refined prompt. Never raises — falls back to a deterministic
    string if OpenAI is unavailable or errors out."""
    cfg = getattr(settings, "IMAGE_GEN", {})
    model = cfg.get("OPENAI_REFINE_MODEL", _DEFAULT_REFINE_MODEL)

    messages = [
        {"role": "system", "content": _SYSTEM_PROMPT},
        {
            "role": "user",
            "content": f"Style: {_style_label(style)}\nUser prompt: {user_prompt.strip()}",
        },
    ]

    try:
        refined = chat_completion(
            messages,
            model=model,
            temperature=0.6,
            max_tokens=180,
        )
    except (OpenAIError, OpenAINotConfigured) as exc:
        logger.warning("Prompt refine failed (%s); using deterministic fallback.", exc)
        return _fallback(user_prompt, style)

    if not refined:
        logger.warning("Prompt refine returned empty content; using fallback.")
        return _fallback(user_prompt, style)
    return refined

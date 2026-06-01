"""Thin adapter around the OpenAI SDK. The only export the rest of the codebase
talks to is `stream_chat()` — a generator yielding text chunks."""

from collections.abc import Iterator
from dataclasses import dataclass

from django.conf import settings

from .exceptions import OpenAIError, OpenAINotConfigured


@dataclass(frozen=True, slots=True)
class StreamUsage:
    prompt_tokens: int
    completion_tokens: int


def _client():
    api_key = settings.VIDYA_LM.get("OPENAI_API_KEY", "")
    if not api_key:
        raise OpenAINotConfigured("Set OPENAI_API_KEY in .env to call OpenAI.")
    # Lazy import so the codebase loads even when the openai package isn't installed
    # (e.g., during early static analysis).
    from openai import OpenAI

    return OpenAI(api_key=api_key)


def stream_chat(
    messages: list[dict],
    *,
    model: str,
    temperature: float = 0.7,
) -> Iterator[str]:
    """Yield successive text chunks from a chat completion. Last yield is an empty
    string sentinel followed by None on usage emit. Callers should accumulate.

    Raises OpenAINotConfigured if the key isn't set.
    Raises OpenAIError for any wrapped SDK error.
    """
    client = _client()

    try:
        stream = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            stream=True,
            stream_options={"include_usage": True},
        )
    except Exception as err:  # noqa: BLE001
        raise OpenAIError(f"OpenAI chat.completions.create failed: {err}") from err

    for chunk in stream:
        # The final usage-only chunk has empty choices.
        if not chunk.choices:
            continue
        delta = chunk.choices[0].delta
        text = getattr(delta, "content", None)
        if text:
            yield text


def chat_completion(
    messages: list[dict],
    *,
    model: str,
    temperature: float = 0.7,
    max_tokens: int | None = None,
) -> str:
    """One-shot non-streaming chat completion. Returns the text content.

    Raises OpenAINotConfigured if the key isn't set.
    Raises OpenAIError for any wrapped SDK error.
    """
    client = _client()
    kwargs: dict = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
    }
    if max_tokens is not None:
        kwargs["max_tokens"] = max_tokens

    try:
        resp = client.chat.completions.create(**kwargs)
    except Exception as err:  # noqa: BLE001
        raise OpenAIError(f"OpenAI chat.completions.create failed: {err}") from err

    return (resp.choices[0].message.content or "").strip()

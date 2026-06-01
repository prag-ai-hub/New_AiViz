"""Whisper transcription wrapper. Mirrors `client.py`'s lazy-init pattern."""

from django.conf import settings

from .exceptions import OpenAIError, OpenAINotConfigured


def _client():
    api_key = settings.VIDYA_LM.get("OPENAI_API_KEY", "")
    if not api_key:
        raise OpenAINotConfigured("Set OPENAI_API_KEY in .env to call OpenAI.")
    from openai import OpenAI

    return OpenAI(api_key=api_key)


def transcribe_audio(file_path: str, *, model: str = "whisper-1") -> str:
    """Run an audio file through Whisper and return the transcribed text."""
    client = _client()
    try:
        with open(file_path, "rb") as handle:
            result = client.audio.transcriptions.create(model=model, file=handle)
    except Exception as err:  # noqa: BLE001
        raise OpenAIError(f"Whisper transcription failed: {err}") from err
    return getattr(result, "text", "") or ""

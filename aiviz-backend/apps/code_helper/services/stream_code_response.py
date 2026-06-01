import json
import logging
from typing import Iterator

from django.conf import settings

from apps.code_helper.models import CodeRequest
from apps.code_helper.prompts import build_prompt
from apps.vidya_lm.services.exceptions import OpenAIUnavailable
from infrastructure.openai import OpenAINotConfigured, stream_chat

logger = logging.getLogger(__name__)

DEFAULT_MODEL = "gpt-4o-mini"
DEFAULT_TEMPERATURE = 0.3  # lower than chat — code tasks want determinism


def _sse(payload: dict) -> str:
    return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"


def stream_code_response(
    *,
    user,
    action: str,
    language: str,
    code: str,
    extra: str = "",
) -> Iterator[str]:
    """Stream a code-helper response as SSE; persist a CodeRequest row.

    The row is created before the stream starts so cancelled streams still capture
    the partial response in their `try/finally`.
    """
    cfg = getattr(settings, "VIDYA_LM", {})
    model = cfg.get("MODEL", DEFAULT_MODEL)
    temperature = cfg.get("CODE_TEMPERATURE", DEFAULT_TEMPERATURE)

    request_row = CodeRequest.objects.create(
        user=user,
        action=action,
        language=language,
        code=code,
        extra=extra,
        model=model,
    )

    try:
        messages = build_prompt(action=action, language=language, code=code, extra=extra)
        chunk_iter = stream_chat(messages, model=model, temperature=temperature)
    except OpenAINotConfigured as exc:
        # Reflect the row state, then bubble for the view to translate.
        CodeRequest.objects.filter(pk=request_row.pk).delete()
        raise OpenAIUnavailable() from exc

    buffer: list[str] = []
    try:
        for chunk in chunk_iter:
            buffer.append(chunk)
            yield _sse({"delta": chunk})
        yield _sse({"done": True})
        yield "data: [DONE]\n\n"
    except GeneratorExit:
        raise
    except Exception:
        logger.exception("code_helper stream failed for request %s", request_row.pk)
        yield _sse({"error": "stream_failed"})
    finally:
        full = "".join(buffer)
        if full:
            CodeRequest.objects.filter(pk=request_row.pk).update(response=full)

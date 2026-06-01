import json
import logging
from typing import Iterator

from django.conf import settings
from django.utils import timezone

from apps.vidya_lm.constants import DEFAULT_MODEL, DEFAULT_TEMPERATURE, MAX_HISTORY_MESSAGES, MessageRole
from apps.vidya_lm.models import Message, Session
from apps.vidya_lm.services.build_socratic_prompt import build_socratic_prompt
from apps.vidya_lm.services.exceptions import OpenAIUnavailable
from infrastructure.openai import OpenAINotConfigured, stream_chat

logger = logging.getLogger(__name__)


def _sse(payload: dict) -> str:
    return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"


def _history_payload(session: Session) -> list[dict]:
    system_prompt = build_socratic_prompt(session=session)
    recent = list(
        session.messages.order_by("-created_at")[:MAX_HISTORY_MESSAGES].values("role", "content")
    )
    recent.reverse()
    return [{"role": "system", "content": system_prompt}, *recent]


def stream_assistant_reply(*, session: Session) -> Iterator[str]:
    """Yield SSE-formatted chunks of an OpenAI completion and persist the result.

    The user message must already be saved before calling this so it appears in the
    history payload sent to the model.
    """
    cfg = getattr(settings, "VIDYA_LM", {})
    model = cfg.get("MODEL", DEFAULT_MODEL)
    temperature = cfg.get("TEMPERATURE", DEFAULT_TEMPERATURE)

    try:
        messages_payload = _history_payload(session)
        chunk_iter = stream_chat(messages_payload, model=model, temperature=temperature)
    except OpenAINotConfigured as exc:
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
        logger.exception("vidya_lm stream failed for session %s", session.pk)
        yield _sse({"error": "stream_failed"})
    finally:
        content = "".join(buffer).strip()
        if content:
            Message.objects.create(
                session=session,
                role=MessageRole.ASSISTANT,
                content=content,
                model=model,
            )
            Session.objects.filter(pk=session.pk).update(updated_at=timezone.now())

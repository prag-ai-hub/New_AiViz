"""Resolve (source notebook entry) → (target tool) into a {route, params}
prefill payload the frontend can use with `router.push(...)`."""

from __future__ import annotations

from apps.notebook.constants import SourceKind
from apps.notebook.models import NotebookEntry
from apps.notebook.services.exceptions import UnsupportedTransition

MAX_PROMPT = 500
MAX_CODE = 4000
MAX_CHAT_SEED = 500

ROUTE_BY_TARGET = {
    "vidya_lm": "/tools/vidya-lm",
    "image_gen": "/tools/image-gen",
    "code_helper": "/tools/code-helper",
    "speech_tutor": "/tools/speech-tutor",
    "music_gen": "/tools/music-gen",
    "video_gen": "/tools/video-gen",
    "avatar": "/tools/avatar",
    "skillguru": "/tools/skillguru",
}


def _last_assistant_message(session) -> str:
    msg = session.messages.filter(role="assistant").order_by("-created_at").first()
    return (msg.content if msg else "") or ""


def _truncate(text: str, n: int) -> str:
    text = (text or "").strip()
    return text[:n]


def resolve_continue_with(*, entry: NotebookEntry, target: str) -> dict:
    """Return {"route": "...", "params": {...}}. Raises UnsupportedTransition
    when the (source_kind, target) pair has no defined mapping."""
    if target not in ROUTE_BY_TARGET:
        raise UnsupportedTransition(
            detail=f"Unknown target tool: {target!r}"
        )

    route = ROUTE_BY_TARGET[target]
    source = entry.source
    if source is None:
        raise UnsupportedTransition(detail="Notebook entry has no source asset.")

    kind = entry.source_kind

    # ----- Vidya LM session as source -----
    if kind == SourceKind.VIDYA_LM:
        last = _last_assistant_message(source)
        if target == "image_gen":
            return {"route": route, "params": {"prompt": _truncate(last, MAX_PROMPT)}}
        if target == "code_helper":
            return {
                "route": route,
                "params": {
                    "code": _truncate(last, MAX_CODE),
                    "action": "explain",
                    "language": "python",
                },
            }
        if target == "music_gen":
            return {"route": route, "params": {"prompt": _truncate(last, MAX_PROMPT)}}
        if target == "video_gen":
            return {"route": route, "params": {"prompt": _truncate(last, MAX_PROMPT)}}
        if target == "speech_tutor":
            return {"route": route, "params": {"text": _truncate(last, MAX_PROMPT)}}
        if target == "skillguru":
            return {"route": route, "params": {"context": _truncate(last, MAX_PROMPT)}}
        if target == "vidya_lm":
            return {
                "route": route,
                "params": {"firstMessage": _truncate(last, MAX_CHAT_SEED)},
            }

    # ----- Image asset as source -----
    if kind == SourceKind.IMAGE_GEN:
        prompt = source.prompt or ""
        if target == "vidya_lm":
            return {
                "route": route,
                "params": {
                    "firstMessage": _truncate(
                        f"Tell me about this image: {prompt}", MAX_CHAT_SEED
                    ),
                },
            }
        if target == "code_helper":
            seed = f"# {prompt}\n"
            return {
                "route": route,
                "params": {
                    "code": _truncate(seed, MAX_CODE),
                    "action": "suggest",
                    "language": "python",
                },
            }
        if target == "image_gen":
            # Re-use the same prompt as a seed for a new image.
            return {"route": route, "params": {"prompt": _truncate(prompt, MAX_PROMPT)}}
        if target == "music_gen":
            return {"route": route, "params": {"prompt": _truncate(prompt, MAX_PROMPT)}}
        if target == "video_gen":
            return {"route": route, "params": {"prompt": _truncate(prompt, MAX_PROMPT)}}
        if target == "skillguru":
            return {"route": route, "params": {"context": _truncate(prompt, MAX_PROMPT)}}

    # ----- Video job as source -----
    if kind == SourceKind.VIDEO_GEN:
        prompt = source.prompt or ""
        if target == "vidya_lm":
            return {
                "route": route,
                "params": {
                    "firstMessage": _truncate(
                        f"Tell me about this video: {prompt}", MAX_CHAT_SEED
                    ),
                },
            }
        if target == "image_gen":
            # Reimagine a still frame from the same idea.
            return {"route": route, "params": {"prompt": _truncate(prompt, MAX_PROMPT)}}
        if target == "video_gen":
            return {"route": route, "params": {"prompt": _truncate(prompt, MAX_PROMPT)}}
        if target == "code_helper":
            seed = f"# Video idea: {prompt}\n# Three.js scene that animates this:\n"
            return {
                "route": route,
                "params": {
                    "code": _truncate(seed, MAX_CODE),
                    "action": "suggest",
                    "language": "javascript",
                },
            }
        if target == "music_gen":
            return {"route": route, "params": {"prompt": _truncate(prompt, MAX_PROMPT)}}
        if target == "skillguru":
            return {"route": route, "params": {"context": _truncate(prompt, MAX_PROMPT)}}

    # ----- Code request as source -----
    if kind == SourceKind.CODE_HELPER:
        code = source.code or ""
        lang = source.language or ""
        if target == "vidya_lm":
            seed = f"Help me with this {lang} code:\n\n{_truncate(code, 1500)}"
            return {
                "route": route,
                "params": {"firstMessage": _truncate(seed, MAX_CHAT_SEED * 4)},
            }
        if target == "code_helper":
            return {
                "route": route,
                "params": {
                    "code": _truncate(code, MAX_CODE),
                    "language": lang,
                    "action": "explain",
                },
            }
        if target == "image_gen":
            first_line = code.splitlines()[0].lstrip("#/ ").strip() if code else ""
            seed = first_line or f"a diagram representing {lang} code"
            return {"route": route, "params": {"prompt": _truncate(seed, MAX_PROMPT)}}
        if target == "skillguru":
            return {
                "route": route,
                "params": {"context": _truncate(code, MAX_PROMPT)},
            }

    raise UnsupportedTransition(
        detail=f"No transition wired from {kind} to {target}."
    )

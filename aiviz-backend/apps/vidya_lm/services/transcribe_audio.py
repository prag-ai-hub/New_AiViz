import tempfile
from pathlib import Path

from django.core.files.uploadedfile import UploadedFile

from apps.vidya_lm.services.exceptions import OpenAIUnavailable
from infrastructure.openai import OpenAINotConfigured
from infrastructure.openai import transcribe_audio as _transcribe


def transcribe_upload(*, upload: UploadedFile) -> str:
    """Persist the uploaded audio to a temp file, run Whisper, return text."""
    suffix = Path(upload.name or "").suffix or ".audio"
    with tempfile.NamedTemporaryFile(delete=True, suffix=suffix) as tmp:
        for chunk in upload.chunks():
            tmp.write(chunk)
        tmp.flush()
        try:
            return _transcribe(tmp.name)
        except OpenAINotConfigured as exc:
            raise OpenAIUnavailable() from exc

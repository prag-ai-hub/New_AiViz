"""Polymorphic serializer for NotebookEntry. Renders the source asset under a
nested `source` field whose shape depends on `source_kind`."""

from __future__ import annotations

import logging

from rest_framework import serializers

from apps.code_helper.models import CodeRequest
from apps.image_gen.models import ImageAsset, ImageAssetStatus
from apps.notebook.api.serializers.tag import TagSerializer
from apps.notebook.constants import SourceKind
from apps.notebook.models import NotebookEntry
from apps.video_gen.constants import VideoJobStatus
from apps.video_gen.models import VideoJob
from apps.vidya_lm.models import Session
from infrastructure.r2_storage import R2Error, R2NotConfigured, presign_get

logger = logging.getLogger(__name__)


def _image_source(asset: ImageAsset) -> dict:
    url = None
    if asset.status == ImageAssetStatus.SUCCEEDED:
        if asset.r2_key:
            try:
                url = presign_get(asset.r2_key)
            except (R2NotConfigured, R2Error):
                logger.exception("presign_get failed for asset %s", asset.pk)
                url = asset.image_url or None
        elif asset.image_url:
            url = asset.image_url
    return {
        "id": asset.id,
        "url": url,
        "prompt": asset.prompt,
        "refined_prompt": asset.refined_prompt,
        "model": asset.model,
        "width": asset.width,
        "height": asset.height,
    }


def _video_source(job: VideoJob) -> dict:
    url = None
    seed_url = None
    if job.status == VideoJobStatus.SUCCEEDED:
        if job.r2_key:
            try:
                url = presign_get(job.r2_key)
            except (R2NotConfigured, R2Error):
                logger.exception("presign_get failed for video job %s", job.pk)
                url = job.url or None
        elif job.url:
            url = job.url
        if job.seed_image_r2_key:
            try:
                seed_url = presign_get(job.seed_image_r2_key)
            except (R2NotConfigured, R2Error):
                seed_url = job.seed_image_url or None
        elif job.seed_image_url:
            seed_url = job.seed_image_url
    return {
        "id": job.id,
        "url": url,
        "seed_image_url": seed_url,
        "prompt": job.prompt,
        "refined_prompt": job.refined_prompt,
        "duration_seconds": job.duration_seconds,
    }


def _code_source(req: CodeRequest) -> dict:
    return {
        "id": req.id,
        "action": req.action,
        "language": req.language,
        "code_preview": (req.code or "")[:300],
        "response_preview": (req.response or "")[:300],
        "model": req.model,
    }


def _chat_source(session: Session) -> dict:
    last = session.messages.filter(role="assistant").order_by("-created_at").first()
    return {
        "id": session.id,
        "message_count": session.messages.count(),
        "last_assistant": ((last.content if last else "") or "")[:300],
        "grade_snapshot": session.grade_snapshot,
        "board_snapshot": session.board_snapshot,
        "lang_snapshot": session.lang_snapshot,
    }


class NotebookEntrySerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    source = serializers.SerializerMethodField()

    class Meta:
        model = NotebookEntry
        fields = [
            "id",
            "source_kind",
            "title",
            "summary",
            "tags",
            "source",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_source(self, entry: NotebookEntry) -> dict | None:
        source = entry.source
        if source is None:
            return None
        if entry.source_kind == SourceKind.IMAGE_GEN and isinstance(source, ImageAsset):
            return _image_source(source)
        if entry.source_kind == SourceKind.VIDEO_GEN and isinstance(source, VideoJob):
            return _video_source(source)
        if entry.source_kind == SourceKind.CODE_HELPER and isinstance(source, CodeRequest):
            return _code_source(source)
        if entry.source_kind == SourceKind.VIDYA_LM and isinstance(source, Session):
            return _chat_source(source)
        return None

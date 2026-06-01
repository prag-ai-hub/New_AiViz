import logging

from rest_framework import serializers

from apps.image_gen.models import ImageAsset, ImageAssetStatus
from infrastructure.r2_storage import R2Error, R2NotConfigured, presign_get

logger = logging.getLogger(__name__)


class ImageAssetSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = ImageAsset
        fields = [
            "id",
            "prompt",
            "refined_prompt",
            "style",
            "model",
            "width",
            "height",
            "status",
            "url",
            "created_at",
        ]
        read_only_fields = fields

    def get_url(self, obj: ImageAsset) -> str | None:
        if obj.status != ImageAssetStatus.SUCCEEDED:
            return None
        # Prefer R2 (with a freshly-presigned URL) when an r2_key is recorded;
        # otherwise fall back to the fal-hosted source URL.
        if obj.r2_key:
            try:
                return presign_get(obj.r2_key)
            except (R2NotConfigured, R2Error):
                logger.exception("presign_get failed for asset %s", obj.pk)
                # fall through to image_url below
        if obj.image_url:
            return obj.image_url
        return None

"""Auto-create NotebookEntry rows when source assets are saved.

Each handler is idempotent — `upsert_entry` uses the unique constraint on
(user, content_type, object_id) to avoid duplicates.
"""

from __future__ import annotations

from django.contrib.postgres.search import SearchVector
from django.db.models.signals import post_delete, post_save, pre_save
from django.dispatch import receiver

from apps.code_helper.models import CodeRequest
from apps.image_gen.models import ImageAsset, ImageAssetStatus
from apps.notebook.constants import SourceKind
from apps.notebook.models import NotebookEntry
from apps.notebook.services import upsert_entry
from apps.video_gen.constants import VideoJobStatus
from apps.video_gen.models import VideoJob
from apps.vidya_lm.models import Message, Session


# ----- Image Gen ---------------------------------------------------------------


@receiver(post_save, sender=ImageAsset)
def on_image_asset_saved(sender, instance: ImageAsset, created, **kwargs):
    if instance.status != ImageAssetStatus.SUCCEEDED:
        return
    title = (instance.prompt or "Image")[:80]
    summary = instance.refined_prompt or instance.prompt or ""
    upsert_entry(
        user=instance.user,
        source=instance,
        source_kind=SourceKind.IMAGE_GEN,
        title=title,
        summary=summary,
    )


@receiver(post_delete, sender=ImageAsset)
def on_image_asset_deleted(sender, instance: ImageAsset, **kwargs):
    _delete_entries_for(instance)


# ----- Video Gen ---------------------------------------------------------------


@receiver(post_save, sender=VideoJob)
def on_video_job_saved(sender, instance: VideoJob, created, **kwargs):
    if instance.status != VideoJobStatus.SUCCEEDED:
        return
    title = (instance.prompt or "Video")[:80]
    summary = instance.refined_prompt or instance.prompt or ""
    upsert_entry(
        user=instance.user,
        source=instance,
        source_kind=SourceKind.VIDEO_GEN,
        title=title,
        summary=summary,
    )


@receiver(post_delete, sender=VideoJob)
def on_video_job_deleted(sender, instance: VideoJob, **kwargs):
    _delete_entries_for(instance)


# ----- Code Helper -------------------------------------------------------------


@receiver(post_save, sender=CodeRequest)
def on_code_request_saved(sender, instance: CodeRequest, created, **kwargs):
    if not instance.response:
        return
    action = (instance.action or "code").capitalize()
    language = instance.language or ""
    title = f"{action} ({language})"[:240] if language else action[:240]
    summary = (instance.code or "")[:600]
    upsert_entry(
        user=instance.user,
        source=instance,
        source_kind=SourceKind.CODE_HELPER,
        title=title,
        summary=summary,
    )


@receiver(post_delete, sender=CodeRequest)
def on_code_request_deleted(sender, instance: CodeRequest, **kwargs):
    _delete_entries_for(instance)


# ----- Vidya LM Session + Message ----------------------------------------------


@receiver(post_save, sender=Session)
def on_session_saved(sender, instance: Session, created, **kwargs):
    title = (instance.title or "New chat")[:240]
    upsert_entry(
        user=instance.user,
        source=instance,
        source_kind=SourceKind.VIDYA_LM,
        title=title,
        summary="",
    )


@receiver(post_delete, sender=Session)
def on_session_deleted(sender, instance: Session, **kwargs):
    _delete_entries_for(instance)


@receiver(post_save, sender=Message)
def on_message_saved(sender, instance: Message, created, **kwargs):
    """When an assistant message lands, refresh the session entry's summary."""
    if not created or instance.role != "assistant":
        return
    session = instance.session
    upsert_entry(
        user=session.user,
        source=session,
        source_kind=SourceKind.VIDYA_LM,
        title=(session.title or "New chat")[:240],
        summary=(instance.content or "")[:600],
    )


# ----- Search vector -----------------------------------------------------------


@receiver(pre_save, sender=NotebookEntry)
def update_search_vector(sender, instance: NotebookEntry, **kwargs):
    """Rebuild the FTS vector whenever title / summary changes."""
    # SearchVector inside pre_save needs a saved object; do nothing here and
    # rely on the post-save expression update below.
    return


@receiver(post_save, sender=NotebookEntry)
def refresh_search_vector(sender, instance: NotebookEntry, created, **kwargs):
    """Post-save: run a single UPDATE that rebuilds the search vector for this
    row. Guarded against recursion via update_fields gate. SQLite and other
    non-Postgres backends silently skip — selectors fall back to icontains."""
    from django.db import connection

    if connection.vendor != "postgresql":
        return
    if kwargs.get("update_fields") == {"search_vector"}:
        return
    NotebookEntry.objects.filter(pk=instance.pk).update(
        search_vector=SearchVector("title", weight="A")
        + SearchVector("summary", weight="B"),
    )


# ----- Helpers -----------------------------------------------------------------


def _delete_entries_for(source) -> None:
    from django.contrib.contenttypes.models import ContentType

    ct = ContentType.objects.get_for_model(source.__class__)
    NotebookEntry.objects.filter(content_type=ct, object_id=source.pk).delete()

from django.db.models import Count, Max, QuerySet

from apps.vidya_lm.models import Session


def list_user_sessions(*, user) -> QuerySet[Session]:
    """Sessions for the requesting user, annotated for list rendering."""
    return (
        Session.objects.filter(user=user)
        .annotate(
            message_count=Count("messages"),
            last_message_at=Max("messages__created_at"),
        )
        .order_by("-updated_at")
    )

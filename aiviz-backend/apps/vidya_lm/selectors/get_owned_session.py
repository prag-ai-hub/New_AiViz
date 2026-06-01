from django.shortcuts import get_object_or_404

from apps.vidya_lm.models import Session


def get_owned_session(*, pk: int, user) -> Session:
    """Fetch a session by id scoped to the requesting user. 404 if foreign or missing."""
    return get_object_or_404(Session, pk=pk, user=user)

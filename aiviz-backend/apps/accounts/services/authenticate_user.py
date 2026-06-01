from django.contrib.auth import authenticate

from apps.accounts.models import User
from apps.accounts.selectors.get_user_by_identifier import get_user_by_identifier

from .exceptions import InvalidCredentials, UserInactive


def authenticate_user(*, identifier: str, password: str) -> User:
    """Authenticate by email-or-phone. Raise domain exceptions on failure."""
    user = authenticate(request=None, username=identifier, password=password)
    if user is None:
        # Distinguish "exists but inactive" from "bad credentials" without leaking which.
        candidate = get_user_by_identifier(identifier)
        if candidate is not None and not candidate.is_active:
            raise UserInactive()
        raise InvalidCredentials()
    return user

from django.db import transaction

from apps.accounts.constants import Role
from apps.accounts.models import User


@transaction.atomic
def create_user(
    *,
    email: str,
    password: str | None,
    phone: str | None = None,
    role: str = Role.STUDENT,
    first_name: str = "",
    last_name: str = "",
    is_email_verified: bool = False,
) -> User:
    """Atomic User row insert. Profile is auto-created by post_save signal."""
    return User.objects.create_user(
        email=email,
        password=password,
        phone=phone or None,  # store None instead of empty string for uniqueness partial index
        role=role,
        first_name=first_name,
        last_name=last_name,
        is_email_verified=is_email_verified,
    )

from django.db import IntegrityError

from apps.accounts.constants import Role
from apps.accounts.models import User
from apps.accounts.repositories.create_user import create_user

from .exceptions import DuplicateAccount
from .issue_tokens import issue_tokens


def signup_user(
    *,
    email: str,
    password: str,
    phone: str | None = None,
    role: str = Role.STUDENT,
    first_name: str = "",
    last_name: str = "",
) -> tuple[User, dict[str, str]]:
    """Create a new email+password user, return (user, tokens). Profile auto-created via signal."""
    try:
        user = create_user(
            email=email,
            password=password,
            phone=phone,
            role=role,
            first_name=first_name,
            last_name=last_name,
        )
    except IntegrityError as err:
        raise DuplicateAccount() from err
    return user, issue_tokens(user)

from django.db import transaction

from apps.accounts.constants import Role, SocialProvider
from apps.accounts.models import User
from apps.accounts.repositories.create_user import create_user
from apps.accounts.repositories.link_social_account import link_social_account
from apps.accounts.selectors.get_social_account import get_social_account
from infrastructure.google_oauth import GoogleTokenError, verify_id_token

from .exceptions import GoogleEmailUnverified, GoogleTokenInvalid


def verify_google_token(id_token: str) -> tuple[User, bool]:
    """Verify a Google ID token, then resolve to a User. Returns (user, created).

    Resolution order:
      1. existing SocialAccount(provider=google, subject=identity.subject) → that user
      2. existing User by email (returned by Google) → attach SocialAccount, return user
      3. otherwise → create User + SocialAccount + Profile (via signal)
    """
    try:
        identity = verify_id_token(id_token)
    except GoogleTokenError as err:
        raise GoogleTokenInvalid(str(err)) from err

    if not identity.email_verified or not identity.email:
        raise GoogleEmailUnverified()

    existing_link = get_social_account(provider=SocialProvider.GOOGLE, subject=identity.subject)
    if existing_link is not None:
        return existing_link.user, False

    user = User.objects.filter(email__iexact=identity.email).first()
    if user is not None:
        link_social_account(
            user=user,
            provider=SocialProvider.GOOGLE,
            subject=identity.subject,
            email_at_link=identity.email,
        )
        return user, False

    with transaction.atomic():
        user = create_user(
            email=identity.email,
            password=None,
            role=Role.STUDENT,
            first_name=identity.name.split(" ", 1)[0] if identity.name else "",
            last_name=identity.name.split(" ", 1)[1] if " " in identity.name else "",
            is_email_verified=True,
        )
        link_social_account(
            user=user,
            provider=SocialProvider.GOOGLE,
            subject=identity.subject,
            email_at_link=identity.email,
        )
    return user, True

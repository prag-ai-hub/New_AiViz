from django.db import transaction

from apps.accounts.models import SocialAccount, User


@transaction.atomic
def link_social_account(
    *,
    user: User,
    provider: str,
    subject: str,
    email_at_link: str = "",
) -> SocialAccount:
    """Idempotent attach of a (provider, subject) link to a user."""
    link, _created = SocialAccount.objects.get_or_create(
        provider=provider,
        subject=subject,
        defaults={"user": user, "email_at_link": email_at_link},
    )
    return link

from apps.accounts.models import SocialAccount


def get_social_account(*, provider: str, subject: str) -> SocialAccount | None:
    return (
        SocialAccount.objects.select_related("user")
        .filter(provider=provider, subject=subject)
        .first()
    )

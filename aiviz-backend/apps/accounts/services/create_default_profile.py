from apps.accounts.models import Profile, User


def create_default_profile(user: User) -> Profile:
    """Idempotent: every User gets exactly one Profile."""
    profile, _created = Profile.objects.get_or_create(user=user)
    return profile

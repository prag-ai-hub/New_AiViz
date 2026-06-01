from django.db import transaction

from apps.accounts.models import Profile, User


@transaction.atomic
def update_profile(user: User, **fields) -> Profile:
    """Partial update of the user's Profile. Day 2 signal guarantees Profile exists,
    but get_or_create is defensive in case a User was created outside the normal flow."""
    profile, _ = Profile.objects.select_for_update().get_or_create(user=user)
    for key, value in fields.items():
        setattr(profile, key, value)
    profile.save()
    return profile

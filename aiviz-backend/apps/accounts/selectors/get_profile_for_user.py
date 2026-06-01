from apps.accounts.models import Profile, User


def get_profile_for_user(user: User) -> Profile | None:
    return Profile.objects.filter(user=user).first()

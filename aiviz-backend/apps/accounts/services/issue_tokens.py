from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import User


def issue_tokens(user: User) -> dict[str, str]:
    """Issue an access + refresh token pair for a User."""
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}

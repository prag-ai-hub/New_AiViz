from dataclasses import dataclass

from django.conf import settings
from google.auth.transport import requests as g_requests
from google.oauth2 import id_token as g_id_token

from .exceptions import GoogleTokenError

_ISSUERS = {"https://accounts.google.com", "accounts.google.com"}


@dataclass(frozen=True, slots=True)
class GoogleIdentity:
    subject: str
    email: str
    email_verified: bool
    name: str
    picture: str


def verify_id_token(token: str) -> GoogleIdentity:
    """Verify a Google ID token against any configured client ID.

    `GOOGLE_OAUTH["CLIENT_IDS"]` is a list (Expo issues different audience IDs per
    platform). google-auth's `verify_oauth2_token` takes a single audience, so we
    try each ID and accept the first match.
    """
    client_ids = settings.GOOGLE_OAUTH.get("CLIENT_IDS") or []
    if not client_ids:
        raise GoogleTokenError("Google OAuth not configured (GOOGLE_CLIENT_IDS empty).")

    request = g_requests.Request()
    last_err: Exception | None = None
    for client_id in client_ids:
        try:
            claims = g_id_token.verify_oauth2_token(token, request, audience=client_id)
        except ValueError as err:
            last_err = err
            continue
        if claims.get("iss") not in _ISSUERS:
            raise GoogleTokenError("Token issuer is not Google.")
        return GoogleIdentity(
            subject=str(claims["sub"]),
            email=claims.get("email", ""),
            email_verified=bool(claims.get("email_verified", False)),
            name=claims.get("name", ""),
            picture=claims.get("picture", ""),
        )

    raise GoogleTokenError(f"Token rejected by all configured client IDs: {last_err}")

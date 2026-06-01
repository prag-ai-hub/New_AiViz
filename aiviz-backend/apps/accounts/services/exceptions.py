from rest_framework import status
from rest_framework.exceptions import APIException


class DuplicateAccount(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = "An account with that email or phone already exists."
    default_code = "duplicate_account"


class InvalidCredentials(APIException):
    status_code = status.HTTP_401_UNAUTHORIZED
    default_detail = "Invalid email/phone or password."
    default_code = "invalid_credentials"


class UserInactive(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = "User account is inactive."
    default_code = "user_inactive"


class GoogleTokenInvalid(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Google ID token is invalid or expired."
    default_code = "google_token_invalid"


class GoogleEmailUnverified(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Google account email is not verified."
    default_code = "google_email_unverified"

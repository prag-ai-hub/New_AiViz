from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend
from django.db.models import Q

User = get_user_model()


class EmailOrPhoneBackend(ModelBackend):
    """Authenticate by email OR E.164 phone, both keyed off the `username` kwarg."""

    def authenticate(self, request, username: str | None = None, password: str | None = None, **kwargs):
        if not username or not password:
            return None
        try:
            user = User.objects.get(Q(email__iexact=username) | Q(phone=username))
        except User.DoesNotExist:
            return None
        if not user.check_password(password):
            return None
        if not self.user_can_authenticate(user):
            return None
        return user

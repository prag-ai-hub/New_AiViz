import pytest
from django.db.utils import IntegrityError

from apps.accounts.constants import Role
from apps.accounts.models import ParentLink, Profile, SocialAccount, User

from .factories import ParentLinkFactory, UserFactory


@pytest.mark.django_db
class TestUserManager:
    def test_create_user_defaults_to_student(self):
        u = User.objects.create_user(email="a@b.com", password="Pa55word!")
        assert u.role == Role.STUDENT
        assert u.check_password("Pa55word!")
        assert not u.is_staff

    def test_create_superuser_flags(self):
        u = User.objects.create_superuser(email="root@example.com", password="Pa55word!")
        assert u.is_staff and u.is_superuser
        assert u.role == Role.ADMIN
        assert u.is_email_verified

    def test_email_required(self):
        with pytest.raises(ValueError):
            User.objects.create_user(email="", password="x")


@pytest.mark.django_db
class TestProfileAutoCreated:
    def test_profile_exists_after_signup(self):
        user = UserFactory()
        assert Profile.objects.filter(user=user).exists()


@pytest.mark.django_db
class TestUniqueConstraints:
    def test_duplicate_phone_rejected(self):
        UserFactory(phone="+919999999999")
        with pytest.raises(IntegrityError):
            UserFactory(phone="+919999999999")

    def test_null_phone_allowed_multiple(self):
        UserFactory(phone=None)
        UserFactory(phone=None)  # no constraint violation

    def test_duplicate_social_account_rejected(self):
        u = UserFactory()
        SocialAccount.objects.create(user=u, provider="google", subject="abc123")
        with pytest.raises(IntegrityError):
            SocialAccount.objects.create(user=u, provider="google", subject="abc123")

    def test_parent_link_unique(self):
        link = ParentLinkFactory()
        with pytest.raises(IntegrityError):
            ParentLink.objects.create(parent=link.parent, child=link.child)

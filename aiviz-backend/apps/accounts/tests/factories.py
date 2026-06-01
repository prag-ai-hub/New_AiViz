import factory
from factory.django import DjangoModelFactory

from apps.accounts.constants import Role, SocialProvider
from apps.accounts.models import ParentLink, Profile, SocialAccount, User


class UserFactory(DjangoModelFactory):
    class Meta:
        model = User
        django_get_or_create = ("email",)

    email = factory.Sequence(lambda n: f"user{n}@example.com")
    role = Role.STUDENT
    is_active = True

    @factory.post_generation
    def password(self, create, extracted, **kwargs):
        if not create:
            return
        self.set_password(extracted or "Pa55word!")
        self.save()


class ProfileFactory(DjangoModelFactory):
    class Meta:
        model = Profile

    user = factory.SubFactory(UserFactory)


class SocialAccountFactory(DjangoModelFactory):
    class Meta:
        model = SocialAccount

    user = factory.SubFactory(UserFactory)
    provider = SocialProvider.GOOGLE
    subject = factory.Sequence(lambda n: f"google-sub-{n}")
    email_at_link = factory.LazyAttribute(lambda o: o.user.email)


class ParentLinkFactory(DjangoModelFactory):
    class Meta:
        model = ParentLink

    parent = factory.SubFactory(UserFactory, role=Role.PARENT)
    child = factory.SubFactory(UserFactory, role=Role.STUDENT)

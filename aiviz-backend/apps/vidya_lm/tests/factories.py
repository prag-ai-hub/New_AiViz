import factory
from factory.django import DjangoModelFactory

from apps.accounts.tests.factories import UserFactory
from apps.vidya_lm.constants import MessageRole, SYSTEM_PROMPT_VERSION
from apps.vidya_lm.models import Message, Session


class SessionFactory(DjangoModelFactory):
    class Meta:
        model = Session

    user = factory.SubFactory(UserFactory)
    title = "New chat"
    grade_snapshot = 8
    board_snapshot = "cbse"
    lang_snapshot = "en"
    system_prompt_version = SYSTEM_PROMPT_VERSION


class MessageFactory(DjangoModelFactory):
    class Meta:
        model = Message

    session = factory.SubFactory(SessionFactory)
    role = MessageRole.USER
    content = factory.Sequence(lambda n: f"message {n}")

import pytest

from apps.vidya_lm.constants import MessageRole, SYSTEM_PROMPT_VERSION
from apps.vidya_lm.models import Message, Session
from apps.vidya_lm.tests.factories import MessageFactory, SessionFactory


pytestmark = pytest.mark.django_db


def test_session_defaults():
    session = SessionFactory(title="New chat", grade_snapshot=None, board_snapshot="", lang_snapshot="en")
    assert session.system_prompt_version == SYSTEM_PROMPT_VERSION
    assert session.created_at is not None
    assert session.updated_at is not None


def test_message_ordering_is_chronological():
    session = SessionFactory()
    first = MessageFactory(session=session, content="first")
    second = MessageFactory(session=session, content="second", role=MessageRole.ASSISTANT)
    ordered = list(session.messages.all())
    assert ordered == [first, second]


def test_session_delete_cascades_messages():
    session = SessionFactory()
    MessageFactory.create_batch(3, session=session)
    assert Message.objects.filter(session=session).count() == 3
    session.delete()
    assert Message.objects.filter(session=session.pk).count() == 0
    assert not Session.objects.filter(pk=session.pk).exists()

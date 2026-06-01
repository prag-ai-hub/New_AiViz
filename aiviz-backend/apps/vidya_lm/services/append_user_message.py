from apps.vidya_lm.constants import AUTO_TITLE_LENGTH, MessageRole
from apps.vidya_lm.models import Message, Session


def append_user_message(*, session: Session, content: str) -> Message:
    """Persist the user's turn. Auto-titles the session if it's still the default."""
    message = Message.objects.create(session=session, role=MessageRole.USER, content=content)

    if session.title == "New chat" and content:
        title = content.strip().split("\n", 1)[0][:AUTO_TITLE_LENGTH]
        Session.objects.filter(pk=session.pk).update(title=title)

    return message

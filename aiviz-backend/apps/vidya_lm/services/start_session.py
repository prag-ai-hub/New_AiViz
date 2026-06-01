from apps.accounts.selectors.get_profile_for_user import get_profile_for_user
from apps.vidya_lm.constants import SYSTEM_PROMPT_VERSION
from apps.vidya_lm.models import Session


def start_session(*, user, title: str = "") -> Session:
    """Create a Session and freeze the user's current grade/board/lang onto it."""
    profile = get_profile_for_user(user)
    return Session.objects.create(
        user=user,
        title=title or "New chat",
        grade_snapshot=profile.grade if profile else None,
        board_snapshot=(profile.board if profile and profile.board else ""),
        lang_snapshot=(profile.lang if profile and profile.lang else "en"),
        system_prompt_version=SYSTEM_PROMPT_VERSION,
    )

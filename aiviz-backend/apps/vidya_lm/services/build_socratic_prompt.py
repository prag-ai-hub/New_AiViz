from apps.vidya_lm.models import Session
from apps.vidya_lm.prompts import build_prompt


def build_socratic_prompt(*, session: Session) -> str:
    """Resolve the system prompt for a session using its frozen profile snapshot."""
    return build_prompt(
        version=session.system_prompt_version,
        grade=session.grade_snapshot,
        board=session.board_snapshot,
        lang=session.lang_snapshot or "en",
    )

import pytest

from apps.vidya_lm.prompts import build_prompt
from apps.vidya_lm.services import build_socratic_prompt
from apps.vidya_lm.tests.factories import SessionFactory


pytestmark = pytest.mark.django_db


def test_v1_prompt_contains_grade_and_board_tokens():
    text = build_prompt(version="v1", grade=8, board="cbse", lang="en")
    assert "Vidya" in text
    assert "8" in text
    assert "cbse" in text.lower() or "CBSE" in text


def test_v1_prompt_handles_missing_grade():
    text = build_prompt(version="v1", grade=None, board="icse", lang="hi")
    assert text  # non-empty
    assert "icse" in text.lower() or "ICSE" in text


def test_unknown_version_raises():
    with pytest.raises(ValueError):
        build_prompt(version="v99", grade=8, board="cbse", lang="en")


def test_facade_uses_session_snapshot():
    session = SessionFactory(grade_snapshot=10, board_snapshot="cbse", lang_snapshot="en")
    text = build_socratic_prompt(session=session)
    assert "10" in text

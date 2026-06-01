from django.db import models


class CodeLanguage(models.TextChoices):
    """Programming languages from CBSE Skill Education syllabi (grades 6-12)."""

    SCRATCH = "scratch", "Scratch"
    HTML = "html", "HTML"
    CSS = "css", "CSS"
    JAVASCRIPT = "javascript", "JavaScript"
    PYTHON = "python", "Python"
    SQL = "sql", "SQL"


LANGUAGES_FOR_GRADE: dict[int, list[str]] = {
    6: [CodeLanguage.SCRATCH, CodeLanguage.HTML],
    7: [CodeLanguage.HTML, CodeLanguage.CSS],
    8: [CodeLanguage.PYTHON, CodeLanguage.HTML, CodeLanguage.CSS],
    9: [CodeLanguage.PYTHON, CodeLanguage.HTML, CodeLanguage.CSS],
    10: [CodeLanguage.PYTHON, CodeLanguage.HTML, CodeLanguage.CSS],
    11: [CodeLanguage.PYTHON, CodeLanguage.SQL, CodeLanguage.JAVASCRIPT, CodeLanguage.HTML, CodeLanguage.CSS],
    12: [CodeLanguage.PYTHON, CodeLanguage.SQL, CodeLanguage.JAVASCRIPT, CodeLanguage.HTML, CodeLanguage.CSS],
}


DEFAULT_FOR_GRADE: dict[int, str] = {
    6: CodeLanguage.SCRATCH,
    7: CodeLanguage.HTML,
    8: CodeLanguage.PYTHON,
    9: CodeLanguage.PYTHON,
    10: CodeLanguage.PYTHON,
    11: CodeLanguage.PYTHON,
    12: CodeLanguage.PYTHON,
}


def default_language_for_grade(grade: int | None) -> str:
    """Best-fit default language for a learner's grade. Falls back to Python."""
    if grade is None:
        return CodeLanguage.PYTHON
    return DEFAULT_FOR_GRADE.get(int(grade), CodeLanguage.PYTHON)

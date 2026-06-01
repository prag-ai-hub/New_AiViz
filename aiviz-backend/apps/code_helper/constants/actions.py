from django.db import models


class CodeAction(models.TextChoices):
    SUGGEST = "suggest", "Suggest"
    EXPLAIN = "explain", "Explain"
    DEBUG = "debug", "Debug"
    TESTS = "tests", "Tests"

from django.db import models


class Goal(models.TextChoices):
    EXAM_PREP = "exam_prep", "Exam preparation"
    CONCEPT_BUILDING = "concept_building", "Concept building"
    LANGUAGE_FLUENCY = "language_fluency", "Language fluency"
    CODING = "coding", "Coding"

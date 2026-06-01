from django.db import models


class LearningStyle(models.TextChoices):
    VISUAL = "visual", "Visual"
    AUDITORY = "auditory", "Auditory"
    KINESTHETIC = "kinesthetic", "Kinesthetic"

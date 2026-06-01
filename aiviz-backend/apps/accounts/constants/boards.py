from django.db import models


class Board(models.TextChoices):
    CBSE = "cbse", "CBSE"
    ICSE = "icse", "ICSE"
    MAHARASHTRA_STATE = "maharashtra_state", "Maharashtra State"
    OTHER = "other", "Other"

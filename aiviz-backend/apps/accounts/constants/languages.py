from django.db import models


class Language(models.TextChoices):
    EN = "en", "English"
    HI = "hi", "हिन्दी"
    MR = "mr", "मराठी"

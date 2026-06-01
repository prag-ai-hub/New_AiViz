from django.db import models


class SocialProvider(models.TextChoices):
    GOOGLE = "google", "Google"
    # APPLE reserved for Phase 2 (iOS App Store requires Apple Sign-In if any third-party is offered).

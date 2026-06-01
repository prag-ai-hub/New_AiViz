from django.db import models


class PlanCode(models.TextChoices):
    FREE = "free", "Free"
    PRO = "pro", "Pro"
    FAMILY = "family", "Family"
    INSTITUTION = "institution", "Institution"


class BillingPeriod(models.TextChoices):
    NONE = "none", "None"
    MONTHLY = "monthly", "Monthly"
    YEARLY = "yearly", "Yearly"


class SubscriptionStatus(models.TextChoices):
    ACTIVE = "active", "Active"
    PAST_DUE = "past_due", "Past due"
    CANCELLED = "cancelled", "Cancelled"
    EXPIRED = "expired", "Expired"

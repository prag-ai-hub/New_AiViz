from django.db import models


class OrderStatus(models.TextChoices):
    CREATED = "created", "Created"
    ATTEMPTED = "attempted", "Attempted"
    PAID = "paid", "Paid"
    FAILED = "failed", "Failed"
    EXPIRED = "expired", "Expired"

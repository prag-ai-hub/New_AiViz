from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.billing.services import ensure_default_subscription


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def assign_free_plan_on_user_create(sender, instance, created, **kwargs):
    """Every new User gets a Free Subscription. Idempotent for safety on edits."""
    if not created:
        return
    ensure_default_subscription(instance)

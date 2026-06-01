from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.accounts.services.create_default_profile import create_default_profile


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def ensure_profile_exists(sender, instance, created, **kwargs):
    """Auto-create a Profile row for every new User. Guarded by `created` to avoid re-runs."""
    if created:
        create_default_profile(instance)

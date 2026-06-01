from datetime import timedelta

from django.db import transaction
from django.utils import timezone

from apps.billing.constants import SubscriptionStatus
from apps.billing.models import Plan, Subscription


@transaction.atomic
def activate_subscription(user, plan_code: str, *, days: int = 30) -> Subscription:
    """Flip the user's Subscription to `plan_code`, ACTIVE for `days` from now."""
    plan = Plan.objects.get(code=plan_code)
    sub, _ = Subscription.objects.get_or_create(user=user, defaults={"plan": plan})
    sub.plan = plan
    sub.status = SubscriptionStatus.ACTIVE
    sub.started_at = timezone.now()
    sub.ends_at = sub.started_at + timedelta(days=days)
    sub.save()
    return sub

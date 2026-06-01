from apps.billing.constants import PlanCode, SubscriptionStatus
from apps.billing.models import Plan, Subscription


def ensure_default_subscription(user) -> Subscription:
    """Idempotent: every User gets exactly one Subscription, defaulting to the Free plan."""
    free = Plan.objects.get(code=PlanCode.FREE)
    sub, _ = Subscription.objects.get_or_create(
        user=user,
        defaults={"plan": free, "status": SubscriptionStatus.ACTIVE},
    )
    return sub

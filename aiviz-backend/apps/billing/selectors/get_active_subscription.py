from apps.billing.constants import SubscriptionStatus
from apps.billing.models import Subscription


def get_active_subscription(user) -> Subscription | None:
    return (
        Subscription.objects.select_related("plan")
        .filter(user=user, status=SubscriptionStatus.ACTIVE)
        .first()
    )

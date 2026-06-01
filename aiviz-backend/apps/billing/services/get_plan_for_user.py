from apps.billing.constants import PlanCode
from apps.billing.models import Plan, Subscription


def get_plan_for_user(user) -> Plan:
    """Active subscription's plan, falling back to Free if no subscription exists."""
    sub = (
        Subscription.objects.select_related("plan")
        .filter(user=user, status="active")
        .first()
    )
    return sub.plan if sub else Plan.objects.get(code=PlanCode.FREE)

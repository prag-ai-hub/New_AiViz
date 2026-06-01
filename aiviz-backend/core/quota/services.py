from datetime import date

from django.db import transaction
from django.db.models import F
from django.utils import timezone

from apps.billing.constants import COMBINED_KEY, PlanCode
from apps.billing.models import Plan, Subscription, UsageQuota

from .exceptions import QuotaExceeded


def _today() -> date:
    return timezone.localdate()


def _active_plan(user) -> Plan:
    """Return user's active plan, falling back to Free if subscription missing."""
    sub = Subscription.objects.select_related("plan").filter(user=user, status="active").first()
    if sub is not None:
        return sub.plan
    return Plan.objects.get(code=PlanCode.FREE)


def check_quota(user, tool_key: str, cost: int = 1) -> None:
    """Raise QuotaExceeded if running this op would push the user over their plan's limit."""
    plan = _active_plan(user)
    combined_limit = plan.combined_daily_limit
    tool_limit = plan.per_tool_limit(tool_key)
    today = _today()

    if combined_limit is not None:
        used = UsageQuota.objects.filter(user=user, tool_key=COMBINED_KEY, day=today).values_list("count", flat=True).first() or 0
        if used + cost > combined_limit:
            raise QuotaExceeded(scope="combined", current_plan=plan.code)

    if tool_limit is not None:
        used = UsageQuota.objects.filter(user=user, tool_key=tool_key, day=today).values_list("count", flat=True).first() or 0
        if used + cost > tool_limit:
            raise QuotaExceeded(scope=tool_key, current_plan=plan.code)


def increment_quota(user, tool_key: str, cost: int = 1) -> None:
    """Atomic increment of combined + per-tool counters for today."""
    today = _today()
    with transaction.atomic():
        for key in (COMBINED_KEY, tool_key):
            quota, _ = UsageQuota.objects.get_or_create(user=user, tool_key=key, day=today)
            UsageQuota.objects.filter(pk=quota.pk).update(count=F("count") + cost)

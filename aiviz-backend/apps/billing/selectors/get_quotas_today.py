from django.utils import timezone

from apps.billing.constants import COMBINED_KEY, TOOL_KEYS
from apps.billing.models import UsageQuota
from apps.billing.services.get_plan_for_user import get_plan_for_user


def get_quotas_today(user) -> dict:
    """Snapshot of the user's current plan + today's used/limit per tool + combined.

    Returned shape:
      {
        "plan_code": "free",
        "limits": {
          "_combined":  {"used": 2, "limit": 5,   "remaining": 3},
          "vidya_lm":   {"used": 1, "limit": null,"remaining": null},
          ...
        }
      }
    `null` limit means unlimited; remaining is null in that case too.
    """
    plan = get_plan_for_user(user)
    today = timezone.localdate()

    counts = {
        row.tool_key: row.count
        for row in UsageQuota.objects.filter(user=user, day=today)
    }

    def _entry(tool_key: str, limit: int | None) -> dict:
        used = counts.get(tool_key, 0)
        return {
            "used": used,
            "limit": limit,
            "remaining": None if limit is None else max(0, limit - used),
        }

    limits = {COMBINED_KEY: _entry(COMBINED_KEY, plan.combined_daily_limit)}
    for tool_key in TOOL_KEYS:
        limits[tool_key] = _entry(tool_key, plan.per_tool_limit(tool_key))

    return {"plan_code": plan.code, "limits": limits}

from django.db import models

from apps.billing.constants import BillingPeriod, PlanCode


class Plan(models.Model):
    code = models.CharField(max_length=24, choices=PlanCode.choices, unique=True)
    name = models.CharField(max_length=64)
    price_inr = models.PositiveIntegerField(null=True, blank=True, help_text="Price in paise. NULL = sales-led")
    billing_period = models.CharField(
        max_length=16, choices=BillingPeriod.choices, default=BillingPeriod.NONE
    )
    is_active = models.BooleanField(default=True)
    features = models.JSONField(default=dict, help_text="See apps/billing/constants/plan_features.py")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["price_inr"]

    def __str__(self) -> str:
        return f"{self.name} ({self.code})"

    @property
    def combined_daily_limit(self) -> int | None:
        return self.features.get("combined_daily_limit")

    def per_tool_limit(self, tool_key: str) -> int | None:
        return self.features.get("per_tool_daily_limits", {}).get(tool_key)

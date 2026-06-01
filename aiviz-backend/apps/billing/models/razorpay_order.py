from django.conf import settings
from django.db import models

from apps.billing.constants import OrderStatus


class RazorpayOrder(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="razorpay_orders",
    )
    razorpay_order_id = models.CharField(max_length=64, unique=True)
    razorpay_payment_id = models.CharField(max_length=64, blank=True, default="")
    razorpay_payment_link_id = models.CharField(max_length=64, blank=True, default="")
    payment_link_short_url = models.URLField(blank=True, default="")
    amount_inr = models.PositiveIntegerField(help_text="Paise")
    currency = models.CharField(max_length=8, default="INR")
    status = models.CharField(max_length=16, choices=OrderStatus.choices, default=OrderStatus.CREATED)
    plan_code = models.CharField(max_length=24)
    receipt_id = models.CharField(max_length=64, unique=True)
    raw_webhook_payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["user", "status"]),
            models.Index(fields=["razorpay_payment_id"]),
        ]
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"RPOrder<{self.razorpay_order_id} {self.status} ₹{self.amount_inr / 100:.2f}>"

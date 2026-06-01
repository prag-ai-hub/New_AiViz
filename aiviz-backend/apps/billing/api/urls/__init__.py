from django.urls import path

from apps.billing.api.views import (
    CreateOrderView,
    ListPlansView,
    MyQuotaView,
    MySubscriptionView,
    RazorpayWebhookView,
)

app_name = "billing"

urlpatterns = [
    path("plans", ListPlansView.as_view(), name="plans"),
    path("subscription", MySubscriptionView.as_view(), name="subscription"),
    path("orders", CreateOrderView.as_view(), name="create-order"),
    path("quota", MyQuotaView.as_view(), name="quota"),
    path("webhook/razorpay", RazorpayWebhookView.as_view(), name="razorpay-webhook"),
]

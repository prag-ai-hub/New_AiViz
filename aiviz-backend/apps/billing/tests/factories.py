import factory
from factory.django import DjangoModelFactory

from apps.accounts.tests.factories import UserFactory
from apps.billing.constants import OrderStatus, PlanCode, SubscriptionStatus
from apps.billing.models import Plan, RazorpayOrder, Subscription, UsageQuota


class PlanFactory(DjangoModelFactory):
    class Meta:
        model = Plan
        django_get_or_create = ("code",)

    code = PlanCode.PRO
    name = "Pro"
    price_inr = 19900
    is_active = True
    features = {"combined_daily_limit": None, "per_tool_daily_limits": {"image_gen": 20}}


class SubscriptionFactory(DjangoModelFactory):
    class Meta:
        model = Subscription
        django_get_or_create = ("user",)

    user = factory.SubFactory(UserFactory)
    plan = factory.SubFactory(PlanFactory)
    status = SubscriptionStatus.ACTIVE


class RazorpayOrderFactory(DjangoModelFactory):
    class Meta:
        model = RazorpayOrder

    user = factory.SubFactory(UserFactory)
    razorpay_order_id = factory.Sequence(lambda n: f"order_{n}")
    receipt_id = factory.Sequence(lambda n: f"rcpt_{n}")
    amount_inr = 19900
    plan_code = PlanCode.PRO
    status = OrderStatus.CREATED


class UsageQuotaFactory(DjangoModelFactory):
    class Meta:
        model = UsageQuota

    user = factory.SubFactory(UserFactory)
    tool_key = "image_gen"
    count = 0

import pytest
from django.db import IntegrityError
from django.utils import timezone

from apps.billing.constants import PlanCode
from apps.billing.models import Plan, Subscription, UsageQuota

from .factories import UsageQuotaFactory


@pytest.mark.django_db
class TestPlans:
    def test_4_plans_seeded(self):
        assert Plan.objects.count() == 4
        codes = set(Plan.objects.values_list("code", flat=True))
        assert codes == {PlanCode.FREE, PlanCode.PRO, PlanCode.FAMILY, PlanCode.INSTITUTION}


@pytest.mark.django_db
class TestDefaultSubscriptionSignal:
    def test_new_user_gets_free_subscription(self, auth_client):
        # auth_client.user was just created by UserFactory → signal should have fired
        sub = Subscription.objects.get(user=auth_client.user)
        assert sub.plan.code == PlanCode.FREE
        assert sub.status == "active"


@pytest.mark.django_db
class TestUsageQuotaConstraint:
    def test_unique_user_tool_day(self, auth_client):
        today = timezone.localdate()
        UsageQuotaFactory(user=auth_client.user, tool_key="image_gen", day=today)
        with pytest.raises(IntegrityError):
            UsageQuota.objects.create(user=auth_client.user, tool_key="image_gen", day=today)

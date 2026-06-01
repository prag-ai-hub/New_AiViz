import pytest
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.test import APIRequestFactory, force_authenticate
from rest_framework.views import APIView

from apps.billing.constants import COMBINED_KEY, PlanCode
from apps.billing.models import Plan, Subscription, UsageQuota
from core.quota import quota_required


# Bypass auth/permissions on the stub views — we're testing the decorator, not auth.
class _StubView(APIView):
    permission_classes = [AllowAny]
    authentication_classes: list = []

    @quota_required("image_gen", cost=1)
    def post(self, request):
        return Response({"ok": True}, status=200)


def _call(view, user):
    """Build a POST request, attach the user via force_authenticate, dispatch."""
    factory = APIRequestFactory()
    request = factory.post("/")
    force_authenticate(request, user=user)
    return view(request)


@pytest.mark.django_db
class TestQuotaDecoratorFreeTier:
    def test_under_limit_succeeds_and_increments(self, auth_client):
        view = _StubView.as_view()
        for _ in range(5):
            response = _call(view, auth_client.user)
            assert response.status_code == 200, response.data
        combined = UsageQuota.objects.get(user=auth_client.user, tool_key=COMBINED_KEY)
        assert combined.count == 5

    def test_over_combined_limit_402(self, auth_client):
        view = _StubView.as_view()
        for _ in range(5):
            _call(view, auth_client.user)
        # DRF catches APIException → returns 402 Response.
        response = _call(view, auth_client.user)
        assert response.status_code == 402
        assert response.data["error"]["code"] == "quota_exceeded"
        assert response.data["error"]["detail"]["scope"] == "combined"
        assert response.data["error"]["detail"]["current_plan"] == PlanCode.FREE


@pytest.mark.django_db
class TestQuotaDecoratorPro:
    def _set_pro(self, user):
        sub = Subscription.objects.get(user=user)
        sub.plan = Plan.objects.get(code=PlanCode.PRO)
        sub.save()

    def test_unlimited_lm_within_pro(self, auth_client):
        self._set_pro(auth_client.user)

        class _LmView(APIView):
            permission_classes = [AllowAny]
            authentication_classes: list = []

            @quota_required("vidya_lm")
            def post(self, request):
                return Response({"ok": True}, status=200)

        view = _LmView.as_view()
        for _ in range(30):
            assert _call(view, auth_client.user).status_code == 200

    def test_per_tool_limit_on_pro_image_gen(self, auth_client):
        self._set_pro(auth_client.user)
        view = _StubView.as_view()  # image_gen, limit=20 on pro
        for _ in range(20):
            assert _call(view, auth_client.user).status_code == 200
        response = _call(view, auth_client.user)
        assert response.status_code == 402
        assert response.data["error"]["detail"]["scope"] == "image_gen"


@pytest.mark.django_db
class TestQuotaDecoratorFailureNoCharge:
    def test_view_failure_does_not_increment(self, auth_client):
        class _FailingView(APIView):
            permission_classes = [AllowAny]
            authentication_classes: list = []

            @quota_required("image_gen")
            def post(self, request):
                return Response({"err": True}, status=500)

        view = _FailingView.as_view()
        _call(view, auth_client.user)
        combined = UsageQuota.objects.filter(user=auth_client.user, tool_key=COMBINED_KEY).first()
        assert combined is None or combined.count == 0

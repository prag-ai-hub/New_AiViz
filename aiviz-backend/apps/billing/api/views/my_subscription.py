from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.billing.api.serializers import SubscriptionSerializer
from apps.billing.selectors import get_active_subscription
from apps.billing.services import ensure_default_subscription


class MySubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sub = get_active_subscription(request.user) or ensure_default_subscription(request.user)
        return Response(SubscriptionSerializer(sub).data)

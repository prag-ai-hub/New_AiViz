from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.billing.api.serializers import PlanSerializer
from apps.billing.selectors import list_active_plans


class ListPlansView(APIView):
    """Public — paywall + signup flow need to show plans before login."""

    permission_classes = [AllowAny]

    def get(self, request):
        plans = list_active_plans()
        return Response(PlanSerializer(plans, many=True).data)

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.billing.api.serializers import QuotaSnapshotSerializer
from apps.billing.selectors import get_quotas_today


class MyQuotaView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        snapshot = get_quotas_today(request.user)
        return Response(QuotaSnapshotSerializer(snapshot).data)

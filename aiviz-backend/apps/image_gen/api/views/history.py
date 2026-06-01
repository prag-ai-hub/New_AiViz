from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated

from apps.image_gen.api.serializers import ImageAssetSerializer
from apps.image_gen.models import ImageAsset


class HistoryPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 50


class HistoryView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ImageAssetSerializer
    pagination_class = HistoryPagination

    def get_queryset(self):
        return (
            ImageAsset.objects.filter(user=self.request.user)
            .order_by("-created_at")
        )

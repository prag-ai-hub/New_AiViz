from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated

from apps.notebook.api.serializers import TagSerializer
from apps.notebook.models import Tag


class TagListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TagSerializer
    pagination_class = None

    def get_queryset(self):
        return Tag.objects.filter(user=self.request.user).order_by("name")

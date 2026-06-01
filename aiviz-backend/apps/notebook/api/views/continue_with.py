from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.notebook.api.serializers import ContinueWithRequestSerializer
from apps.notebook.models import NotebookEntry
from apps.notebook.services import resolve_continue_with


class ContinueWithView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk: int):
        entry = get_object_or_404(NotebookEntry, pk=pk, user=request.user)
        serializer = ContinueWithRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = resolve_continue_with(
            entry=entry,
            target=serializer.validated_data["target"],
        )
        return Response(payload)

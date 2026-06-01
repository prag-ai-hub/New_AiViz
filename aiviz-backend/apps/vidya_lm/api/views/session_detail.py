from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.vidya_lm.api.serializers import SessionDetailSerializer, SessionSerializer
from apps.vidya_lm.selectors import get_owned_session


class SessionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk: int):
        session = get_owned_session(pk=pk, user=request.user)
        return Response(SessionDetailSerializer(session).data)

    def patch(self, request, pk: int):
        session = get_owned_session(pk=pk, user=request.user)
        title = (request.data or {}).get("title")
        if title is not None:
            title = str(title).strip()[:120]
            if title:
                session.title = title
                session.save(update_fields=["title", "updated_at"])
        return Response(SessionSerializer(session).data)

    def delete(self, request, pk: int):
        session = get_owned_session(pk=pk, user=request.user)
        session.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

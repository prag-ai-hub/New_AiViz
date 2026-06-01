from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.vidya_lm.api.serializers import SessionListSerializer, SessionSerializer
from apps.vidya_lm.selectors import list_user_sessions
from apps.vidya_lm.services import start_session


class SessionListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sessions = list_user_sessions(user=request.user)
        return Response(SessionListSerializer(sessions, many=True).data)

    def post(self, request):
        title = (request.data or {}).get("title") or ""
        session = start_session(user=request.user, title=title)
        return Response(SessionSerializer(session).data, status=status.HTTP_201_CREATED)

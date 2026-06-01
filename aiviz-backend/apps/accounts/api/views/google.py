from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.api.serializers import GoogleAuthSerializer, UserSerializer
from apps.accounts.services import issue_tokens, verify_google_token


class GoogleAuthView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        payload = GoogleAuthSerializer(data=request.data)
        payload.is_valid(raise_exception=True)
        user, created = verify_google_token(payload.validated_data["id_token"])
        return Response(
            {
                "user": UserSerializer(user).data,
                "tokens": issue_tokens(user),
                "created": created,
            }
        )

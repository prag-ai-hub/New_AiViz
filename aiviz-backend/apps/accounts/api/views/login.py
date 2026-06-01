from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.api.serializers import LoginSerializer, UserSerializer
from apps.accounts.services import authenticate_user, issue_tokens


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        payload = LoginSerializer(data=request.data)
        payload.is_valid(raise_exception=True)
        user = authenticate_user(**payload.validated_data)
        return Response({"user": UserSerializer(user).data, "tokens": issue_tokens(user)})

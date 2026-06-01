from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.api.serializers import SignupSerializer, UserSerializer
from apps.accounts.services import signup_user


class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        payload = SignupSerializer(data=request.data)
        payload.is_valid(raise_exception=True)
        user, tokens = signup_user(**payload.validated_data)
        return Response(
            {"user": UserSerializer(user).data, "tokens": tokens},
            status=status.HTTP_201_CREATED,
        )

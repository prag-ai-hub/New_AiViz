from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.api.serializers import ProfileSerializer
from apps.accounts.services import update_profile


class PatchProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        payload = ProfileSerializer(data=request.data, partial=True)
        payload.is_valid(raise_exception=True)
        profile = update_profile(request.user, **payload.validated_data)
        return Response(ProfileSerializer(profile).data)

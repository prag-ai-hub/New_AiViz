from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.api.serializers import LearningStyleQuizSerializer
from apps.accounts.services import infer_learning_style


class LearningStyleQuizView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        payload = LearningStyleQuizSerializer(data=request.data)
        payload.is_valid(raise_exception=True)
        winner, scores = infer_learning_style(payload.validated_data["answers"])
        return Response({"learning_style": winner, "scores": scores})

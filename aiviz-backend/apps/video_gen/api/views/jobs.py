from rest_framework import status
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.video_gen.api.serializers import VideoJobSerializer
from apps.video_gen.constants import VideoJobStatus
from apps.video_gen.models import VideoJob


class JobsListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = VideoJobSerializer

    def get_queryset(self):
        return VideoJob.objects.filter(user=self.request.user).order_by("-created_at")


class JobDetailView(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = VideoJobSerializer

    def get_queryset(self):
        return VideoJob.objects.filter(user=self.request.user)


class JobCancelView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk: int):
        try:
            job = VideoJob.objects.get(pk=pk, user=request.user)
        except VideoJob.DoesNotExist:
            return Response(
                {"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND
            )
        if job.status != VideoJobStatus.PENDING:
            return Response(
                {"detail": "Can only cancel jobs that haven't started yet."},
                status=status.HTTP_409_CONFLICT,
            )
        job.status = VideoJobStatus.CANCELED
        job.save(update_fields=["status"])
        return Response(VideoJobSerializer(job).data, status=status.HTTP_200_OK)

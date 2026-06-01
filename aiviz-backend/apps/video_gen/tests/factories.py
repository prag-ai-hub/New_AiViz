import factory
from factory.django import DjangoModelFactory

from apps.accounts.tests.factories import UserFactory
from apps.video_gen.constants import VideoJobStatus
from apps.video_gen.models import VideoJob


class VideoJobFactory(DjangoModelFactory):
    class Meta:
        model = VideoJob

    user = factory.SubFactory(UserFactory)
    prompt = "a calm sunset over mountains"
    refined_prompt = ""
    model = "fal-ai/kling-video/v1/standard/image-to-video"
    status = VideoJobStatus.SUCCEEDED
    url = factory.Sequence(lambda n: f"https://r2.example/video/{n}.mp4")
    seed_image_url = factory.Sequence(lambda n: f"https://r2.example/seed/{n}.png")
    duration_seconds = 5.0

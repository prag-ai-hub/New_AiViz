import factory
from factory.django import DjangoModelFactory

from apps.accounts.tests.factories import UserFactory
from apps.image_gen.constants import StylePreset
from apps.image_gen.models import ImageAsset, ImageAssetStatus


class ImageAssetFactory(DjangoModelFactory):
    class Meta:
        model = ImageAsset

    user = factory.SubFactory(UserFactory)
    prompt = "a cat astronaut"
    refined_prompt = ""
    style = StylePreset.CARTOON
    model = "fal-ai/flux/schnell"
    width = 1024
    height = 1024
    r2_key = factory.Sequence(lambda n: f"image-gen/test/{n}.png")
    provider_request_id = factory.Sequence(lambda n: f"fal_test_{n}")
    status = ImageAssetStatus.SUCCEEDED

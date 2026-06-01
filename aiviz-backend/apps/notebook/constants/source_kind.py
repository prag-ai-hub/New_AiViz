from django.db import models


class SourceKind(models.TextChoices):
    VIDYA_LM = "vidya_lm", "Vidya LM"
    IMAGE_GEN = "image_gen", "Image Gen"
    VIDEO_GEN = "video_gen", "Video Gen"
    CODE_HELPER = "code_helper", "Code Helper"

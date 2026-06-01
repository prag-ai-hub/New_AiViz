from rest_framework import status
from rest_framework.exceptions import APIException


class ImageGenUnavailable(APIException):
    """Raised when Replicate / R2 isn't configured or unreachable."""

    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = "Image generator is offline."
    default_code = "image_gen_unavailable"

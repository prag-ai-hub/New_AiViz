from rest_framework import status
from rest_framework.exceptions import APIException


class OpenAIUnavailable(APIException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = "OpenAI isn't configured on this server."
    default_code = "openai_not_configured"

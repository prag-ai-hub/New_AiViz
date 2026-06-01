from rest_framework import status
from rest_framework.exceptions import APIException


class UnsupportedTransition(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "This source can't be used as input for that tool."
    default_code = "unsupported_transition"

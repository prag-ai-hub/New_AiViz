from rest_framework import status
from rest_framework.exceptions import APIException


class PlanNotFound(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Unknown plan_code."
    default_code = "plan_not_found"


class PaymentsNotConfigured(APIException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = "Payments aren't configured on this server yet."
    default_code = "payments_not_configured"


class WebhookSignatureInvalid(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Invalid webhook signature."
    default_code = "webhook_signature_invalid"

from rest_framework import status
from rest_framework.exceptions import APIException


class QuotaExceeded(APIException):
    status_code = status.HTTP_402_PAYMENT_REQUIRED
    default_detail = "You've hit your daily limit on this tool."
    default_code = "quota_exceeded"

    def __init__(self, *, scope: str, current_plan: str, upgrade_to: str = "pro"):
        self.scope = scope
        self.current_plan = current_plan
        self.upgrade_to = upgrade_to
        super().__init__(detail={
            "scope": scope,
            "current_plan": current_plan,
            "upgrade_to": upgrade_to,
        })

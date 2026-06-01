from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.billing.services import process_razorpay_webhook


@method_decorator(csrf_exempt, name="dispatch")
class RazorpayWebhookView(APIView):
    """Razorpay → us. Anonymous (signature is the guard). No throttling so retries succeed."""

    permission_classes = [AllowAny]
    throttle_classes: list = []

    def post(self, request):
        signature = request.headers.get("X-Razorpay-Signature", "")
        result = process_razorpay_webhook(raw_body=request.body, signature_header=signature)
        return Response(result)

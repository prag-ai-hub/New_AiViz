from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.billing.api.serializers import OrderRequestSerializer, OrderResponseSerializer
from apps.billing.services import create_razorpay_order


class CreateOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        payload = OrderRequestSerializer(data=request.data)
        payload.is_valid(raise_exception=True)
        order = create_razorpay_order(user=request.user, plan_code=payload.validated_data["plan_code"])
        return Response(OrderResponseSerializer(order).data, status=status.HTTP_201_CREATED)

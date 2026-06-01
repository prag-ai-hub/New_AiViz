from rest_framework import serializers

from apps.vidya_lm.api.serializers.message import MessageSerializer
from apps.vidya_lm.api.serializers.session import SessionSerializer
from apps.vidya_lm.models import Session


class SessionDetailSerializer(SessionSerializer):
    messages = MessageSerializer(many=True, read_only=True)

    class Meta(SessionSerializer.Meta):
        model = Session
        fields = [*SessionSerializer.Meta.fields, "messages"]

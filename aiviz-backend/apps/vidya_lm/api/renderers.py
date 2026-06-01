from rest_framework.renderers import BaseRenderer


class ServerSentEventsRenderer(BaseRenderer):
    """Marker renderer so DRF's content negotiation accepts text/event-stream.

    The view returns a StreamingHttpResponse directly, which bypasses DRF's
    renderer pipeline, so this `render` is effectively unreachable.
    """

    media_type = "text/event-stream"
    format = "sse"
    charset = "utf-8"

    def render(self, data, accepted_media_type=None, renderer_context=None):
        if isinstance(data, bytes):
            return data
        if isinstance(data, str):
            return data.encode(self.charset)
        return b""

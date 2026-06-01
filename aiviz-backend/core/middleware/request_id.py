import uuid

REQUEST_ID_HEADER = "X-Request-Id"


class RequestIdMiddleware:
    """Attach an X-Request-Id to every request/response for tracing.

    Reuses the inbound header if the client sent one, otherwise mints a uuid4.
    Attached to `request.request_id` so views and logs can pick it up.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        rid = request.headers.get(REQUEST_ID_HEADER) or uuid.uuid4().hex
        request.request_id = rid
        response = self.get_response(request)
        response[REQUEST_ID_HEADER] = rid
        return response

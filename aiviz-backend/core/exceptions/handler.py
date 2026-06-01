from rest_framework.views import exception_handler as drf_default


def exception_handler(exc, context):
    """Wrap DRF errors in a stable envelope: { error: { code, detail, request_id } }."""
    response = drf_default(exc, context)
    if response is None:
        return None

    request = context.get("request")
    request_id = getattr(request, "request_id", None) if request else None

    code = getattr(exc, "default_code", exc.__class__.__name__).lower()
    response.data = {
        "error": {
            "code": code,
            "detail": response.data,
            "request_id": request_id,
        }
    }
    return response

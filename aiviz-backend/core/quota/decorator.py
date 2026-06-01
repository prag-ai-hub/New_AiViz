from functools import wraps

from rest_framework.response import Response

from .services import check_quota, increment_quota


def quota_required(tool_key: str, *, cost: int = 1):
    """Decorator for DRF APIView methods (or function views) that consume tool quota.

    Usage:
        class ImageGenView(APIView):
            @quota_required("image_gen", cost=1)
            def post(self, request, ...):
                ...

    Checks the user's plan limits before running the view. If the view returns a
    2xx response, increments the counters. Failures don't charge quota.
    """

    def decorator(view_func):
        @wraps(view_func)
        def wrapped(self_or_request, *args, **kwargs):
            # APIView methods receive (self, request, ...); function views receive (request, ...).
            request = args[0] if hasattr(self_or_request, "request") is False and args else getattr(self_or_request, "request", None) or self_or_request
            user = request.user
            check_quota(user, tool_key, cost)  # raises QuotaExceeded → 402

            response = view_func(self_or_request, *args, **kwargs)

            status_code = getattr(response, "status_code", 0)
            if isinstance(response, Response) and 200 <= status_code < 300:
                increment_quota(user, tool_key, cost)
            return response

        return wrapped

    return decorator

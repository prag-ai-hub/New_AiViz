from rest_framework.exceptions import APIException


class VideoGenUnavailable(APIException):
    status_code = 503
    default_detail = "Video service is not configured."
    default_code = "video_gen_unavailable"

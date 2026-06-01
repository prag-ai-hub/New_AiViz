class R2Error(Exception):
    """Wraps any R2 / boto3 failure."""


class R2NotConfigured(R2Error):
    """Raised when R2 credentials are missing from settings."""

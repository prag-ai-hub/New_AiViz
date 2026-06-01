class FalError(Exception):
    """Wraps any fal.ai SDK or HTTP failure."""


class FalNotConfigured(FalError):
    """Raised when FAL_KEY is missing from settings."""

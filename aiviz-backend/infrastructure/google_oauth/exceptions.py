class GoogleTokenError(Exception):
    """Raised when an inbound Google ID token fails verification."""

    def __init__(self, message: str = "Invalid Google ID token."):
        super().__init__(message)

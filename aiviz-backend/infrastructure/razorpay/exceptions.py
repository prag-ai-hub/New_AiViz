class RazorpayError(Exception):
    """Raised when the Razorpay client cannot be initialised or an API call fails."""


class RazorpayNotConfigured(RazorpayError):
    """Raised when RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are missing."""

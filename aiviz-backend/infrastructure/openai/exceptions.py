class OpenAIError(Exception):
    """Base class for OpenAI-adapter failures."""


class OpenAINotConfigured(OpenAIError):
    """Raised when OPENAI_API_KEY is missing from settings."""

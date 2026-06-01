"""Tunable constants for the Vidya LM chat service. Most can also be overridden via
settings.VIDYA_LM (env-driven) but defaults live here."""

# Bumped when the Socratic prompt template changes in a non-backwards-compatible way.
# Older Sessions keep their snapshotted version so their tutor behaviour doesn't shift.
SYSTEM_PROMPT_VERSION = "v1"

# Max conversation history sent to OpenAI per turn (system prompt is added on top).
MAX_HISTORY_MESSAGES = 20

DEFAULT_MODEL = "gpt-4o-mini"
DEFAULT_TEMPERATURE = 0.7

# How many chars from the first user message become the auto-title.
AUTO_TITLE_LENGTH = 60

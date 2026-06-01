"""Canonical tool keys used in UsageQuota.tool_key and the @quota_required decorator.
These must stay in sync with `src/core/tools/registry/tools.ts` on the frontend."""

COMBINED_KEY = "_combined"

TOOL_KEYS = (
    "vidya_lm",
    "code_helper",
    "speech_tutor",
    "image_gen",
    "video_gen",
    "music_gen",
    "avatar",
    "skillguru",
)

ALL_QUOTA_KEYS = (COMBINED_KEY, *TOOL_KEYS)

from django.db import models


class StylePreset(models.TextChoices):
    CARTOON = "cartoon", "Cartoon"
    WATERCOLOR = "watercolor", "Watercolor"
    CRAYON = "crayon", "Crayon"
    SKETCH = "sketch", "Sketch"
    ANIME = "anime", "Anime"
    PHOTO_REAL = "photo_real", "Photo-Real"
    ISOMETRIC = "isometric", "Isometric"
    DIGITAL_ART = "digital_art", "Digital Art"
    PIXEL = "pixel", "Pixel Art"


STYLE_PROMPT_SUFFIX: dict[str, str] = {
    StylePreset.CARTOON: "in vibrant cartoon style, kid-friendly, bold lines, bright colors",
    StylePreset.WATERCOLOR: "in soft watercolor painting style, gentle brush strokes",
    StylePreset.CRAYON: "in colorful crayon drawing style, hand-drawn on textured paper",
    StylePreset.SKETCH: "in detailed pencil sketch style, monochrome with cross-hatching",
    StylePreset.ANIME: "in modern anime art style, clean lines, expressive characters",
    StylePreset.PHOTO_REAL: "photo-realistic, natural lighting, high detail",
    StylePreset.ISOMETRIC: "isometric illustration, clean geometric shapes, 45-degree perspective",
    StylePreset.DIGITAL_ART: "polished digital illustration, smooth gradients, professional",
    StylePreset.PIXEL: "8-bit pixel art, retro game aesthetic, crisp pixels",
}


_BASE = [
    StylePreset.CARTOON,
    StylePreset.WATERCOLOR,
    StylePreset.CRAYON,
    StylePreset.ANIME,
    StylePreset.PIXEL,
]
_INTERMEDIATE = _BASE + [
    StylePreset.SKETCH,
    StylePreset.DIGITAL_ART,
    StylePreset.ISOMETRIC,
]
_ALL = _INTERMEDIATE + [StylePreset.PHOTO_REAL]


STYLES_FOR_GRADE: dict[int, list[str]] = {
    6: _BASE,
    7: _BASE,
    8: _BASE,
    9: _INTERMEDIATE,
    10: _INTERMEDIATE,
    11: _ALL,
    12: _ALL,
}


def styles_for_grade(grade: int | None) -> list[str]:
    """Kid-safe style presets allowed for a given grade. Null falls back to the safest subset."""
    if grade is None:
        return [StylePreset.CARTOON, StylePreset.WATERCOLOR, StylePreset.CRAYON]
    return STYLES_FOR_GRADE.get(int(grade), _BASE)

"""Source of truth for plan tier limits. Used by the 0002_seed_plans migration to populate
Plan.features. Also used by the @quota_required decorator at runtime to read limits."""

from .plan_codes import BillingPeriod, PlanCode

# price_inr is in PAISE (₹199 = 19900). Use None for sales-led tiers.
DEFAULT_FEATURES_BY_PLAN: dict[str, dict] = {
    PlanCode.FREE.value: {
        "name": "Free",
        "price_inr": 0,
        "billing_period": BillingPeriod.NONE.value,
        "features": {
            "combined_daily_limit": 5,
            "per_tool_daily_limits": {},
            "watermark": True,
            "parent_dashboard": False,
        },
    },
    PlanCode.PRO.value: {
        "name": "Pro",
        "price_inr": 19900,
        "billing_period": BillingPeriod.MONTHLY.value,
        "features": {
            "combined_daily_limit": None,
            "per_tool_daily_limits": {
                "image_gen": 20,
                "video_gen": 5,
                "music_gen": 10,
            },
            "watermark": False,
            "parent_dashboard": False,
        },
    },
    PlanCode.FAMILY.value: {
        "name": "Family",
        "price_inr": 39900,
        "billing_period": BillingPeriod.MONTHLY.value,
        "features": {
            "combined_daily_limit": None,
            "per_tool_daily_limits": {
                "image_gen": 20,
                "video_gen": 5,
                "music_gen": 10,
            },
            "watermark": False,
            "parent_dashboard": True,
            "family_seats": 4,
        },
    },
    PlanCode.INSTITUTION.value: {
        "name": "Institution",
        "price_inr": None,
        "billing_period": BillingPeriod.YEARLY.value,
        "features": {
            "combined_daily_limit": None,
            "per_tool_daily_limits": {},
            "watermark": False,
            "parent_dashboard": True,
            "sales_led": True,
        },
    },
}

from django.db import migrations

from apps.billing.constants import DEFAULT_FEATURES_BY_PLAN


def seed_plans(apps, schema_editor):
    Plan = apps.get_model("billing", "Plan")
    for code, definition in DEFAULT_FEATURES_BY_PLAN.items():
        Plan.objects.update_or_create(
            code=code,
            defaults={
                "name": definition["name"],
                "price_inr": definition.get("price_inr"),
                "billing_period": definition.get("billing_period", "none"),
                "is_active": True,
                "features": definition.get("features", {}),
            },
        )


def unseed_plans(apps, schema_editor):
    Plan = apps.get_model("billing", "Plan")
    Plan.objects.filter(code__in=DEFAULT_FEATURES_BY_PLAN.keys()).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("billing", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_plans, reverse_code=unseed_plans),
    ]

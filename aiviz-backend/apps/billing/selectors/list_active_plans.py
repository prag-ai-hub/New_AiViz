from apps.billing.models import Plan


def list_active_plans():
    return Plan.objects.filter(is_active=True).order_by("price_inr")

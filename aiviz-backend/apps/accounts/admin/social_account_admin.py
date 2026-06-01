from django.contrib import admin

from apps.accounts.models import SocialAccount


@admin.register(SocialAccount)
class SocialAccountAdmin(admin.ModelAdmin):
    list_display = ("user", "provider", "subject", "email_at_link", "created_at")
    list_filter = ("provider",)
    search_fields = ("user__email", "subject", "email_at_link")
    raw_id_fields = ("user",)

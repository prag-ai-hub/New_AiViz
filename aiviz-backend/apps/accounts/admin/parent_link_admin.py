from django.contrib import admin

from apps.accounts.models import ParentLink


@admin.register(ParentLink)
class ParentLinkAdmin(admin.ModelAdmin):
    list_display = ("parent", "child", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("parent__email", "child__email")
    raw_id_fields = ("parent", "child")

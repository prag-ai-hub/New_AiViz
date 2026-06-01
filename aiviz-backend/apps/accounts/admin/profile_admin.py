from django.contrib import admin

from apps.accounts.models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "grade", "board", "lang", "updated_at")
    list_filter = ("board", "lang", "learning_style")
    search_fields = ("user__email", "user__phone")
    raw_id_fields = ("user",)

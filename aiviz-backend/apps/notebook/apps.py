from django.apps import AppConfig


class NotebookConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.notebook"

    def ready(self) -> None:
        # Side-effect import wires @receiver handlers for every source model.
        from apps.notebook.signals import handlers  # noqa: F401

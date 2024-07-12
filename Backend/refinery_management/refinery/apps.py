from django.apps import AppConfig

class RefineryConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'refinery'

    def ready(self):
        import refinery.signals

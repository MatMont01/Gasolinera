import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'refinery_management.settings')
django.setup()

print("Django settings loaded successfully!")

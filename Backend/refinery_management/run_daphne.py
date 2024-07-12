import os
from daphne.cli import CommandLineInterface

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'refinery_management.settings')

CommandLineInterface().run(['daphne', '-b', '127.0.0.1', '-p', '8002', 'refinery_management.asgi:application'])

"""
ASGI config for saudi_silver project.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'saudi_silver.settings')

application = get_asgi_application()









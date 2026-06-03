"""
WSGI config for saudi_silver project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'saudi_silver.settings')

application = get_wsgi_application()









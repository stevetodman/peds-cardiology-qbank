"""WSGI config for chd_platform project."""
from __future__ import annotations

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "chd_platform.settings")

application = get_wsgi_application()

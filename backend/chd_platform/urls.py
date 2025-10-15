"""chd_platform URL Configuration."""
from __future__ import annotations

from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("questions.urls")),
    path("api/gamification/", include("gamification.urls")),
    path("api/users/", include("users.urls")),
]

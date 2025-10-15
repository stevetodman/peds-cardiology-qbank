from __future__ import annotations

from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """Custom user model to allow future extensions (e.g., roles)."""

    class Meta:
        verbose_name = "user"
        verbose_name_plural = "users"

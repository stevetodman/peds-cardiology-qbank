from __future__ import annotations

from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import LeaderboardEntry, UserProfile


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_profile(sender, instance, created, **kwargs):  # type: ignore[override]
    if created:
        UserProfile.objects.create(user=instance)
        LeaderboardEntry.objects.create(user=instance, total_points=0)

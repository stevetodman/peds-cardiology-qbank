from __future__ import annotations

from django.conf import settings
from django.db import models
from django.utils import timezone


class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
    points = models.IntegerField(default=0)
    level = models.IntegerField(default=1)
    badges = models.JSONField(default=list)
    last_awarded_at = models.DateTimeField(null=True, blank=True)

    def award_points(self, amount: int) -> None:
        self.points += amount
        self.level = max(1, self.points // 100 + 1)
        self.last_awarded_at = timezone.now()
        self.save(update_fields=["points", "level", "last_awarded_at"])

    def add_badge(self, badge: str) -> None:
        if badge not in self.badges:
            self.badges.append(badge)
            self.save(update_fields=["badges"])

    def __str__(self) -> str:  # pragma: no cover - string repr
        return f"Profile<{self.user}>"


class LeaderboardEntry(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="leaderboard_entries")
    total_points = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-total_points", "updated_at"]

    def __str__(self) -> str:  # pragma: no cover - string repr
        return f"{self.user} - {self.total_points}"

from __future__ import annotations

from rest_framework import serializers

from .models import LeaderboardEntry, UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ["id", "points", "level", "badges", "last_awarded_at"]


class LeaderboardEntrySerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()

    class Meta:
        model = LeaderboardEntry
        fields = ["id", "user", "total_points", "updated_at"]

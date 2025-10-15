from __future__ import annotations

from django.urls import path

from .views import LeaderboardView, UserProfileView

app_name = "gamification"

urlpatterns = [
    path("profile/", UserProfileView.as_view(), name="profile"),
    path("leaderboard/", LeaderboardView.as_view(), name="leaderboard"),
]

from __future__ import annotations

from rest_framework import permissions, response, views

from .models import LeaderboardEntry, UserProfile
from .serializers import LeaderboardEntrySerializer, UserProfileSerializer


class UserProfileView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile)
        return response.Response(serializer.data)


class LeaderboardView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        LeaderboardEntry.objects.update_or_create(
            user=request.user,
            defaults={"total_points": request.user.profile.points if hasattr(request.user, "profile") else 0},
        )
        queryset = LeaderboardEntry.objects.select_related("user").order_by("-total_points", "updated_at")[:25]
        serializer = LeaderboardEntrySerializer(queryset, many=True)
        return response.Response(serializer.data)

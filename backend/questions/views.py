from __future__ import annotations

import random

from django.shortcuts import get_object_or_404
from rest_framework import permissions, response, status, views

from gamification.models import UserProfile

from .models import LearningObjective, Question
from .serializers import LearningObjectiveSerializer, QuestionSerializer


class LearningObjectiveListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        objectives = LearningObjective.objects.prefetch_related("questions", "slides").all()
        serializer = LearningObjectiveSerializer(objectives, many=True)
        return response.Response(serializer.data)


class QuizView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, objective_id: int):
        objective = get_object_or_404(LearningObjective, pk=objective_id)
        questions = list(objective.questions.filter(is_active=True))
        random.shuffle(questions)
        serializer = QuestionSerializer(questions[:10], many=True)
        return response.Response(serializer.data)

    def post(self, request, objective_id: int):
        objective = get_object_or_404(LearningObjective, pk=objective_id)
        answers: dict[str, str] = request.data.get("answers", {})
        score = 0
        for question_id, answer in answers.items():
            question = get_object_or_404(Question, pk=question_id, objective=objective)
            if question.correct_answer == answer:
                score += 10

        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        profile.points += score
        if score >= 80:
            badge_label = f"{objective.name} Master"
            if badge_label not in profile.badges:
                profile.badges.append(badge_label)
        profile.level = max(1, profile.points // 100 + 1)
        profile.save(update_fields=["points", "badges", "level"])

        payload = {"score": score, "badges": profile.badges, "level": profile.level}
        return response.Response(payload, status=status.HTTP_200_OK)

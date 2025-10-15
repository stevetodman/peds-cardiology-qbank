from __future__ import annotations

from django.urls import path

from .views import LearningObjectiveListView, QuizView

app_name = "questions"

urlpatterns = [
    path("objectives/", LearningObjectiveListView.as_view(), name="objective-list"),
    path("quiz/<int:objective_id>/", QuizView.as_view(), name="quiz"),
]

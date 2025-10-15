from __future__ import annotations

from rest_framework import serializers

from .models import LectureSlide, LearningObjective, Question


class LectureSlideSerializer(serializers.ModelSerializer):
    class Meta:
        model = LectureSlide
        fields = ["id", "title", "embed_code", "file"]


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ["id", "text", "options", "correct_answer", "explanation", "objective_id"]
        extra_kwargs = {"correct_answer": {"write_only": True}, "explanation": {"write_only": True}}


class LearningObjectiveSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    slides = LectureSlideSerializer(many=True, read_only=True)

    class Meta:
        model = LearningObjective
        fields = ["id", "name", "description", "questions", "slides"]

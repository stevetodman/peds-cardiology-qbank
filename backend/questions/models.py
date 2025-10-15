from __future__ import annotations

from django.db import models


class LearningObjective(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    def __str__(self) -> str:  # pragma: no cover - string repr
        return self.name


class Question(models.Model):
    objective = models.ForeignKey(LearningObjective, on_delete=models.CASCADE, related_name="questions")
    text = models.TextField()
    options = models.JSONField()
    correct_answer = models.CharField(max_length=1)
    explanation = models.TextField()
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["objective", "order", "id"]

    def __str__(self) -> str:  # pragma: no cover - string repr
        return self.text[:50]


class LectureSlide(models.Model):
    objective = models.ForeignKey(LearningObjective, on_delete=models.CASCADE, related_name="slides")
    file = models.FileField(upload_to="slides/", blank=True)
    embed_code = models.TextField(blank=True)
    title = models.CharField(max_length=255, blank=True)

    def __str__(self) -> str:  # pragma: no cover - string repr
        return self.title or f"Slide for {self.objective}"

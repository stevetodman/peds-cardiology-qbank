# Generated manually to scaffold learning objective and question models.
from __future__ import annotations

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="LearningObjective",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=200)),
                ("description", models.TextField(blank=True)),
            ],
        ),
        migrations.CreateModel(
            name="LectureSlide",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("file", models.FileField(blank=True, upload_to="slides/")),
                ("embed_code", models.TextField(blank=True)),
                ("title", models.CharField(blank=True, max_length=255)),
                (
                    "objective",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="slides",
                        to="questions.learningobjective",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Question",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("text", models.TextField()),
                ("options", models.JSONField()),
                ("correct_answer", models.CharField(max_length=1)),
                ("explanation", models.TextField()),
                ("order", models.PositiveIntegerField(default=0)),
                ("is_active", models.BooleanField(default=True)),
                (
                    "objective",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="questions",
                        to="questions.learningobjective",
                    ),
                ),
            ],
            options={"ordering": ["objective", "order", "id"]},
        ),
    ]

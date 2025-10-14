# Developer Guide for the Gamified Congenital Heart Disease Learning Platform

This guide provides a comprehensive roadmap for building a custom web-based, gamified learning experience tailored to a pediatric cardiology curriculum. The platform centers on 500 USMLE Step 1-style questions grouped into 50 learning objectives (10 questions/objective) and integrates lecture content delivered as PowerPoint slides. It is optimized for cohorts of up to 200 second-year medical students participating in a flipped-classroom model and emphasizes engagement through points, badges, levels, and leaderboards.

The recommended stack couples **Django 5** (backend), **React + TypeScript** (frontend), and **PostgreSQL** (database). The stack balances scalability, maintainability, and security with an estimated solo developer effort of **100–200 hours** over **2–4 months** part-time.

---

## 1. Project Overview and Requirements

### Functional Requirements
- **User authentication and roles**
  - Students: quiz access, individual dashboards, and progress tracking.
  - Admins: question/slide management, analytics, and moderation.
- **Content management**
  - CRUD for learning objectives, questions (stem, options, correct answer, explanation), and slide assets (PowerPoint file + embed metadata).
  - Bulk upload support (CSV/JSON) for 500-question dataset.
- **Quiz delivery**
  - Randomized 10-question quizzes per objective.
  - Immediate grading and feedback, including detailed explanations.
- **Gamification**
  - 10 points awarded per correct answer.
  - Badges unlocked for ≥80% accuracy within an objective ("Objective Master").
  - Level progression derived from cumulative points (e.g., Level `points // 100 + 1`).
  - Real-time leaderboards ranked by total points with tie-breaking on most recent activity.
- **Flipped classroom support**
  - Pre-class self-paced quizzes and lecture preview.
  - In-class collaborative sessions (team quiz mode backed by shared session tokens).
- **Analytics & reporting**
  - Student dashboards: objective completion, accuracy, time-on-task.
  - Admin dashboards: cohort engagement metrics, leaderboard export.
- **PowerPoint integration**
  - Upload slide decks and optionally embed via Office Online or converted images.

### Non-Functional Requirements
- **Scalability**: Low-latency support for 200 concurrent users via horizontal scaling (Gunicorn + worker autoscaling, React served by CDN).
- **Security**: HTTPS everywhere, role-based access control, OWASP hardening, content filtering, GDPR-ready data retention.
- **Accessibility**: WCAG 2.1 AA—keyboard navigation, semantic HTML, alt text, color contrast, captions for media.
- **Performance**: Responsive on mobile/desktop, caching for frequent queries (Redis), pagination for leaderboards, lazy loading slides.
- **Deployment**: Cloud-ready (e.g., Heroku, Render, AWS Elastic Beanstalk) with automated CI/CD pipelines and infrastructure-as-code if possible.

### Assumptions
- Development workstations provide Python 3.12+, Node.js 20+, PostgreSQL 15+, Git, and optionally Docker.
- UI prototypes (Figma) available or created during discovery.
- Dedicated time for QA and security reviews before launch.

---

## 2. Environment Setup

### Install Dependencies
1. **Python environment**
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install --upgrade pip
   pip install django==5.1 djangorestframework python-pptx psycopg2-binary django-cors-headers
   ```
2. **Node.js environment**
   ```bash
   npm install -g create-react-app
   # OR: npm create vite@latest chd-frontend -- --template react-ts
   ```
3. **Database**
   - Install PostgreSQL locally and create a database user with privileges for development.
   - Confirm connectivity with `psql -U your_user -d postgres`.

### Project Structure
```
chd_platform/
├── backend/
│   ├── chd_platform/    # Django settings, URLs, ASGI
│   ├── questions/       # Learning objectives & question logic
│   ├── gamification/    # Points, badges, leaderboards
│   ├── users/           # Custom user model, auth flows
│   ├── manage.py
│   └── requirements.txt
├── frontend/            # React (TypeScript)
│   ├── src/
│   ├── public/
│   └── package.json
└── README.md
```

### Initialization Steps
```bash
mkdir chd_platform && cd chd_platform

# Django backend
django-admin startproject chd_platform backend
cd backend
python manage.py startapp questions
python manage.py startapp gamification
python manage.py startapp users
cd ..

# React frontend (TypeScript)
npx create-react-app frontend --template typescript
```

### Database Configuration (`backend/chd_platform/settings.py`)
```python
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "chd_db",
        "USER": "your_user",
        "PASSWORD": "your_password",
        "HOST": "localhost",
        "PORT": "5432",
    }
}
```

Additional setup:
- Add `'rest_framework'`, `'corsheaders'`, `'questions'`, `'gamification'`, and `'users'` to `INSTALLED_APPS`.
- Insert `"corsheaders.middleware.CorsMiddleware"` near the top of `MIDDLEWARE` and configure `CORS_ALLOWED_ORIGINS` to include the React dev server URL (`http://localhost:3000`).
- Run `python manage.py migrate` to initialize the database schema.

### Version Control & Tooling
- Initialize Git early, commit frequently, and enforce PR reviews.
- Configure linters (flake8/black for Python, ESLint/Prettier for JS) and pre-commit hooks.
- Consider Docker Compose for reproducible environments combining backend, frontend, and Postgres services.

---

## 3. Database Models

Define core models to represent objectives, questions, lecture slides, and gamification state.

### `questions/models.py`
```python
from django.db import models


class LearningObjective(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Question(models.Model):
    objective = models.ForeignKey(
        LearningObjective,
        on_delete=models.CASCADE,
        related_name="questions",
    )
    text = models.TextField()
    options = models.JSONField()
    correct_answer = models.CharField(max_length=1)
    explanation = models.TextField()
    difficulty = models.CharField(max_length=20, default="medium")

    def __str__(self):
        return self.text[:80]


class LectureSlide(models.Model):
    objective = models.ForeignKey(LearningObjective, on_delete=models.CASCADE)
    file = models.FileField(upload_to="slides/")
    embed_code = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
```

### `gamification/models.py`
```python
from django.conf import settings
from django.db import models


class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    points = models.PositiveIntegerField(default=0)
    level = models.PositiveIntegerField(default=1)
    badges = models.JSONField(default=list)

    def recalculate_level(self):
        self.level = self.points // 100 + 1
        self.save(update_fields=["level"])


class LeaderboardEntry(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    total_points = models.PositiveIntegerField()
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-total_points", "-updated_at"]
        unique_together = ("user", "total_points")
```

### Migration Workflow
```bash
python manage.py makemigrations
python manage.py migrate
```

**Best Practices**
- Use fixtures or seed scripts to import the 500-question dataset.
- Add database constraints (e.g., `CheckConstraint` for valid `correct_answer` values).
- Keep migrations atomic and document schema changes in a CHANGELOG.

**Pitfalls**
- Avoid `JSONField` misuse by validating payload structure in serializers.
- Ensure file storage meets compliance (e.g., S3 with signed URLs in production).

---

## 4. Backend Views, Serializers, and Business Logic

### Serializers (`questions/serializers.py`)
```python
from rest_framework import serializers
from .models import Question, LearningObjective, LectureSlide


class LectureSlideSerializer(serializers.ModelSerializer):
    class Meta:
        model = LectureSlide
        fields = ("id", "embed_code", "file", "uploaded_at")


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = (
            "id",
            "objective",
            "text",
            "options",
            "correct_answer",
            "explanation",
            "difficulty",
        )
        read_only_fields = ("correct_answer", "explanation")


class ObjectiveSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    slides = LectureSlideSerializer(source="lectureslide_set", many=True, read_only=True)

    class Meta:
        model = LearningObjective
        fields = ("id", "name", "description", "questions", "slides")
```

### Views (`questions/views.py`)
```python
import random
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import LearningObjective, Question
from .serializers import ObjectiveSerializer, QuestionSerializer
from gamification.models import UserProfile


class ObjectiveViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LearningObjective.objects.prefetch_related("questions", "lectureslide_set")
    serializer_class = ObjectiveSerializer
    permission_classes = [permissions.IsAuthenticated]


class QuizViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, objective_pk=None):
        objective = get_object_or_404(LearningObjective, pk=objective_pk)
        questions = list(objective.questions.all())
        random.shuffle(questions)
        serializer = QuestionSerializer(questions[:10], many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["post"], url_path="submit")
    def submit(self, request, objective_pk=None):
        objective = get_object_or_404(LearningObjective, pk=objective_pk)
        answers = request.data.get("answers", {})

        score = 0
        for question_id, selected in answers.items():
            question = get_object_or_404(Question, pk=question_id)
            if question.correct_answer == selected:
                score += 10

        profile = UserProfile.objects.select_for_update().get(user=request.user)
        profile.points += score
        if score >= 80 and f"{objective.name} Master" not in profile.badges:
            profile.badges.append(f"{objective.name} Master")
        profile.recalculate_level()
        profile.save(update_fields=["points", "badges", "level"])

        return Response({"score": score, "badges": profile.badges}, status=status.HTTP_200_OK)
```

### URL Configuration (`backend/chd_platform/urls.py`)
```python
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from questions.views import ObjectiveViewSet, QuizViewSet

router = DefaultRouter()
router.register("objectives", ObjectiveViewSet, basename="objective")

quiz_list = QuizViewSet.as_view({"get": "list"})
quiz_submit = QuizViewSet.as_view({"post": "submit"})

urlpatterns = [
    path("api/", include(router.urls)),
    path("api/objectives/<int:objective_pk>/quiz/", quiz_list, name="quiz-list"),
    path("api/objectives/<int:objective_pk>/quiz/submit/", quiz_submit, name="quiz-submit"),
]
```

### Additional Backend Considerations
- Implement **JWT authentication** via `djangorestframework-simplejwt` for stateless APIs.
- Use **signals** to create `UserProfile` upon user registration.
- Add **rate limiting** (e.g., `django-ratelimit`) to protect quiz endpoints.
- Build **admin forms** for bulk question import (`ModelAdmin` + CSV upload view).
- Use **Celery** + Redis for background tasks (e.g., daily leaderboards, analytics aggregation).

**Pitfalls**
- Guard against answer tampering by validating requests server-side and logging submissions.
- Ensure transactional updates (`select_for_update`) when recalculating points.

---

## 5. Frontend Development (React + TypeScript)

### Project Setup
```bash
cd frontend
npm install axios react-router-dom @tanstack/react-query
npm install --save-dev eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

Configure `.env` with `VITE_API_BASE_URL=http://localhost:8000/api/` (or similar).

### API Layer (`src/api/client.ts`)
```typescript
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

export default api;
```

### Objective Service (`src/api/objectives.ts`)
```typescript
import api from "./client";

export interface Question {
  id: number;
  text: string;
  options: Record<string, string>;
  explanation: string;
}

export interface LearningObjective {
  id: number;
  name: string;
  description: string;
  questions: Question[];
  slides: { id: number; embed_code: string; file: string }[];
}

export const fetchObjectives = async (): Promise<LearningObjective[]> => {
  const { data } = await api.get<LearningObjective[]>("/objectives/");
  return data;
};

export const fetchQuiz = async (objectiveId: number): Promise<Question[]> => {
  const { data } = await api.get(`/objectives/${objectiveId}/quiz/`);
  return data;
};

export const submitQuiz = async (
  objectiveId: number,
  answers: Record<number, string>
): Promise<{ score: number; badges: string[] }> => {
  const { data } = await api.post(`/objectives/${objectiveId}/quiz/submit/`, { answers });
  return data;
};
```

### Core Components
- `Dashboard.tsx`: lists objectives, shows progress and badge summary.
- `Quiz.tsx`: renders questions, collects answers, and displays feedback.
- `Leaderboard.tsx`: fetches leaderboard data, supports real-time updates via WebSockets or polling.
- `SlidePreview.tsx`: renders PowerPoint embed or fallback image gallery.

**Example Dashboard Skeleton**
```tsx
import { useEffect, useState } from "react";
import { fetchObjectives, LearningObjective } from "../api/objectives";

export default function Dashboard() {
  const [objectives, setObjectives] = useState<LearningObjective[]>([]);

  useEffect(() => {
    fetchObjectives().then(setObjectives).catch(console.error);
  }, []);

  return (
    <main>
      <h1>Learning Objectives</h1>
      <ul>
        {objectives.map((obj) => (
          <li key={obj.id}>
            <h2>{obj.name}</h2>
            <p>{obj.description}</p>
            <button type="button">Start Quiz</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

### State & Gamification UX
- Manage auth and profile state with React Context or Redux Toolkit.
- Use React Query for server state (objectives, quizzes, leaderboards).
- Present progress bars, badge carousels, and celebratory animations for badge unlocks.
- Incorporate accessibility (ARIA roles, focus management) and responsive design (Tailwind CSS or Chakra UI).

**Pitfalls**
- Guard against flashing correct answers by keeping them server-side until submission.
- Handle network failures gracefully with retry/backoff and offline notices.

---

## 6. Testing Strategy

### Backend Testing
- Use `django.test.TestCase` for unit tests covering model methods, serializers, and views.
- Example quiz scoring test (`questions/tests/test_quiz.py`):
  ```python
  class QuizViewTests(TestCase):
      def test_quiz_scoring_awards_points(self):
          # setup fixtures
          response = self.client.post(url, {"answers": {question.id: question.correct_answer}})
          self.assertEqual(response.status_code, 200)
          self.assertEqual(response.json()["score"], 10)
  ```
- Employ pytest + pytest-django for richer assertions and fixtures.
- Run security scans: `bandit -r backend`.

### Frontend Testing
- Unit test components with Jest & React Testing Library.
- Snapshot test major views and ensure accessible roles exist.
- Use Cypress Playwright for end-to-end flows (login, quiz submission, badge unlock).

### Continuous Integration
- GitHub Actions workflow example:
  ```yaml
  name: CI
  on: [push, pull_request]
  jobs:
    backend:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-python@v5
          with:
            python-version: "3.12"
        - run: pip install -r backend/requirements.txt
        - run: python backend/manage.py test
    frontend:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with:
            node-version: "20"
        - run: npm ci --prefix frontend
        - run: npm test --prefix frontend -- --watch=false
  ```

**Pitfalls**
- Mock external services (PowerPoint embeds, S3) in tests to avoid flakiness.
- Ensure migrations run in CI to catch schema regressions.

---

## 7. Deployment & Operations

### Backend Deployment
- Containerize with Docker; deploy to Heroku, Render, or AWS.
- Use Gunicorn + ASGI (Daphne/Uvicorn) for async features.
- Configure environment variables for secrets (Django `SECRET_KEY`, database credentials).
- Enable HTTPS (Heroku SSL, AWS ACM) and HSTS headers.

### Frontend Deployment
- Build static assets: `npm run build`.
- Serve via Netlify, Vercel, or as static files behind CDN (CloudFront).
- Configure environment-specific API URLs and ensure CORS is properly set.

### Database & Storage
- Use managed PostgreSQL (Heroku Postgres, RDS) with automated backups.
- Store slide files on S3-compatible storage with signed URLs.
- Apply migrations during deployment via release phase or management command.

### Monitoring & Logging
- Integrate Sentry for exception tracking and performance monitoring.
- Use New Relic or Datadog for server metrics.
- Centralize logs (Papertrail, CloudWatch) and review leaderboard anomalies.

**Pitfalls**
- Forgetting to run migrations in production.
- Allowing default Django debug settings in production (disable DEBUG, restrict `ALLOWED_HOSTS`).

---

## 8. Maintenance, Documentation, and Extensions

- Maintain a **CHANGELOG** and semantic versioning for releases.
- Schedule quarterly security audits and dependency updates (`pip-tools`, `npm-check-updates`).
- Extend with mobile-friendly interfaces (React Native) or offline quiz support (service workers).
- Add advanced analytics (Google Analytics, Amplitude) and adaptive question difficulty.
- Collect user feedback via in-app surveys and iterate on gamification (seasonal badges, streaks).
- Document code with docstrings, inline comments, and architectural decision records (ADRs).

---

## 9. Timeline & Effort Breakdown (Guideline)

| Phase | Duration | Key Activities |
| --- | --- | --- |
| Planning & Design | 1–2 weeks | Requirements refinement, UI mockups, data modeling |
| Backend Foundations | 2–3 weeks | Models, APIs, authentication, admin tooling |
| Frontend Foundations | 2–3 weeks | React scaffolding, UI implementation, API integration |
| Gamification & Analytics | 1–2 weeks | Points, badges, dashboards, reporting |
| Testing & QA | 1–2 weeks | Unit/E2E tests, accessibility checks, load testing |
| Deployment & Handoff | 1 week | CI/CD, production setup, documentation |

Total estimated time: **100–200 hours** for a solo developer with moderate experience.

---

## 10. Resources & References

- Django Documentation: <https://docs.djangoproject.com/en/5.1/>
- Django REST Framework: <https://www.django-rest-framework.org/>
- React + TypeScript Cheatsheets: <https://react-typescript-cheatsheet.netlify.app/>
- PostgreSQL Docs: <https://www.postgresql.org/docs/>
- WCAG 2.1 Guidelines: <https://www.w3.org/TR/WCAG21/>
- OWASP Cheat Sheet Series: <https://cheatsheetseries.owasp.org/>
- Microsoft PowerPoint Embed APIs: <https://learn.microsoft.com/office/dev/add-ins/>

This guide equips you with the essential architectural decisions, implementation details, and operational best practices to deliver a robust, engaging gamified learning platform for congenital heart disease education.

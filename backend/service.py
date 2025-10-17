"""Core business logic for objectives, quizzes, and gamification."""
from __future__ import annotations

import random
from datetime import datetime, timezone
from typing import Any, Dict, List

from .security import create_session_token, hash_password, verify_password
from .storage import Database

MAX_QUESTIONS_PER_OBJECTIVE = 10
BADGE_THRESHOLD = 0.8
POINTS_PER_CORRECT = 10


class ServiceError(RuntimeError):
    """Raised when a client-visible error occurs."""


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def register_user(db: Database, username: str, password: str) -> Dict[str, Any]:
    username = username.strip().lower()
    if not username:
        raise ServiceError("Username cannot be empty")
    if len(password) < 8:
        raise ServiceError("Password must contain at least 8 characters")

    state = db.load()
    if username in state["users"]:
        raise ServiceError("Username already exists")

    password_hash, salt = hash_password(password)
    state["users"][username] = {
        "password_hash": password_hash,
        "salt": salt,
        "points": 0,
        "badges": [],
        "level": 1,
        "completed_objectives": {},
    }
    db.save()
    return {"username": username}


def login_user(db: Database, username: str, password: str) -> Dict[str, Any]:
    username = username.strip().lower()
    state = db.load()
    account = state["users"].get(username)
    if not account:
        raise ServiceError("Invalid credentials")
    if not account["password_hash"]:
        # Demo users may not have a password set
        password_hash, salt = hash_password(password)
        account["password_hash"] = password_hash
        account["salt"] = salt
    if not verify_password(password, account["password_hash"], account["salt"]):
        raise ServiceError("Invalid credentials")

    token = create_session_token()
    state["sessions"][token] = {"username": username, "created_at": _now_iso()}
    db.save()
    return {"token": token, "username": username}


def authenticate(db: Database, token: str) -> str:
    if not token:
        raise ServiceError("Missing session token")
    session = db.load()["sessions"].get(token)
    if not session:
        raise ServiceError("Session expired or invalid")
    return session["username"]


def list_objectives(db: Database) -> List[Dict[str, Any]]:
    state = db.load()
    objectives = []
    for obj in state["objectives"]:
        obj_copy = dict(obj)
        obj_copy["question_count"] = sum(1 for q in state["questions"] if q["objective_id"] == obj["id"])
        objectives.append(obj_copy)
    return objectives


def _questions_for_objective(state: Dict[str, Any], objective_id: str) -> List[Dict[str, Any]]:
    return [q for q in state["questions"] if q["objective_id"] == objective_id]


def generate_quiz(db: Database, objective_id: str) -> Dict[str, Any]:
    state = db.load()
    objective = next((obj for obj in state["objectives"] if obj["id"] == objective_id), None)
    if not objective:
        raise ServiceError("Learning objective not found")

    questions = _questions_for_objective(state, objective_id)
    if not questions:
        raise ServiceError("No questions configured for this objective")

    selection = questions[:]
    random.shuffle(selection)
    selection = selection[:MAX_QUESTIONS_PER_OBJECTIVE]

    quiz_questions = []
    for question in selection:
        quiz_questions.append(
            {
                "id": question["id"],
                "text": question["text"],
                "options": question["options"],
            }
        )

    return {
        "objective": objective,
        "questions": quiz_questions,
    }


def grade_quiz(db: Database, token: str, objective_id: str, answers: Dict[str, str]) -> Dict[str, Any]:
    username = authenticate(db, token)
    state = db.load()
    questions = {q["id"]: q for q in _questions_for_objective(state, objective_id)}
    if not questions:
        raise ServiceError("No questions configured for this objective")

    score = 0
    detailed_results: List[Dict[str, Any]] = []
    for question_id, question in questions.items():
        submitted = answers.get(question_id)
        is_correct = submitted == question["correct_answer"]
        if is_correct:
            score += POINTS_PER_CORRECT
        detailed_results.append(
            {
                "question_id": question_id,
                "submitted": submitted,
                "correct_answer": question["correct_answer"],
                "explanation": question["explanation"],
                "is_correct": is_correct,
            }
        )

    max_score = len(questions) * POINTS_PER_CORRECT
    accuracy = score / max_score if max_score else 0

    profile = state["users"][username]
    profile.setdefault("badges", [])
    profile.setdefault("completed_objectives", {})
    profile_points_before = profile.get("points", 0)
    profile["points"] = profile_points_before + score
    profile["level"] = profile["points"] // 100 + 1
    profile["completed_objectives"][objective_id] = {
        "last_score": score,
        "accuracy": accuracy,
        "completed_at": _now_iso(),
    }

    awarded_badge = None
    if accuracy >= BADGE_THRESHOLD:
        objective_name = next(
            (obj["name"] for obj in state["objectives"] if obj.get("id") == objective_id),
            objective_id,
        )
        badge_name = f"{objective_name} Master"
        if badge_name not in profile["badges"]:
            profile["badges"].append(badge_name)
            awarded_badge = badge_name

    _sync_leaderboard(state, username, profile["points"])
    db.save()

    return {
        "score": score,
        "max_score": max_score,
        "accuracy": accuracy,
        "awarded_badge": awarded_badge,
        "level": profile["level"],
        "results": detailed_results,
    }


def _sync_leaderboard(state: Dict[str, Any], username: str, points: int) -> None:
    leaderboard = state["leaderboard"]
    entry = next((item for item in leaderboard if item.get("username") == username), None)
    timestamp = _now_iso()
    if entry:
        entry["total_points"] = points
        entry["updated_at"] = timestamp
    else:
        leaderboard.append({"username": username, "total_points": points, "updated_at": timestamp})
    leaderboard.sort(key=lambda item: (-item.get("total_points", 0), item.get("username", "")))


def leaderboard(db: Database) -> List[Dict[str, Any]]:
    state = db.load()
    return state["leaderboard"]


def current_profile(db: Database, token: str) -> Dict[str, Any]:
    username = authenticate(db, token)
    state = db.load()
    profile = dict(state["users"][username])
    profile.pop("password_hash", None)
    profile.pop("salt", None)
    profile["username"] = username
    return profile


__all__ = [
    "ServiceError",
    "register_user",
    "login_user",
    "list_objectives",
    "generate_quiz",
    "grade_quiz",
    "leaderboard",
    "current_profile",
]

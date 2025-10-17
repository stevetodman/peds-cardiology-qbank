"""Simple JSON-backed storage layer for the learning platform backend."""
from __future__ import annotations

import json
import threading
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, MutableMapping, Optional

DEFAULT_DB_FILENAME = "database.json"
REQUIRED_TOP_LEVEL_KEYS = {
    "objectives": list,
    "questions": list,
    "users": dict,
    "leaderboard": list,
    "sessions": dict,
}


def _default_state() -> Dict[str, Any]:
    """Return a dictionary with the expected schema and a few seed records."""
    return {
        "objectives": [],
        "questions": [],
        "users": {},
        "leaderboard": [],
        "sessions": {},
    }


@dataclass
class Database:
    """Lightweight JSON persistence with optimistic file writes."""

    path: Path
    _data: Optional[MutableMapping[str, Any]] = field(default=None, init=False)
    _lock: threading.RLock = field(default_factory=threading.RLock, init=False)

    @classmethod
    def default(cls) -> "Database":
        base_dir = Path(__file__).resolve().parent
        return cls(base_dir / DEFAULT_DB_FILENAME)

    def load(self) -> MutableMapping[str, Any]:
        with self._lock:
            if self._data is not None:
                return self._data

            if self.path.exists():
                try:
                    self._data = json.loads(self.path.read_text("utf-8"))
                except json.JSONDecodeError as exc:
                    raise ValueError(f"Invalid JSON in {self.path}: {exc}") from exc
            else:
                self._data = _default_state()
                self.save()

            self._ensure_schema(self._data)
            return self._data

    def save(self) -> None:
        with self._lock:
            if self._data is None:
                return
            self.path.parent.mkdir(parents=True, exist_ok=True)
            tmp_path = self.path.with_suffix(".tmp")
            tmp_path.write_text(json.dumps(self._data, indent=2, sort_keys=True), "utf-8")
            tmp_path.replace(self.path)

    def ensure_schema(self) -> None:
        with self._lock:
            data = self.load()
            self._ensure_schema(data)
            self.save()

    def wipe_and_seed(self, seed_data: Dict[str, Any]) -> None:
        with self._lock:
            snapshot = json.loads(json.dumps(seed_data))
            self._ensure_schema(snapshot)
            self._data = snapshot
            self.save()

    def _ensure_schema(self, payload: MutableMapping[str, Any]) -> None:
        for key, expected_type in REQUIRED_TOP_LEVEL_KEYS.items():
            if key not in payload or not isinstance(payload[key], expected_type):
                if expected_type is list:
                    payload[key] = []
                elif expected_type is dict:
                    payload[key] = {}
                else:
                    payload[key] = expected_type()

        # Guarantee that every question references a valid objective identifier.
        objective_ids = {obj["id"] for obj in payload["objectives"] if "id" in obj}
        orphaned_questions = [q for q in payload["questions"] if q.get("objective_id") not in objective_ids]
        if orphaned_questions:
            for question in orphaned_questions:
                payload["questions"].remove(question)

        # Ensure leaderboard entries are unique per user.
        seen: Dict[str, Dict[str, Any]] = {}
        deduped: List[Dict[str, Any]] = []
        for entry in payload["leaderboard"]:
            username = entry.get("username")
            if not username:
                continue
            if username in seen:
                if entry.get("total_points", 0) > seen[username].get("total_points", 0):
                    seen[username] = entry
            else:
                seen[username] = entry
        deduped.extend(seen.values())
        payload["leaderboard"] = sorted(
            deduped,
            key=lambda e: (-int(e.get("total_points", 0)), e.get("username", "")),
        )

__all__ = ["Database", "DEFAULT_DB_FILENAME"]

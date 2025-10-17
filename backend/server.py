"""HTTP API implemented with the Python standard library."""
from __future__ import annotations

import json
from pathlib import Path
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any, Dict, Tuple
from urllib.parse import urlparse

from .service import (
    ServiceError,
    current_profile,
    generate_quiz,
    grade_quiz,
    leaderboard,
    list_objectives,
    login_user,
    register_user,
)
from .storage import Database

DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 8000


def create_handler(db: Database) -> type[BaseHTTPRequestHandler]:
    class RequestHandler(BaseHTTPRequestHandler):
        server_version = "QBankBackend/1.0"

        def _read_json(self) -> Dict[str, Any]:
            length = int(self.headers.get("Content-Length") or 0)
            if not length:
                return {}
            try:
                raw = self.rfile.read(length)
                return json.loads(raw.decode("utf-8"))
            except json.JSONDecodeError as exc:
                raise ServiceError(f"Invalid JSON payload: {exc}") from exc

        def _send_json(self, payload: Any, status: HTTPStatus = HTTPStatus.OK) -> None:
            body = json.dumps(payload).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(body)

        def _handle_exception(self, exc: Exception) -> None:
            if isinstance(exc, ServiceError):
                self._send_json({"error": str(exc)}, HTTPStatus.BAD_REQUEST)
            else:
                self.send_error(HTTPStatus.INTERNAL_SERVER_ERROR, explain=str(exc))

        def do_OPTIONS(self) -> None:  # noqa: N802 - http.server naming
            self.send_response(HTTPStatus.NO_CONTENT)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
            self.end_headers()

        def do_GET(self) -> None:  # noqa: N802
            try:
                parsed = urlparse(self.path)
                route, objective_id = self._match_path(parsed.path)
                if route == "objectives" and not objective_id:
                    data = list_objectives(db)
                    self._send_json(data)
                elif route == "quiz" and objective_id:
                    data = generate_quiz(db, objective_id)
                    self._send_json(data)
                elif route == "leaderboard":
                    data = leaderboard(db)
                    self._send_json(data)
                elif route == "profile":
                    token = self.headers.get("Authorization", "").replace("Bearer ", "")
                    data = current_profile(db, token)
                    self._send_json(data)
                else:
                    self.send_error(HTTPStatus.NOT_FOUND, explain="Endpoint not found")
            except Exception as exc:  # noqa: BLE001 - deliberate blanket to return JSON errors
                self._handle_exception(exc)

        def do_POST(self) -> None:  # noqa: N802
            try:
                parsed = urlparse(self.path)
                route, objective_id = self._match_path(parsed.path)
                payload = self._read_json()

                if route == "register":
                    data = register_user(db, payload.get("username", ""), payload.get("password", ""))
                    self._send_json(data, HTTPStatus.CREATED)
                elif route == "login":
                    data = login_user(db, payload.get("username", ""), payload.get("password", ""))
                    self._send_json(data)
                elif route == "quiz" and objective_id:
                    token = self.headers.get("Authorization", "").replace("Bearer ", "")
                    answers = payload.get("answers", {})
                    data = grade_quiz(db, token, objective_id, answers)
                    self._send_json(data)
                else:
                    self.send_error(HTTPStatus.NOT_FOUND, explain="Endpoint not found")
            except Exception as exc:  # noqa: BLE001
                self._handle_exception(exc)

        def log_message(self, format: str, *args: Any) -> None:  # noqa: A003 - match BaseHTTPRequestHandler signature
            return

        @staticmethod
        def _match_path(path: str) -> Tuple[str, str | None]:
            segments = [segment for segment in path.strip("/").split("/") if segment]
            if not segments:
                return "", None
            if segments[0] == "api":
                segments = segments[1:]
            if not segments:
                return "", None
            if segments[0] == "objectives" and len(segments) == 1:
                return "objectives", None
            if segments[0] == "objectives" and len(segments) >= 3 and segments[2] == "quiz":
                return "quiz", segments[1]
            if segments[0] == "leaderboard":
                return "leaderboard", None
            if segments[0] == "profile":
                return "profile", None
            if segments[0] == "auth" and len(segments) == 2:
                return segments[1], None
            return segments[0], segments[1] if len(segments) > 1 else None

    return RequestHandler


def run(host: str = DEFAULT_HOST, port: int = DEFAULT_PORT, db_path: str | None = None) -> None:
    database = Database(Path(db_path)) if db_path else Database.default()
    handler = create_handler(database)
    server = ThreadingHTTPServer((host, port), handler)
    try:
        print(f"Serving API on http://{host}:{port}")
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer interrupted, shutting down...")
    finally:
        server.server_close()


__all__ = ["run", "create_handler", "DEFAULT_HOST", "DEFAULT_PORT"]

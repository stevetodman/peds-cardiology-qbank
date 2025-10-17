#!/usr/bin/env python3
"""Command line utilities for the lightweight backend."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

if __package__ in {None, ""}:
    PACKAGE_ROOT = Path(__file__).resolve().parent
    sys.path.insert(0, str(PACKAGE_ROOT.parent))
    from backend import sample_data  # type: ignore[import-not-found]
    from backend.server import DEFAULT_HOST, DEFAULT_PORT, run as run_server  # type: ignore[import-not-found]
    from backend.service import list_objectives  # type: ignore[import-not-found]
    from backend.storage import Database  # type: ignore[import-not-found]
else:
    from . import sample_data
    from .server import DEFAULT_HOST, DEFAULT_PORT, run as run_server
    from .service import list_objectives
    from .storage import Database


def command_check(args: argparse.Namespace) -> int:
    db = Database(Path(args.database) if args.database else Database.default().path)
    try:
        db.ensure_schema()
        objectives = list_objectives(db)
        print(f"Check successful. {len(objectives)} objectives available.")
        return 0
    except Exception as exc:  # noqa: BLE001 - diagnostics should never raise
        print(f"Check failed: {exc}", file=sys.stderr)
        return 1


def command_runserver(args: argparse.Namespace) -> int:
    run_server(host=args.host, port=args.port, db_path=args.database)
    return 0


def command_seed(args: argparse.Namespace) -> int:
    db = Database(Path(args.database) if args.database else Database.default().path)
    db.wipe_and_seed(sample_data.SEED_STATE)
    print(f"Seeded database with {len(sample_data.OBJECTIVES)} objectives and {len(sample_data.QUESTIONS)} questions.")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Utility commands for the pediatrics cardiology question bank backend.")
    parser.add_argument("--database", help="Path to the JSON database file. Defaults to backend/database.json", default=None)

    subcommands = parser.add_subparsers(dest="command", required=True)

    check_cmd = subcommands.add_parser("check", help="Validate the database schema and content integrity")
    check_cmd.set_defaults(func=command_check)

    runserver_cmd = subcommands.add_parser("runserver", help="Start the HTTP API server")
    runserver_cmd.add_argument("--host", default=DEFAULT_HOST)
    runserver_cmd.add_argument("--port", default=DEFAULT_PORT, type=int)
    runserver_cmd.set_defaults(func=command_runserver)

    seed_cmd = subcommands.add_parser("seed", help="Reset the database with bundled sample data")
    seed_cmd.set_defaults(func=command_seed)

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())

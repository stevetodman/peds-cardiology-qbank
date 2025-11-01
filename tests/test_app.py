import os
import types
import sys
from importlib import reload

# Ensure imports work when running ``pytest`` directly
sys.path.insert(0, os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

import guideline_flowchart_app as app


def test_demo_parser_returns_default_mermaid():
    assert app.demo_parser("anything") == app.DEFAULT_MERMAID


def test_parse_guideline_no_api_key(monkeypatch):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    assert app.parse_guideline("x") == app.DEFAULT_MERMAID


def test_parse_guideline_with_openai(monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY", "test")
    fake_resp = types.SimpleNamespace(
        choices=[types.SimpleNamespace(message=types.SimpleNamespace(content="graph TD; A-->B"))]
    )

    def fake_create(**kwargs):
        return fake_resp

    fake_openai = types.SimpleNamespace(ChatCompletion=types.SimpleNamespace(create=fake_create))
    monkeypatch.setitem(sys.modules, "openai", fake_openai)
    reload(app)
    assert app.parse_guideline("x") == "graph TD; A-->B"

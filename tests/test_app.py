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

def test_export_png(monkeypatch):
    calls = {}
    def fake_run(cmd, check):
        calls['cmd'] = cmd
        out_path = cmd[cmd.index('-o') + 1]
        with open(out_path, 'wb') as f:
            f.write(b'123')
    monkeypatch.setattr(app.subprocess, 'run', fake_run)
    result = app.export_png('graph TD;A-->B')
    assert calls['cmd'][0] == 'mmdc'
    assert result == b'123'

def test_export_pptx(monkeypatch):
    class FakeSlide:
        def __init__(self):
            self.shapes = types.SimpleNamespace(add_textbox=lambda *a, **k: types.SimpleNamespace(text=""))
    class FakeSlides:
        def add_slide(self, layout):
            return FakeSlide()
    class FakePresentation:
        def __init__(self):
            self.slides = FakeSlides()
            self.slide_layouts = [None]*6
        def save(self, fileobj):
            fileobj.write(b'data')
    fake_pptx = types.SimpleNamespace(Presentation=FakePresentation)
    fake_util = types.SimpleNamespace(Inches=lambda x: x)
    monkeypatch.setitem(sys.modules, 'pptx', fake_pptx)
    monkeypatch.setitem(sys.modules, 'pptx.util', fake_util)
    data = app.export_pptx('graph TD;A-->B')
    assert data == b'data'

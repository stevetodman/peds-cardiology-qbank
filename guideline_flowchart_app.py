import os


DEFAULT_MERMAID = """graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Do something]
    B -->|No| D[Do something else]
""".strip()


def demo_parser(guideline_text: str) -> str:
    """Return demo Mermaid code regardless of input."""
    return DEFAULT_MERMAID


def parse_guideline(guideline_text: str) -> str:
    """Generate mermaid code using OpenAI if available, else use demo parser."""
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        try:
            import openai  # type: ignore
        except Exception:
            return demo_parser(guideline_text)
        openai.api_key = api_key
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "Return Mermaid diagram for the given clinical guideline."},
                    {"role": "user", "content": guideline_text},
                ],
                temperature=0,
            )
        except Exception:
            return demo_parser(guideline_text)
        return response.choices[0].message.content.strip()
    return demo_parser(guideline_text)

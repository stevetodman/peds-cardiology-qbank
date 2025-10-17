# Pediatric Cardiology QBank Prompt Pack

This project hosts a production-ready prompt pack for building a 5,000-item pediatric cardiology multiple-choice question bank. The site replaces the original quiz interface with a single-page reference hub that contains the workflow overview, copy-ready prompts, JSON schema, blueprint tables, reviewer packets, and quality checklists.

Alongside the documentation, the repository now includes a lightweight Python backend that serves quizzes, scoring, and leaderboards without external dependencies. See the [Developer Guide](DEVELOPER_GUIDE.md) for architecture details and usage instructions.

## Getting started

1. Open `index.html` in your browser to load the prompt pack experience.
2. Follow the "Quick Start Workflow" section on the page to see the recommended four-step process.
3. If you want to experiment with the interactive backend, run `python backend/manage.py seed` and `python backend/manage.py runserver` to expose the REST API locally.
4. Use the sticky navigation to jump to system instructions, blueprint tables, batch prompts, and quality controls as needed.

For a non-technical walkthrough, tips, and troubleshooting advice, read the [User Guide](USER_GUIDE.md).

## License

This project is licensed under the [MIT License](LICENSE).

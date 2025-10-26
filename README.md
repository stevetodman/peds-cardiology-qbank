# Pediatric Cardiology QBank Prompt Pack

This project hosts a production-ready prompt pack for building a 5,000-item pediatric cardiology multiple-choice question bank. The site replaces the original quiz interface with a single-page reference hub that contains the workflow overview, copy-ready prompts, JSON schema, blueprint tables, reviewer packets, and quality checklists.

## Getting started

1. Open `index.html` in your browser to load the prompt pack experience.
2. Follow the "Quick Start Workflow" section on the page to see the recommended four-step process.
3. Use the sticky navigation to jump to system instructions, blueprint tables, batch prompts, and quality controls as needed.

For a non-technical walkthrough, tips, and troubleshooting advice, read the [User Guide](USER_GUIDE.md).

## Question data & validation

The congenital heart disease experience under `chd-study/` now stores its core bank in
[`chd-study/data/questions.v1.json`](chd-study/data/questions.v1.json). Each entry
follows the Draft-07 JSON Schema defined in
[`chd-study/data/questions.schema.json`](chd-study/data/questions.schema.json) and
includes the fields:

* `id`: unique identifier string.
* `topic`: one of `acyanotic`, `cyanotic`, or `cross-cutting`.
* `lesion`: descriptive lesion name.
* `category`: question focus (e.g., `pathophysiology`, `presentation`).
* `type`: question style (`mcq`, `tf`, or `multi`).
* `stem`, `options`, and corresponding answer fields (`answerIndex`, `answerIndices`, or `answerBool`).
* `explanation`, `objective`, `tags`, `difficulty` (integer 1–5, default 2), optional `references`, and `version` (defaults to `v1`).

`app.js` loads the bank at runtime, validates it with Ajv, and surfaces a friendly
error banner if the data or fetch fails. Import/export workflows in the UI require
JSON that matches the schema and report per-item validation issues. When authoring
new questions locally, keep the `version` field aligned with the data file and use
the `difficulty` integer mapping (`1` → foundation, `2` → core, `3–5` → advanced).

## License

This project is licensed under the [MIT License](LICENSE).

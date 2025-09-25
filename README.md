# Pediatric Cardiology QBank

A single-file, offline-first study environment that helps second-year medical
students master congenital heart disease (CHD). Every asset—markup, styles,
JavaScript, validator, and the full 60-item bank—ships inside `index.html` so
the experience runs instantly on any modern browser without builds or network
access.

## Table of contents
- [Quick start](#quick-start)
- [Browser support & performance](#browser-support--performance)
- [Application overview](#application-overview)
  - [Panels & primary flows](#panels--primary-flows)
  - [Data lifecycle](#data-lifecycle)
- [Study workflow](#study-workflow)
- [Quiz workflow](#quiz-workflow)
  - [Configuration](#configuration)
  - [During the quiz](#during-the-quiz)
  - [Results & remediation](#results--remediation)
- [Spaced review scheduler](#spaced-review-scheduler)
- [Question bank & schema](#question-bank--schema)
  - [Field reference](#field-reference)
  - [Example question](#example-question)
  - [Category coverage](#category-coverage)
- [Local storage & persistence](#local-storage--persistence)
- [Admin-lite authoring tools](#admin-lite-authoring-tools)
  - [Inline editor](#inline-editor)
  - [Bulk import](#bulk-import)
  - [Export bundle](#export-bundle)
- [Dark mode & accessibility](#dark-mode--accessibility)
  - [Keyboard shortcuts](#keyboard-shortcuts)
- [Customization & extension](#customization--extension)
- [Troubleshooting](#troubleshooting)
- [Limitations & disclaimers](#limitations--disclaimers)
- [License](#license)

## Quick start
1. Clone or download this repository.
2. Double-click `index.html` (or drag it into any desktop/mobile browser tab).
   The site bootstraps locally—no web server, install step, or network required.
3. Optional: pin the file in your browser or add it to a mobile home screen for
   quick offline access.

## Browser support & performance
- Developed against the latest Chromium, Firefox, and Safari releases on desktop
  and mobile. Any ES2017-compatible browser with `localStorage` support should
  work.
- The SPA avoids heavy libraries and defers non-critical rendering, so even
  low-powered tablets handle quizzes and study mode fluidly.
- If storage quota is exceeded (e.g., private browsing or kiosk modes), the app
  gracefully disables persistence features and surfaces warnings in the Admin
  panel.

## Application overview
`index.html` encapsulates all assets:
- `<style>` defines a responsive, mobile-first layout with CSS variables for
  dark/light themes, focus rings, and adaptive panel grids.
- `<main>` contains semantic landmarks (header, nav, sections) with ARIA roles
  for screen reader navigation and skip-to-content support.
- `<template>` elements hold reusable question cards, quiz results rows, and
  admin dialogs to keep runtime DOM updates efficient.
- `<script>` wraps the full application state machine, validator, SM-2 review
  engine, and persistence utilities.

### Panels & primary flows
- **Home:** quick navigation buttons, learning snapshot stats, import/export
  controls, dark-mode toggle, and a persistent “educational only” banner.
- **Study:** browsable practice. Filters include topic (cyanotic/acyanotic/
  cross-cutting), lesion, category, and difficulty. Each question reveals
  rationale immediately with ARIA live feedback.
- **Quiz:** three sub-panels—configuration, active quiz, and results—managed via
  in-app routing so the URL never changes.
- **Review:** a spaced repetition queue that schedules previously missed items
  using an SM-2-inspired algorithm (Again/Hard/Good/Easy ratings).
- **Admin:** local authoring surface to add/edit/delete questions, adjust
  metadata, bulk import/export JSON, and inspect learner progress counters.

### Data lifecycle
1. On load, the embedded `QBANK` array is validated against the Draft-07 schema
   before populating the study catalog.
2. Derived views (filters, quiz pools, review queue) are materialized in memory
   and cached in `localStorage` to keep sessions persistent across reloads.
3. Learner interactions (answering, rating, editing) trigger `updateHomeStats`
   so the dashboard reflects coverage, accuracy, and review backlog.
4. Importing custom JSON merges validated questions into the local override
   store while preserving the shipped 60-question baseline.

## Study workflow
1. Open the Study panel and set optional filters by topic, lesion group,
   educational category, difficulty, or search text.
2. Click “Start Studying” to load the first matching question. Use the on-screen
  choices or keyboard shortcuts (numbers 1–9) to answer.
3. Feedback appears instantly with rationale, tags, and recommended objectives.
4. Navigate with Next/Previous buttons or arrow keys. A progress pill shows your
   position within the filtered subset.
5. Use “Mark for Review” to flag items for later spaced repetition or targeted
   quizzes.

## Quiz workflow
### Configuration
- Choose lesion groups or tags to include; defaults to the entire bank.
- Set the number of questions (up to the size of the selected pool).
- Toggle timed mode and define the duration (per-question or total minutes).
- Decide whether to shuffle answers and whether to include flagged questions.

### During the quiz
- A sticky header surfaces elapsed/remaining time, question counter, and flag
  status. Keyboard shortcuts accelerate navigation:
  - `1–9`: select corresponding option
  - `Enter`: submit response or advance when feedback is shown
  - `F`: toggle flag for review
  - `R`: reveal rationale after submission
- When timed mode is active, the timer counts down in the header and issues
  audible (ARIA live) warnings at 60 seconds and expiration. Quizzes auto-submit
  when time expires, logging unanswered items as incorrect for review spacing.

### Results & remediation
- Summary card highlights raw score, percent, total time, and accuracy by lesion
  group.
- Detailed table lists each question, learner answer, correctness, and direct
  links to open the item in Study mode for targeted remediation.
- Buttons allow repeating the same configuration, launching a focused study
  session, or enqueueing all misses into the spaced-review queue.

## Spaced review scheduler
- Built on a lightweight SM-2 variant tuned for short sessions.
- Ratings map to intervals as follows:
  - **Again:** resets interval to 1 day, eases factor drop.
  - **Hard:** retains the previous interval, slight ease reduction.
  - **Good:** multiplies interval by ease factor (default 2.5) with cap.
  - **Easy:** jumps ahead with a bonus multiplier and increases ease factor.
- Each review stores `interval`, `dueDate`, `ease`, and `streak` in
  `localStorage`. Due items appear atop the queue with color-coded urgency.
- Learners can snooze or reset individual cards from the Review panel’s detail
  drawer.

## Question bank & schema
The embedded bank contains exactly 60 questions:
- 52 lesion-specific items (two per lesion across 26 acyanotic/cyanotic groups).
- 8 cross-cutting physiology/imaging questions.
- Each lesion’s pair covers distinct educational categories to avoid overlap.

### Field reference
| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | ✓ | Stable unique identifier (e.g., `asd_pathophys`). |
| `topic` | enum | ✓ | `acyanotic`, `cyanotic`, or `cross-cutting`. |
| `lesion` | string | ✓ | Human-readable lesion label (e.g., `ASD`). |
| `category` | enum | ✓ | `pathophysiology`, `presentation`, `exam`, `imaging`, `management_initial`. |
| `type` | enum | ✓ | `mcq`, `tf`, or `multi`. |
| `stem` | string | ✓ | Learner-facing question text. |
| `options` | string[] | conditional | Required for `mcq`/`multi`. 2–6 entries. |
| `answerIndex` | integer | conditional | Correct choice for `mcq`. 0-based. |
| `answerIndices` | integer[] | conditional | Correct choices for `multi`. |
| `answerBool` | boolean | conditional | Truth value for `tf`. |
| `explanation` | string | ✓ | Concise rationale tying back to objectives. |
| `objective` | string | ✓ | Learning objective or board-style takeaway. |
| `tags` | string[] | ✓ | Additional filters (e.g., `murmur`, `hyperoxia`). |
| `difficulty` | integer | ✓ | 1–5 scale (default 2). |
| `references` | string[] | optional | Guidelines, textbooks, or review articles. |
| `version` | string | ✓ | Semantic identifier (`"v1"`). |

### Example question
```json
{
  "id": "pda_murmur",
  "topic": "acyanotic",
  "lesion": "Patent ductus arteriosus",
  "category": "exam",
  "type": "mcq",
  "stem": "A 3-day-old preterm neonate has a continuous machinery murmur ...",
  "options": [
    "Bounding peripheral pulses",
    "Single S2",
    "Diastolic rumble",
    "Fixed split S2"
  ],
  "answerIndex": 0,
  "explanation": "PDA causes runoff into the pulmonary circulation ...",
  "objective": "Identify exam findings suggestive of PDA in preterm infants.",
  "tags": ["murmur", "hemodynamics"],
  "difficulty": 2,
  "references": ["Nelson Textbook of Pediatrics"],
  "version": "v1"
}
```

### Category coverage
Every lesion contributes two items that span two different categories chosen from
pathophysiology, presentation, exam/murmur, imaging/ECG/CXR, or initial
management. Cross-cutting questions emphasize murmurs, shunt physiology,
interpreting the hyperoxia test, first-line prostaglandin use, ECG axis
patterns, and distinguishing pulmonary blood-flow states.

## Local storage & persistence
The app stores progress and overrides with the following keys:
- `chd-theme`: current theme (`"light"` / `"dark"`).
- `chd-progress`: quiz history, accuracy by lesion, and streak data.
- `chd-review-queue`: spaced repetition metadata (`interval`, `dueDate`, etc.).
- `chd-overrides`: learner-authored questions layered on top of the core bank.
- `chd-flags`: IDs flagged for later review.
- `chd-settings`: quiz defaults (timer preference, pool size, shuffling).

All data remains on-device. Use the Admin panel export button to generate a
complete backup (core bank + overrides + learner state). Imports merge into
existing data after schema validation.

## Admin-lite authoring tools
### Inline editor
- Select any question to view metadata, tweak stems/options, or adjust tags.
- Draft changes locally; they do not modify the canonical 60-item seed bank.
- Save writes to the overrides store and updates Study/Quiz/Review views
  immediately.

### Bulk import
1. Click “Import JSON” and paste a JSON array matching the schema above.
2. Validation occurs offline using the embedded Draft-07 validator; failures are
   summarized with per-question error lists (ID + reason) in the Admin panel.
3. Valid records merge into overrides. Duplicate `id` values replace the prior
   override while preserving shipped content for reference.

### Export bundle
- “Export JSON” downloads a prettified JSON file containing the combined question
  set, review queue state, and learner progress for safekeeping or transfer to
  another device.

## Dark mode & accessibility
- Theme toggle persists across sessions using `prefers-color-scheme` detection
  for sensible defaults.
- High-contrast colors, focus outlines, and ARIA labels ensure WCAG-compliant
  navigation. Live regions announce correctness and timer warnings for screen
  reader users.
- Layout adapts from single-column on phones to multi-column dashboards on large
  displays without horizontal scrolling.

### Keyboard shortcuts
- Global: `/` focuses the search box in Study; `?` opens the shortcut legend.
- Study: `ArrowLeft/ArrowRight` for navigation; `1–9` answer options.
- Quiz: `1–9` choose, `Enter` submit/next, `F` flag, `R` reveal rationale.
- Review: `1` Again, `2` Hard, `3` Good, `4` Easy for rapid scheduling.

## Customization & extension
- To author new items, duplicate the example JSON structure above, ensure unique
  IDs, and either paste via the Admin import textarea or edit directly within
  the inline editor.
- Additional categories or tags can be introduced by updating metadata in the
  overrides; the UI reads available filters dynamically from stored data.
- For educators, consider exporting curated sets for specific clerkship blocks
  and distributing the JSON payloads for learners to import locally.

## Troubleshooting
- **Blank page on load:** ensure the browser allows inline scripts (some locked
  enterprise profiles disable `file://` execution). Opening the file from a local
  HTTP server also works if required by policy.
- **Validation errors during import:** review the per-question message for the
  offending field; fix the JSON and retry. All records must pass schema checks
  before being accepted.
- **Timer not audible:** confirm system accessibility settings allow ARIA live
  announcements or enable visual cues via the settings drawer.
- **Storage quota reached:** export your data, clear overrides via Admin, and
  re-import as needed.

## Limitations & disclaimers
- Educational resource only—does not replace clinical judgment or official
  cardiology guidelines. Banner reminders persist across all panels.
- No server-side sync or authentication; data lives solely on the device.
- The SM-2 approximation is tuned for short-term spacing and should not be used
  for long-term certification preparation without additional calibration.

## License
This project is licensed under the [MIT License](LICENSE).

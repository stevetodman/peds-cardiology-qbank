# Pediatric Cardiology QBank

This repository contains a fully client-side congenital heart disease (CHD) study
experience tailored for second-year medical students. The entire app ships inside
`index.html`—no bundlers, package managers, or external assets are required.

## Getting started

1. Download or clone this repository.
2. Open `index.html` in any modern desktop or mobile browser (double-click from
   Finder/Explorer or drag it into a tab). Everything runs offline.

## Features

- **Home hub** with dark-mode toggle, quick navigation, import/export controls,
  and an always-on educational disclaimer.
- **Study mode** for filterable, one-at-a-time review with immediate feedback and
  rationales across cyanotic, acyanotic, and cross-cutting lesions.
- **Quiz mode** featuring configurable pools, optional timers, keyboard
  shortcuts, progress tracking, and post-quiz remediation links.
- **Spaced review** queue powered by a lightweight SM-2 scheduler that keeps
  previously missed items in rotation using local storage.
- **Admin-lite tools** to author or override questions locally, bulk import JSON,
  and export the full bank plus learner progress.
- **Accessibility & responsiveness** baked in: semantic HTML, labeled controls,
  ARIA-live feedback, keyboard support, and mobile-friendly layout.

## Question bank

- Exactly **60 questions** covering every required CHD lesion (2 per lesion
  across 26 categories) plus 8 cross-cutting physiology/imaging topics.
- Each entry follows a strict schema with fields for `id`, `topic`, `lesion`,
  `category`, `type`, `stem`, `options`, answer metadata, `explanation`,
  `objective`, `tags`, `difficulty` (1–5), optional `references`, and `version`.
- The schema, validator, bank data, and UI logic are all embedded inline so the
  experience is completely self-contained.

## Local data management

Progress, overrides, and spaced-review metadata persist in the browser via
`localStorage`. Use the Admin panel to export a backup JSON payload or import
shared question sets. All authoring happens on-device; no data leaves the
browser.

## License

This project is licensed under the [MIT License](LICENSE).

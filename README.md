# Pediatric Cardiology QBank

This is a simple web-based quiz bank focused on pediatric cardiology questions.

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the automated tests:

   ```bash
   npm test
   ```

The test suite boots the quiz inside a JSDOM environment and verifies the key
flows—option rendering, answer validation, scoring, and the remediation review
list—so regressions in the interactive experience are caught automatically.

## Suggested improvements

* Expand the quiz bank and load questions from a JSON file or API so the UI can
  randomize prompts and grow without modifying the core script.
* Provide persisted progress (for example via `localStorage`) so learners can
  resume where they left off and review prior performance over time.
* Add responsive Mermaid diagram theming and printable/exportable study guides
  to give learners multiple modalities for review.

## License

This project is licensed under the [MIT License](LICENSE).

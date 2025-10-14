import { beforeEach, describe, expect, it } from "vitest";
import { initQuiz, questions } from "../script.js";

function setupDOM() {
  document.body.innerHTML = `
    <header class="page-header"></header>
    <main>
      <section id="quiz-section" class="card">
        <h2>Warm-up Quiz</h2>
        <div class="quiz-top">
          <div class="quiz-meta">
            <p id="question-count" class="question-count"></p>
            <p id="score" class="score"></p>
          </div>
          <div
            id="progress-track"
            class="progress-track"
            role="progressbar"
            aria-label="Quiz progress"
            aria-valuemin="0"
            aria-valuemax="0"
            aria-valuenow="0"
          >
            <span id="progress-bar" class="progress-value"></span>
          </div>
        </div>
        <p id="question-text" class="question-text"></p>
        <form id="quiz-form" class="quiz-form" novalidate>
          <fieldset class="quiz-fieldset">
            <legend class="visually-hidden">Answer choices</legend>
            <div id="options" class="options"></div>
          </fieldset>
          <div class="quiz-feedback">
            <p id="feedback" class="feedback" role="status" aria-live="polite"></p>
            <p id="explanation" class="explanation" aria-live="polite"></p>
          </div>
          <div class="quiz-actions">
            <button id="submit-btn" type="submit" class="primary">Check answer</button>
            <button id="restart-btn" type="button" class="secondary" hidden>Restart quiz</button>
          </div>
        </form>
        <div
          id="result-summary"
          class="result-summary"
          role="status"
          aria-live="polite"
          hidden
        ></div>
      </section>
    </main>
  `;
}

function submitForm(form) {
  const event = new Event("submit", { bubbles: true, cancelable: true });
  form.dispatchEvent(event);
}

describe("quiz interactions", () => {
  let controller;

  beforeEach(() => {
    setupDOM();
    controller = initQuiz(document);
  });

  it("renders the first question with answer options and focuses the first choice", () => {
    const { questionText, optionsContainer, quizForm } = controller.getElements();
    const firstQuestion = questions[0];
    expect(questionText.textContent).toBe(firstQuestion.question);
    const options = optionsContainer.querySelectorAll(".option-wrapper");
    expect(options.length).toBe(Object.keys(firstQuestion.answers).length);
    const firstRadio = quizForm.querySelector('input[name="answer"]');
    expect(document.activeElement).toBe(firstRadio);
  });

  it("requires an answer before checking and preserves score", () => {
    const { quizForm, feedback } = controller.getElements();
    submitForm(quizForm);
    expect(feedback.textContent).toContain("Choose the best answer");
    expect(controller.getState().score).toBe(0);
    expect(controller.getState().isAnswerRevealed).toBe(false);
  });

  it("tracks progress, scoring, and review details through the full quiz", () => {
    const elements = controller.getElements();

    // Answer first question correctly
    let current = questions[0];
    let correctInput = elements.quizForm.querySelector(
      `input[value="${current.correctAnswer}"]`
    );
    correctInput.checked = true;
    submitForm(elements.quizForm);
    let state = controller.getState();
    expect(state.score).toBe(1);
    expect(state.isAnswerRevealed).toBe(true);
    expect(elements.feedback.textContent).toContain("Correct");

    // Move to next question
    submitForm(elements.quizForm);
    state = controller.getState();
    expect(state.currentQuestionIndex).toBe(1);

    // Answer remaining questions incorrectly to exercise review list
    for (let i = state.currentQuestionIndex; i < questions.length; i += 1) {
      const form = controller.getElements().quizForm;
      const currentQuestion = questions[i];
      const wrongOption = Array.from(
        form.querySelectorAll('input[name="answer"]')
      ).find((input) => input.value !== currentQuestion.correctAnswer);
      if (!wrongOption) {
        throw new Error("Test requires at least one incorrect choice per question");
      }
      wrongOption.checked = true;
      submitForm(form);
      submitForm(form);
    }

    state = controller.getState();
    expect(state.currentQuestionIndex).toBe(questions.length);
    expect(elements.resultSummary.hidden).toBe(false);
    expect(elements.resultSummary.textContent).toContain("Review these items");
    const reviewItems = elements.resultSummary.querySelectorAll(
      ".result-review-item"
    );
    expect(reviewItems.length).toBe(questions.length - 1);
  });
});

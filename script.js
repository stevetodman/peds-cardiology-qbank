export const questions = [
  {
    question:
      "What heart defect most classically causes a continuous 'machinery' murmur at the infraclavicular area?",
    answers: {
      a: "Ventricular septal defect",
      b: "Patent ductus arteriosus",
      c: "Supravalvular aortic stenosis"
    },
    correctAnswer: "b",
    explanation:
      "A patent ductus arteriosus produces the classic machinery, continuous murmur best heard beneath the left clavicle with bounding pulses if large."
  },
  {
    question:
      "A harsh holosystolic murmur at the left lower sternal border in an asymptomatic infant most commonly points to which lesion?",
    answers: {
      a: "Small ventricular septal defect",
      b: "Tricuspid regurgitation",
      c: "Atrioventricular canal defect"
    },
    correctAnswer: "a",
    explanation:
      "Small VSDs are loud, harsh, holosystolic murmurs at the LLSB, often with a thrill, while large VSDs can sound softer but cause heart failure."
  },
  {
    question:
      "Which finding increases the likelihood of pulmonary stenosis when a systolic ejection murmur is heard at the left upper sternal border?",
    answers: {
      a: "Murmur intensity decreases with inspiration",
      b: "An ejection click that varies with inspiration",
      c: "A wide fixed split S2"
    },
    correctAnswer: "b",
    explanation:
      "An ejection click that becomes softer with inspiration supports valvar pulmonary stenosis, helping distinguish it from flow murmurs or ASD."
  },
  {
    question:
      "A blowing holosystolic murmur at the apex radiating to the axilla should trigger suspicion for which diagnosis in adolescents?",
    answers: {
      a: "Mitral regurgitation",
      b: "Tricuspid regurgitation",
      c: "Hypertrophic cardiomyopathy"
    },
    correctAnswer: "a",
    explanation:
      "Mitral regurgitation classically radiates to the axilla from the apex. In pediatrics it may stem from AV canal defects or mitral valve prolapse."
  },
  {
    question:
      "A crescendo-decrescendo systolic murmur at the LLSB that intensifies with inspiration raises concern for which condition?",
    answers: {
      a: "Hypertrophic cardiomyopathy",
      b: "Pulmonary valve regurgitation",
      c: "Branch pulmonary artery stenosis"
    },
    correctAnswer: "a",
    explanation:
      "Hypertrophic cardiomyopathy in children can present with a dynamic murmur along the LLSB; maneuvers altering preload such as inspiration help differentiate lesions."
  }
];

function createOption(doc, id, key, text) {
  const optionId = `${id}-${key}`;

  const label = doc.createElement("label");
  label.className = "option";
  label.setAttribute("for", optionId);

  const input = doc.createElement("input");
  input.type = "radio";
  input.name = "answer";
  input.id = optionId;
  input.value = key;

  const badge = doc.createElement("span");
  badge.className = "choice-key";
  badge.textContent = key.toUpperCase();

  const copy = doc.createElement("span");
  copy.className = "choice-text";
  copy.textContent = text;

  label.append(badge, copy);

  const wrapper = doc.createElement("div");
  wrapper.className = "option-wrapper";
  wrapper.append(input, label);

  return wrapper;
}

function markOptions(state, elements, selectedValue) {
  const currentQuestion = questions[state.currentQuestionIndex];
  const optionWrappers = elements.optionsContainer.querySelectorAll(
    ".option-wrapper"
  );

  optionWrappers.forEach((wrapper) => {
    const input = wrapper.querySelector("input");
    const label = wrapper.querySelector("label");
    label.classList.remove("is-correct", "is-incorrect", "is-selected");

    if (input.value === currentQuestion.correctAnswer) {
      label.classList.add("is-correct");
    }

    if (input.value === selectedValue) {
      label.classList.add("is-selected");
      if (selectedValue !== currentQuestion.correctAnswer) {
        label.classList.add("is-incorrect");
      }
    }

    input.disabled = true;
  });
}

function buildReviewItem(response) {
  const {
    question,
    selectedKey,
    selectedText,
    correctKey,
    correctText,
    explanation
  } = response;

  const safeSelectedText = selectedText ?? "No answer recorded";
  const safeCorrectText =
    correctText ?? "Refer to the flowchart for clarification.";
  const selectedLabel = selectedKey
    ? `${selectedKey.toUpperCase()}: ${safeSelectedText}`
    : safeSelectedText;
  const correctLabel = correctKey
    ? `${correctKey.toUpperCase()}: ${safeCorrectText}`
    : safeCorrectText;

  return `
    <li class="result-review-item">
      <p class="result-question">${question}</p>
      <p class="result-answer">
        <span class="result-label">Your answer:</span>
        <span class="result-value">${selectedLabel}</span>
      </p>
      <p class="result-answer">
        <span class="result-label">Correct answer:</span>
        <span class="result-value">${correctLabel}</span>
      </p>
      <p class="result-explanation">${explanation}</p>
    </li>
  `;
}

function createElements(doc) {
  return {
    questionText: doc.getElementById("question-text"),
    optionsContainer: doc.getElementById("options"),
    feedback: doc.getElementById("feedback"),
    explanation: doc.getElementById("explanation"),
    questionCount: doc.getElementById("question-count"),
    scoreDisplay: doc.getElementById("score"),
    progressTrack: doc.getElementById("progress-track"),
    progressBar: doc.getElementById("progress-bar"),
    submitButton: doc.getElementById("submit-btn"),
    restartButton: doc.getElementById("restart-btn"),
    resultSummary: doc.getElementById("result-summary"),
    quizForm: doc.getElementById("quiz-form")
  };
}

function validateElements(elements) {
  const missing = Object.entries(elements)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Quiz markup is missing required elements: ${missing.join(", ")}`
    );
  }
}

export function initQuiz(doc = document) {
  const state = {
    totalQuestions: questions.length,
    currentQuestionIndex: 0,
    score: 0,
    isAnswerRevealed: false,
    userResponses: []
  };

  const elements = createElements(doc);
  validateElements(elements);

  elements.progressTrack.setAttribute(
    "aria-valuemax",
    String(state.totalQuestions)
  );

  const setProgress = (step) => {
    const boundedStep = Math.min(
      Math.max(step, 0),
      state.totalQuestions
    );
    const fraction =
      state.totalQuestions === 0 ? 0 : boundedStep / state.totalQuestions;
    elements.progressBar.style.width = `${fraction * 100}%`;
    elements.progressTrack.setAttribute("aria-valuenow", String(boundedStep));
    elements.progressTrack.setAttribute(
      "aria-valuetext",
      `${boundedStep} of ${state.totalQuestions}`
    );
  };

  const updateMeta = () => {
    elements.questionCount.textContent = `Question ${Math.min(
      state.currentQuestionIndex + 1,
      state.totalQuestions
    )} of ${state.totalQuestions}`;
    elements.scoreDisplay.textContent = `Score: ${state.score}/${state.totalQuestions}`;
  };

  const renderQuestion = () => {
    const currentQuestion = questions[state.currentQuestionIndex];
    state.isAnswerRevealed = false;

    elements.questionText.textContent = currentQuestion.question;
    elements.optionsContainer.innerHTML = "";
    elements.feedback.textContent = "";
    elements.feedback.className = "feedback";
    elements.explanation.textContent = "";
    elements.resultSummary.innerHTML = "";
    elements.resultSummary.hidden = true;
    elements.submitButton.hidden = false;
    elements.restartButton.hidden = true;
    elements.submitButton.disabled = false;
    elements.submitButton.textContent = "Check answer";

    const fragment = doc.createDocumentFragment();
    Object.entries(currentQuestion.answers).forEach(([key, text]) => {
      fragment.appendChild(
        createOption(doc, `question-${state.currentQuestionIndex}`, key, text)
      );
    });

    elements.optionsContainer.appendChild(fragment);
    updateMeta();
    setProgress(state.currentQuestionIndex);

    const firstOption = elements.quizForm.querySelector('input[name="answer"]');
    if (firstOption) {
      firstOption.focus();
    }
  };

  const showResultSummary = () => {
    const safeTotal = state.totalQuestions || 1;
    const percent = Math.round((state.score / safeTotal) * 100);
    const incorrectResponses = state.userResponses.filter(
      (response) => response && !response.isCorrect
    );

    const headline =
      percent === 100
        ? "Outstanding recall!"
        : percent >= 80
        ? "Great work!"
        : percent >= 60
        ? "Nice progress!"
        : "Keep practicing!";

    const reviewContent = incorrectResponses.length
      ? `<div class="result-review">
           <h4>Review these items</h4>
           <ol class="result-review-list">
             ${incorrectResponses
               .map((response) => buildReviewItem(response))
               .join("")}
           </ol>
         </div>`
      : `<p class="result-perfect">You nailed every question—take a moment to celebrate and then explore the flowchart for deeper reinforcement.</p>`;

    elements.resultSummary.innerHTML = `
      <h3>${headline}</h3>
      <p>
        You answered <strong>${state.score}</strong> out of <strong>${state.totalQuestions}</strong>
        correctly (${percent}%).
      </p>
      ${reviewContent}
    `;
    elements.resultSummary.hidden = false;
    elements.submitButton.hidden = true;
    elements.restartButton.hidden = false;
    elements.restartButton.focus();
    elements.questionCount.textContent = "Quiz complete";
  };

  const handleAnswerCheck = () => {
    elements.feedback.className = "feedback";
    const selected = elements.quizForm.querySelector(
      'input[name="answer"]:checked'
    );

    if (!selected) {
      elements.feedback.textContent = "Choose the best answer before checking.";
      elements.feedback.classList.add("feedback-warning");
      return;
    }

    const currentQuestion = questions[state.currentQuestionIndex];
    const isCorrect = selected.value === currentQuestion.correctAnswer;

    if (isCorrect) {
      state.score += 1;
      elements.feedback.textContent = "✅ Correct!";
      elements.feedback.classList.add("feedback-success");
    } else {
      elements.feedback.textContent = `❌ Not quite. Correct answer: ${currentQuestion.correctAnswer.toUpperCase()}.`;
      elements.feedback.classList.add("feedback-error");
    }

    elements.explanation.textContent = currentQuestion.explanation;
    markOptions(state, elements, selected.value);
    state.userResponses[state.currentQuestionIndex] = {
      question: currentQuestion.question,
      selectedKey: selected.value,
      selectedText: currentQuestion.answers[selected.value],
      correctKey: currentQuestion.correctAnswer,
      correctText: currentQuestion.answers[currentQuestion.correctAnswer],
      explanation: currentQuestion.explanation,
      isCorrect
    };
    state.isAnswerRevealed = true;
    elements.submitButton.textContent =
      state.currentQuestionIndex === state.totalQuestions - 1
        ? "View results"
        : "Next question";
    updateMeta();
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!state.isAnswerRevealed) {
      handleAnswerCheck();
      return;
    }

    state.currentQuestionIndex += 1;

    if (state.currentQuestionIndex < state.totalQuestions) {
      renderQuestion();
    } else {
      setProgress(state.totalQuestions);
      showResultSummary();
    }
  };

  const handleRestart = () => {
    state.score = 0;
    state.currentQuestionIndex = 0;
    state.userResponses = [];
    renderQuestion();
    setProgress(0);
  };

  elements.quizForm.addEventListener("submit", handleSubmit);
  elements.restartButton.addEventListener("click", handleRestart);

  renderQuestion();

  return {
    getState: () => ({
      totalQuestions: state.totalQuestions,
      currentQuestionIndex: state.currentQuestionIndex,
      score: state.score,
      isAnswerRevealed: state.isAnswerRevealed,
      userResponses: [...state.userResponses]
    }),
    getElements: () => elements,
    renderQuestion,
    handleAnswerCheck,
    showResultSummary,
    setProgress
  };
}

if (typeof window !== "undefined" && window.document) {
  initQuiz(window.document);
}


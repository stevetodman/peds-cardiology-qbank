const questions = [
  {
    question: "What heart defect most classically causes a continuous 'machinery' murmur at the infraclavicular area?",
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
    question: "A harsh holosystolic murmur at the left lower sternal border in an asymptomatic infant most commonly points to which lesion?",
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
    question: "Which finding increases the likelihood of pulmonary stenosis when a systolic ejection murmur is heard at the left upper sternal border?",
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
    question: "A blowing holosystolic murmur at the apex radiating to the axilla should trigger suspicion for which diagnosis in adolescents?",
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
    question: "A crescendo-decrescendo systolic murmur at the LLSB that intensifies with inspiration raises concern for which condition?",
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

const totalQuestions = questions.length;
let currentQuestionIndex = 0;
let score = 0;
let isAnswerRevealed = false;

const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options");
const feedback = document.getElementById("feedback");
const explanation = document.getElementById("explanation");
const questionCount = document.getElementById("question-count");
const scoreDisplay = document.getElementById("score");
const progressTrack = document.getElementById("progress-track");
const progressBar = document.getElementById("progress-bar");
const submitButton = document.getElementById("submit-btn");
const restartButton = document.getElementById("restart-btn");
const resultSummary = document.getElementById("result-summary");
const quizForm = document.getElementById("quiz-form");

progressTrack.setAttribute("aria-valuemax", totalQuestions);

function setProgress(step) {
  const boundedStep = Math.min(Math.max(step, 0), totalQuestions);
  const fraction = totalQuestions === 0 ? 0 : boundedStep / totalQuestions;
  progressBar.style.width = `${fraction * 100}%`;
  progressTrack.setAttribute("aria-valuenow", String(boundedStep));
  progressTrack.setAttribute("aria-valuetext", `${boundedStep} of ${totalQuestions}`);
}

function updateMeta() {
  questionCount.textContent = `Question ${Math.min(currentQuestionIndex + 1, totalQuestions)} of ${totalQuestions}`;
  scoreDisplay.textContent = `Score: ${score}/${totalQuestions}`;
}

function createOption(id, key, text) {
  const optionId = `${id}-${key}`;

  const label = document.createElement("label");
  label.className = "option";
  label.setAttribute("for", optionId);

  const input = document.createElement("input");
  input.type = "radio";
  input.name = "answer";
  input.id = optionId;
  input.value = key;

  const badge = document.createElement("span");
  badge.className = "choice-key";
  badge.textContent = key.toUpperCase();

  const copy = document.createElement("span");
  copy.className = "choice-text";
  copy.textContent = text;

  label.append(badge, copy);

  const wrapper = document.createElement("div");
  wrapper.className = "option-wrapper";
  wrapper.append(input, label);

  return wrapper;
}

function renderQuestion() {
  const currentQuestion = questions[currentQuestionIndex];
  isAnswerRevealed = false;

  questionText.textContent = currentQuestion.question;
  optionsContainer.innerHTML = "";
  feedback.textContent = "";
  feedback.className = "feedback";
  explanation.textContent = "";
  resultSummary.hidden = true;
  submitButton.hidden = false;
  restartButton.hidden = true;
  submitButton.disabled = false;
  submitButton.textContent = "Check answer";

  const fragment = document.createDocumentFragment();
  Object.entries(currentQuestion.answers).forEach(([key, text]) => {
    fragment.appendChild(createOption(`question-${currentQuestionIndex}`, key, text));
  });

  optionsContainer.appendChild(fragment);
  updateMeta();
  setProgress(currentQuestionIndex);

  const firstOption = quizForm.querySelector('input[name="answer"]');
  if (firstOption) {
    firstOption.focus();
  }
}

function markOptions(selectedValue) {
  const currentQuestion = questions[currentQuestionIndex];
  const optionWrappers = optionsContainer.querySelectorAll(".option-wrapper");

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

function showResultSummary() {
  const percent = Math.round((score / totalQuestions) * 100);
  resultSummary.innerHTML = `
    <h3>Great work!</h3>
    <p>You answered <strong>${score}</strong> out of <strong>${totalQuestions}</strong> correctly (${percent}%).</p>
    <p>Review the flowchart to reinforce the murmurs you missed, then try again.</p>
  `;
  resultSummary.hidden = false;
  submitButton.hidden = true;
  restartButton.hidden = false;
  restartButton.focus();
  questionCount.textContent = "Quiz complete";
}

function handleAnswerCheck() {
  feedback.className = "feedback";
  const selected = quizForm.querySelector('input[name="answer"]:checked');

  if (!selected) {
    feedback.textContent = "Choose the best answer before checking.";
    feedback.classList.add("feedback-warning");
    return;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isCorrect = selected.value === currentQuestion.correctAnswer;

  if (isCorrect) {
    score += 1;
    feedback.textContent = "✅ Correct!";
    feedback.classList.add("feedback-success");
  } else {
    feedback.textContent = `❌ Not quite. Correct answer: ${currentQuestion.correctAnswer.toUpperCase()}.`;
    feedback.classList.add("feedback-error");
  }

  explanation.textContent = currentQuestion.explanation;
  markOptions(selected.value);
  isAnswerRevealed = true;
  submitButton.textContent = currentQuestionIndex === totalQuestions - 1 ? "View results" : "Next question";
  updateMeta();
}

quizForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!isAnswerRevealed) {
    handleAnswerCheck();
    return;
  }

  currentQuestionIndex += 1;

  if (currentQuestionIndex < totalQuestions) {
    renderQuestion();
  } else {
    setProgress(totalQuestions);
    showResultSummary();
  }
});

restartButton.addEventListener("click", () => {
  score = 0;
  currentQuestionIndex = 0;
  renderQuestion();
  setProgress(0);
});

renderQuestion();
*** End of File

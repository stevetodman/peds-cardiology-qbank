const questions = [
  {
    question: "What heart defect causes a continuous 'machinery' murmur?",
    answers: {
      a: "Ventricular Septal Defect",
      b: "Patent Ductus Arteriosus",
      c: "Atrial Septal Defect"
    },
    correctAnswer: "b"
  },
  {
    question: "A harsh holosystolic murmur at the LLSB most likely indicates which lesion?",
    answers: {
      a: "Ventricular Septal Defect",
      b: "Tricuspid Regurgitation",
      c: "Mitral Regurgitation"
    },
    correctAnswer: "a"
  },
  {
    question: "Which murmur increases in intensity with inspiration at the left lower sternal border?",
    answers: {
      a: "Tricuspid Regurgitation",
      b: "Hypertrophic Cardiomyopathy",
      c: "Pulmonary Stenosis"
    },
    correctAnswer: "a"
  }
];

let currentQuestionIndex = 0;
let score = 0;

const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options");
const feedback = document.getElementById("feedback");
const scoreDisplay = document.getElementById("score");
const submitButton = document.getElementById("submit-btn");

function createOption(key, text) {
  const label = document.createElement("label");
  label.className = "option";

  const input = document.createElement("input");
  input.type = "radio";
  input.name = "answer";
  input.value = key;
  input.setAttribute("aria-label", `${key.toUpperCase()}: ${text}`);

  const choiceBadge = document.createElement("span");
  choiceBadge.className = "choice-key";
  choiceBadge.textContent = key.toUpperCase();

  const choiceText = document.createElement("span");
  choiceText.className = "choice-text";
  choiceText.textContent = text;

  label.appendChild(input);
  label.appendChild(choiceBadge);
  label.appendChild(choiceText);

  return label;
}

function showQuestion(index) {
  const { question, answers } = questions[index];
  questionText.textContent = question;
  optionsContainer.innerHTML = "";

  const fragment = document.createDocumentFragment();
  Object.entries(answers).forEach(([key, text]) => {
    fragment.appendChild(createOption(key, text));
  });

  optionsContainer.appendChild(fragment);
  feedback.textContent = "";
  submitButton.disabled = false;
}

function updateScore() {
  scoreDisplay.textContent = `Score: ${score}/${questions.length}`;
}

submitButton.addEventListener("click", () => {
  const selected = optionsContainer.querySelector('input[name="answer"]:checked');

  if (!selected) {
    feedback.textContent = "Please choose an answer.";
    return;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isCorrect = selected.value === currentQuestion.correctAnswer;

  feedback.textContent = isCorrect
    ? "✅ Correct!"
    : `❌ Incorrect. Answer: ${currentQuestion.correctAnswer.toUpperCase()}`;

  if (isCorrect) {
    score += 1;
    updateScore();
  }

  submitButton.disabled = true;

  setTimeout(() => {
    currentQuestionIndex += 1;

    if (currentQuestionIndex < questions.length) {
      showQuestion(currentQuestionIndex);
    } else {
      feedback.textContent += `  Quiz complete! Final score: ${score}/${questions.length}`;
    }
  }, 800);
});

updateScore();
showQuestion(currentQuestionIndex);

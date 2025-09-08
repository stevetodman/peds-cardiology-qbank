const questions = [
    {
      question: "What heart defect causes a continuous 'machinery' murmur?",
      answers: {
        a: "Ventricular Septal Defect",
        b: "Patent Ductus Arteriosus",
        c: "Atrial Septal Defect"
      },
      correctAnswer: "b"
    }
  ];
  
  let currentQuestion = 0;
  let score = 0;
  
  const questionText = document.getElementById("question-text");
  const optionsContainer = document.getElementById("options");
  const feedback = document.getElementById("feedback");
  const scoreDisplay = document.getElementById("score");
  const submitButton = document.getElementById("submit-btn");
  
  function showQuestion(index) {
    const q = questions[index];
    questionText.textContent = q.question;
    optionsContainer.innerHTML = "";
  
    for (let key in q.answers) {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "answer";
      input.value = key;
      label.appendChild(input);
      label.append(` ${key.toUpperCase()}: ${q.answers[key]}`);
      optionsContainer.appendChild(label);
      optionsContainer.appendChild(document.createElement("br"));
    }
  
    feedback.textContent = "";
  }
  
  submitButton.addEventListener("click", () => {
    const selected = document.querySelector('input[name="answer"]:checked');
    if (!selected) {
      feedback.textContent = "Please choose an answer.";
      return;
    }
  
    const correct = selected.value === questions[currentQuestion].correctAnswer;
    feedback.textContent = correct ? "✅ Correct!" :
      `❌ Incorrect. Answer: ${questions[currentQuestion].correctAnswer.toUpperCase()}`;
    if (correct) score++;
    scoreDisplay.textContent = `Score: ${score}`;
  
    currentQuestion++;
    if (currentQuestion < questions.length) {
      setTimeout(() => showQuestion(currentQuestion), 1000);
    } else {
      submitButton.disabled = true;
      feedback.textContent += `  Quiz complete! Final score: ${score}/${questions.length}`;
    }
  });
  
  showQuestion(currentQuestion);

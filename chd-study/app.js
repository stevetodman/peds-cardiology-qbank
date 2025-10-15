import Ajv from 'https://cdn.jsdelivr.net/npm/ajv@8/dist/ajv.min.js';
import { initAdmin } from './admin.js';

const CATEGORY_OPTIONS = [
  { value: 'pathophysiology', label: 'Pathophysiology' },
  { value: 'presentation', label: 'Presentation' },
  { value: 'exam/murmur', label: 'Exam / Murmur' },
  { value: 'imaging_ecg_cxr', label: 'Imaging / ECG / CXR' },
  { value: 'management_initial', label: 'Initial Management' }
];

const DIFFICULTY_STRING_TO_LEVEL = {
  foundation: 1,
  core: 2,
  advanced: 3
};

const DIFFICULTY_LEVEL_TO_STRING = {
  1: 'foundation',
  2: 'core',
  3: 'advanced',
  4: 'advanced',
  5: 'advanced'
};

const DIFFICULTY_LABELS = {
  foundation: 'Foundation',
  core: 'Core',
  advanced: 'Advanced'
};

const QUESTION_DATA_PATH = 'data/questions.v1.json';
const QUESTION_SCHEMA_PATH = 'data/questions.schema.json';

initApp();

async function initApp() {
  const loaderNotice = document.getElementById('loaderNotice');
  const ajv = new Ajv({ allErrors: true, strict: false });

  try {
    const { questions, schema, validator } = await loadQuestions(ajv);
    const baseQuestions = questions.map(fromSchemaQuestion);
    startApp({ baseQuestions, ajv, schema, validator });
    if (loaderNotice) {
      loaderNotice.textContent = `Question bank loaded (${questions.length} items).`;
      loaderNotice.classList.remove('error');
    }
  } catch (error) {
    console.error(error);
    if (loaderNotice) {
      const detail = Array.isArray(error.details) && error.details.length
        ? ` (${error.details[0].id || 'item'}: ${error.details[0].errors?.map(e => e.message).join('; ') || error.message})`
        : error.message ? ` (${error.message})` : '';
      loaderNotice.textContent = `Unable to load question bank${detail}. Please refresh or contact the maintainer.`;
      loaderNotice.classList.add('error');
    } else {
      alert('Unable to load question bank. See console for details.');
    }
  }
}

async function loadQuestions(ajv) {
  const [schemaResp, dataResp] = await Promise.all([
    fetch(QUESTION_SCHEMA_PATH),
    fetch(QUESTION_DATA_PATH)
  ]);

  if (!schemaResp.ok) {
    throw new Error(`Schema load failed: ${schemaResp.status} ${schemaResp.statusText}`);
  }
  if (!dataResp.ok) {
    throw new Error(`Question data load failed: ${dataResp.status} ${dataResp.statusText}`);
  }

  const schema = await schemaResp.json();
  const questions = await dataResp.json();

  if (!Array.isArray(questions)) {
    throw new Error('Question payload must be an array.');
  }

  const validate = ajv.compile(schema);
  const invalidItems = [];
  questions.forEach((item, index) => {
    const valid = validate(item);
    if (!valid) {
      const errors = (validate.errors || []).map(err => ({
        message: err.message,
        instancePath: err.instancePath,
        schemaPath: err.schemaPath
      }));
      invalidItems.push({ index, id: item && typeof item === 'object' ? item.id || `index-${index}` : `index-${index}`, errors });
    }
  });

  if (invalidItems.length) {
    const error = new Error('Question validation failed');
    error.details = invalidItems;
    throw error;
  }

  const ids = new Set();
  const duplicates = [];
  questions.forEach(q => {
    if (ids.has(q.id)) {
      duplicates.push(q.id);
    } else {
      ids.add(q.id);
    }
  });
  if (duplicates.length) {
    const error = new Error(`Duplicate question ids detected: ${duplicates.join(', ')}`);
    error.details = duplicates;
    throw error;
  }

  return { questions, schema, validator: validate };
}

function fromSchemaQuestion(raw) {
  const classification = raw.topic === 'cross-cutting' ? 'cross' : raw.topic;
  const type = raw.type || 'mcq';
  const difficultyString = DIFFICULTY_LEVEL_TO_STRING[raw.difficulty] || 'core';
  const options = Array.isArray(raw.options)
    ? raw.options.map((text, index) => ({
        key: String.fromCharCode(65 + index),
        text,
        correct: type === 'multi'
          ? Array.isArray(raw.answerIndices) && raw.answerIndices.includes(index)
          : type === 'tf'
          ? ((raw.answerBool === true && index === 0) || (raw.answerBool === false && index === 1))
          : raw.answerIndex === index
      }))
    : [];

  if (type === 'tf' && options.length === 0) {
    options.push({ key: 'A', text: 'True', correct: raw.answerBool === true });
    options.push({ key: 'B', text: 'False', correct: raw.answerBool === false });
  }

  return {
    id: raw.id,
    lesionKey: slugifyLesion(raw.lesion),
    lesionGroup: raw.lesion,
    classification,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    category: raw.category,
    difficulty: difficultyString,
    prompt: raw.stem,
    options,
    rationale: raw.explanation,
    remediation: raw.objective || '',
    type,
    difficultyLevel: raw.difficulty,
    version: raw.version || 'v1',
    references: Array.isArray(raw.references) ? raw.references : []
  };
}

function toSchemaQuestion(question) {
  const difficultyLevel = DIFFICULTY_STRING_TO_LEVEL[question.difficulty] || 2;
  const base = {
    id: question.id,
    topic: question.classification === 'cross' ? 'cross-cutting' : question.classification,
    lesion: question.lesionGroup,
    category: question.category,
    type: question.type || 'mcq',
    stem: question.prompt,
    explanation: question.rationale,
    tags: Array.isArray(question.tags) ? question.tags : [],
    difficulty: question.difficultyLevel || difficultyLevel,
    objective: question.remediation || '',
    references: Array.isArray(question.references) ? question.references : [],
    version: question.version || 'v1'
  };

  if (base.type === 'tf') {
    base.answerBool = question.options?.[0]?.correct === true;
    base.options = ['True', 'False'];
  } else if (base.type === 'multi') {
    base.options = (question.options || []).map(opt => opt.text);
    base.answerIndices = (question.options || []).reduce((acc, opt, index) => {
      if (opt.correct) acc.push(index);
      return acc;
    }, []);
  } else {
    base.options = (question.options || []).map(opt => opt.text);
    base.answerIndex = (question.options || []).findIndex(opt => opt.correct);
  }

  return base;
}

function slugifyLesion(label) {
  return (label || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 40) || 'LESION';
}

function startApp({ baseQuestions, ajv, schema, validator }) {
  const CORE_BANK = baseQuestions.map(normalizeQuestion);
  const STORAGE_KEYS = {
    progress: 'chd_progress_v1',
    review: 'chd_review_v1',
    overrides: 'chd_overrides_v1',
    dark: 'chd_dark_mode_v1'
  };

  let overrides = loadOverrides();
  let progress = loadProgress();
  let reviewData = loadReview();
  let bank = buildBank();
  let adminApi = null;

  function rebuildBankAndUI() {
    bank = buildBank();
    populateDynamicSelects();
    applyStudyFilters();
    if (adminApi && typeof adminApi.onBankUpdated === 'function') {
      adminApi.onBankUpdated();
    }
    loadReviewStatus();
    loadNextReview();
  }

  function loadOverrides() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.overrides) || '{}');
      if (data && typeof data === 'object') {
        return data;
      }
    } catch (error) {
      console.warn('Unable to parse overrides', error);
    }
    return {};
  }

  function saveOverrides() {
    try {
      localStorage.setItem(STORAGE_KEYS.overrides, JSON.stringify(overrides));
    } catch (error) {
      console.warn('Unable to save overrides', error);
    }
  }

  function loadProgress() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.progress) || 'null');
      if (data && typeof data === 'object') {
        data.questions = data.questions || {};
        data.quizHistory = data.quizHistory || [];
        return data;
      }
    } catch (error) {
      console.warn('Unable to parse progress', error);
    }
    return { questions: {}, quizHistory: [] };
  }

  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(progress));
    } catch (error) {
      console.warn('Unable to save progress', error);
    }
  }

  function loadReview() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.review) || 'null');
      if (data && typeof data === 'object') {
        data.items = data.items || {};
        return data;
      }
    } catch (error) {
      console.warn('Unable to parse review data', error);
    }
    return { items: {} };
  }

  function saveReview() {
    try {
      localStorage.setItem(STORAGE_KEYS.review, JSON.stringify(reviewData));
    } catch (error) {
      console.warn('Unable to save review data', error);
    }
  }

  function buildBank() {
    const baseMap = new Map(CORE_BANK.map(q => [q.id, q]));
    const merged = [];
    baseMap.forEach((value, id) => {
      merged.push(overrides[id] ? normalizeQuestion(overrides[id]) : value);
    });
    Object.entries(overrides).forEach(([id, question]) => {
      if (!baseMap.has(id)) {
        merged.push(normalizeQuestion(question));
      }
    });
    return merged;
  }

  function normalizeQuestion(question) {
    const copy = JSON.parse(JSON.stringify(question));
    copy.tags = Array.isArray(copy.tags) ? copy.tags : [];
    copy.options = Array.isArray(copy.options) ? copy.options : [];
    copy.difficultyLevel = copy.difficultyLevel ?? DIFFICULTY_STRING_TO_LEVEL[copy.difficulty] || 2;
    copy.type = copy.type || 'mcq';
    copy.version = copy.version || 'v1';
    copy.references = Array.isArray(copy.references) ? copy.references : [];
    return copy;
  }

  function getQuestionById(id) {
    return bank.find(q => q.id === id) || null;
  }
  const panelButtons = document.querySelectorAll('nav button[data-panel]');
  const panels = {
    home: document.getElementById('home'),
    study: document.getElementById('study'),
    quiz: document.getElementById('quiz'),
    review: document.getElementById('review'),
    admin: document.getElementById('admin')
  };

  let activePanel = 'home';

  panelButtons.forEach(button => {
    button.addEventListener('click', () => switchPanel(button.dataset.panel));
  });

  function switchPanel(panelId) {
    if (!panels[panelId]) return;
    panels[activePanel].classList.remove('active');
    document.querySelector(`nav button[data-panel="${activePanel}"]`).classList.remove('active');
    activePanel = panelId;
    panels[activePanel].classList.add('active');
    document.querySelector(`nav button[data-panel="${activePanel}"]`).classList.add('active');
    panels[activePanel].focus();
    if (panelId === 'study') {
      applyStudyFilters();
    } else if (panelId === 'review') {
      loadReviewStatus();
      loadNextReview();
    }
  }

  const darkToggle = document.getElementById('darkToggle');
  const storedDark = localStorage.getItem(STORAGE_KEYS.dark);
  if (storedDark === 'true') {
    document.body.classList.add('dark');
    darkToggle.setAttribute('aria-pressed', 'true');
  }

  darkToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    darkToggle.setAttribute('aria-pressed', String(isDark));
    try {
      localStorage.setItem(STORAGE_KEYS.dark, String(isDark));
    } catch (error) {
      console.warn('Unable to store dark preference', error);
    }
  });

  const quickActions = document.querySelectorAll('[data-action]');
  quickActions.forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action === 'start-quiz') {
        switchPanel('quiz');
        document.getElementById('quizForm').scrollIntoView({ behavior: 'smooth' });
      } else if (action === 'open-study') {
        switchPanel('study');
      } else if (action === 'continue-review') {
        switchPanel('review');
        if (!loadNextReview()) {
          announce('No review items are due yet.');
        }
      }
    });
  });

  function announce(message) {
    const live = document.getElementById('studyStatus');
    if (live) {
      live.textContent = message;
    }
  }
  const studyClassification = document.getElementById('studyClassification');
  const studyLesion = document.getElementById('studyLesion');
  const studyCategory = document.getElementById('studyCategory');
  const studyDifficulty = document.getElementById('studyDifficulty');
  const quizLesions = document.getElementById('quizLesions');
  const quizCategory = document.getElementById('quizCategory');
  const quizDifficulty = document.getElementById('quizDifficulty');

  function populateCategorySelect(select) {
    select.innerHTML = '';
    const optionAll = document.createElement('option');
    optionAll.value = 'all';
    optionAll.textContent = 'All';
    select.appendChild(optionAll);
    CATEGORY_OPTIONS.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.value;
      opt.textContent = cat.label;
      select.appendChild(opt);
    });
  }

  populateCategorySelect(studyCategory);
  populateCategorySelect(quizCategory);

  function getUniqueLesions() {
    const map = new Map();
    bank.forEach(q => {
      if (!map.has(q.lesionKey)) {
        map.set(q.lesionKey, {
          key: q.lesionKey,
          label: q.lesionGroup,
          classification: q.classification
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }

  function populateDynamicSelects() {
    const lesions = getUniqueLesions();
    studyLesion.innerHTML = '<option value="all">All</option>';
    lesions.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.key;
      opt.textContent = `${item.label} (${capitalize(item.classification)})`;
      studyLesion.appendChild(opt);
    });
    quizLesions.innerHTML = '';
    lesions.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.key;
      opt.textContent = `${item.label} (${capitalize(item.classification)})`;
      quizLesions.appendChild(opt);
    });
  }

  function capitalize(value) {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  populateDynamicSelects();
  const studyPrompt = document.getElementById('studyPrompt');
  const studyChoices = document.getElementById('studyChoices');
  const studySubmit = document.getElementById('studySubmit');
  const studyReveal = document.getElementById('studyReveal');
  const studyNext = document.getElementById('studyNext');
  const studyFeedback = document.getElementById('studyFeedback');
  const studyMeta = document.getElementById('studyMeta');
  const studyStatus = document.getElementById('studyStatus');

  const studyState = {
    pool: [],
    index: 0,
    answered: false
  };

  [studyClassification, studyLesion, studyCategory, studyDifficulty].forEach(select => {
    select.addEventListener('change', applyStudyFilters);
  });

  function applyStudyFilters() {
    const classification = studyClassification.value;
    const lesion = studyLesion.value;
    const category = studyCategory.value;
    const difficulty = studyDifficulty.value;
    const filtered = bank.filter(q => {
      const matchesClassification = classification === 'all' || q.classification === classification;
      const matchesLesion = lesion === 'all' || q.lesionKey === lesion;
      const matchesCategory = category === 'all' || q.category === category;
      const matchesDifficulty = difficulty === 'all' || q.difficulty === difficulty;
      return matchesClassification && matchesLesion && matchesCategory && matchesDifficulty;
    });
    studyState.pool = filtered;
    studyState.index = 0;
    renderStudyQuestion();
  }

  function renderMeta(container, question) {
    container.innerHTML = '';
    const createPill = (text) => {
      const span = document.createElement('span');
      span.className = 'pill';
      span.textContent = text;
      container.appendChild(span);
    };
    createPill(`${capitalize(question.classification)} lesion`);
    createPill(question.lesionGroup);
    const categoryLabel = CATEGORY_OPTIONS.find(cat => cat.value === question.category);
    if (categoryLabel) createPill(categoryLabel.label);
    createPill(`${capitalize(question.difficulty)} level`);
    question.tags.slice(0, 3).forEach(tag => createPill(tag));
  }

  function renderStudyQuestion() {
    studyFeedback.textContent = '';
    studyFeedback.className = 'feedback';
    if (!studyState.pool.length) {
      studyPrompt.textContent = 'No questions match your filters yet. Adjust the filters to continue studying.';
      studyChoices.innerHTML = '';
      studyMeta.innerHTML = '';
      studyStatus.textContent = '0 questions available.';
      return;
    }
    const question = studyState.pool[studyState.index];
    renderMeta(studyMeta, question);
    studyPrompt.textContent = question.prompt;
    studyChoices.innerHTML = '';
    question.options.forEach(option => {
      const wrapper = document.createElement('label');
      wrapper.className = 'choice';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'studyChoice';
      input.value = option.key;
      input.setAttribute('aria-label', `${option.key}: ${option.text}`);
      const text = document.createElement('span');
      text.innerHTML = `<strong>${option.key}.</strong> ${option.text}`;
      wrapper.appendChild(input);
      wrapper.appendChild(text);
      studyChoices.appendChild(wrapper);
    });
    studyState.answered = false;
    studyStatus.textContent = `Question ${studyState.index + 1} of ${studyState.pool.length}`;
  }

  studySubmit.addEventListener('click', () => {
    if (!studyState.pool.length) return;
    const selected = studyChoices.querySelector('input[name="studyChoice"]:checked');
    if (!selected) {
      studyFeedback.textContent = 'Please choose an answer before checking.';
      studyFeedback.className = 'feedback error';
      return;
    }
    if (studyState.answered) {
      studyFeedback.textContent = 'Already checked. Move to the next question.';
      return;
    }
    const question = studyState.pool[studyState.index];
    const correctOption = question.options.find(opt => opt.correct);
    const isCorrect = selected.value === correctOption.key;
    studyChoices.querySelectorAll('.choice').forEach(choice => {
      const input = choice.querySelector('input');
      if (input.value === correctOption.key) {
        choice.classList.add('correct');
      }
      if (input.checked && !isCorrect) {
        choice.classList.add('incorrect');
      }
      input.disabled = true;
    });
    studyFeedback.textContent = `${isCorrect ? '✅ Correct' : '❌ Not quite'} — ${question.rationale}`;
    studyFeedback.className = isCorrect ? 'feedback success' : 'feedback error';
    studyState.answered = true;
    recordAttempt(question.id, isCorrect, 'study');
    if (!isCorrect) {
      enqueueForReview(question.id, true);
    }
  });

  studyReveal.addEventListener('click', () => {
    if (!studyState.pool.length) return;
    const question = studyState.pool[studyState.index];
    const correctOption = question.options.find(opt => opt.correct);
    studyChoices.querySelectorAll('.choice').forEach(choice => {
      const input = choice.querySelector('input');
      if (input.value === correctOption.key) {
        choice.classList.add('correct');
      }
      input.disabled = true;
    });
    studyFeedback.textContent = `Answer ${correctOption.key}: ${correctOption.text}. ${question.rationale}`;
    studyFeedback.className = 'feedback';
    studyState.answered = true;
  });

  studyNext.addEventListener('click', () => {
    if (!studyState.pool.length) return;
    studyState.index = (studyState.index + 1) % studyState.pool.length;
    renderStudyQuestion();
  });
  const quizForm = document.getElementById('quizForm');
  const quizConfig = document.getElementById('quizConfig');
  const quizTake = document.getElementById('quizTake');
  const quizResults = document.getElementById('quizResults');
  const quizPrompt = document.getElementById('quizPrompt');
  const quizChoices = document.getElementById('quizChoices');
  const quizFeedback = document.getElementById('quizFeedback');
  const quizProgress = document.getElementById('quizProgress');
  const quizCounter = document.getElementById('quizCounter');
  const quizTimerDisplay = document.getElementById('quizTimerDisplay');
  const quizMeta = document.getElementById('quizMeta');
  const quizSubmit = document.getElementById('quizSubmit');
  const quizFlag = document.getElementById('quizFlag');
  const quizSummary = document.getElementById('quizSummary');
  const quizRemediation = document.getElementById('quizRemediation');
  const resultTableBody = document.getElementById('resultTableBody');
  const retakeQuiz = document.getElementById('retakeQuiz');
  const returnToConfig = document.getElementById('returnToConfig');
  const loadMissed = document.getElementById('loadMissed');
  const quizCountInput = document.getElementById('quizCount');
  const quizTimerInput = document.getElementById('quizTimer');

  let quizState = null;
  let lastQuizSettings = null;

  quizForm.addEventListener('submit', event => {
    event.preventDefault();
    const lesionSelection = Array.from(quizLesions.selectedOptions).map(opt => opt.value);
    const config = {
      lesions: lesionSelection,
      category: quizCategory.value,
      difficulty: quizDifficulty.value,
      count: Math.max(1, Math.min(parseInt(quizCountInput.value, 10) || 1, bank.length)),
      timer: Math.max(0, parseInt(quizTimerInput.value, 10) || 0)
    };
    startQuiz(config);
  });

  loadMissed.addEventListener('click', () => {
    const missed = Object.entries(progress.questions)
      .filter(([, stats]) => stats.lastResult === 'incorrect')
      .map(([id]) => getQuestionById(id))
      .filter(Boolean);
    if (!missed.length) {
      quizFeedback.textContent = 'No missed questions recorded yet. Complete a quiz first!';
      quizFeedback.className = 'feedback error';
      switchPanel('quiz');
      return;
    }
    const config = {
      lesions: [],
      category: 'all',
      difficulty: 'all',
      count: missed.length,
      timer: 0,
      presetPool: shuffleArray(missed)
    };
    startQuiz(config);
  });

  quizFlag.addEventListener('click', () => {
    if (!quizState) return;
    const question = quizState.questions[quizState.index];
    if (quizState.flagged.has(question.id)) {
      quizState.flagged.delete(question.id);
      quizFlag.textContent = 'Flag for review';
    } else {
      quizState.flagged.add(question.id);
      quizFlag.textContent = 'Unflag';
      enqueueForReview(question.id, true);
    }
    quizFlag.setAttribute('aria-pressed', String(quizState.flagged.has(question.id)));
  });

  quizSubmit.addEventListener('click', handleQuizSubmit);

  retakeQuiz.addEventListener('click', () => {
    if (lastQuizSettings) {
      startQuiz(lastQuizSettings);
    }
  });

  returnToConfig.addEventListener('click', () => {
    showQuizConfig();
  });

  resultTableBody.addEventListener('click', event => {
    const target = event.target.closest('button[data-lesion]');
    if (!target) return;
    const lesionKey = target.dataset.lesion;
    switchPanel('study');
    studyLesion.value = lesionKey;
    applyStudyFilters();
  });

  function startQuiz(config) {
    quizFeedback.textContent = '';
    quizFeedback.className = 'feedback';
    const pool = config.presetPool ? config.presetPool : buildQuizPool(config);
    if (!pool.length) {
      quizFeedback.textContent = 'No questions match your selections. Try broadening the filters.';
      quizFeedback.className = 'feedback error';
      return;
    }
    lastQuizSettings = Object.assign({}, config);
    quizState = {
      questions: pool,
      index: 0,
      responses: [],
      flagged: new Set(),
      showingFeedback: false,
      timed: config.timer > 0,
      remainingSeconds: config.timer > 0 ? config.timer * 60 : 0,
      timerId: null,
      startTime: Date.now()
    };
    quizConfig.hidden = true;
    quizTake.hidden = false;
    quizResults.hidden = true;
    renderQuizQuestion();
    if (quizState.timed) {
      updateTimerDisplay();
      quizState.timerId = setInterval(() => {
        quizState.remainingSeconds -= 1;
        if (quizState.remainingSeconds <= 0) {
          quizState.remainingSeconds = 0;
          updateTimerDisplay();
          clearInterval(quizState.timerId);
          handleTimeExpired();
        } else {
          updateTimerDisplay();
        }
      }, 1000);
    } else {
      quizTimerDisplay.textContent = 'Untimed';
    }
  }

  function buildQuizPool(config) {
    let pool = bank.slice();
    if (config.lesions && config.lesions.length) {
      pool = pool.filter(q => config.lesions.includes(q.lesionKey));
    }
    if (config.category && config.category !== 'all') {
      pool = pool.filter(q => q.category === config.category);
    }
    if (config.difficulty && config.difficulty !== 'all') {
      pool = pool.filter(q => q.difficulty === config.difficulty);
    }
    pool = shuffleArray(pool);
    return pool.slice(0, config.count);
  }

  function renderQuizQuestion() {
    if (!quizState) return;
    const total = quizState.questions.length;
    if (quizState.index >= total) {
      endQuiz(false);
      return;
    }
    const question = quizState.questions[quizState.index];
    renderMeta(quizMeta, question);
    quizPrompt.textContent = question.prompt;
    quizChoices.innerHTML = '';
    question.options.forEach(option => {
      const label = document.createElement('label');
      label.className = 'choice';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'quizChoice';
      input.value = option.key;
      input.id = `quiz_${question.id}_${option.key}`;
      const text = document.createElement('span');
      text.innerHTML = `<strong>${option.key}.</strong> ${option.text}`;
      label.appendChild(input);
      label.appendChild(text);
      quizChoices.appendChild(label);
    });
    quizFeedback.textContent = '';
    quizFeedback.className = 'feedback';
    quizSubmit.textContent = 'Submit';
    quizState.showingFeedback = false;
    quizProgress.style.width = `${(quizState.index / total) * 100}%`;
    quizCounter.textContent = `Question ${quizState.index + 1} of ${total}`;
    quizFlag.textContent = quizState.flagged.has(question.id) ? 'Unflag' : 'Flag for review';
    quizFlag.setAttribute('aria-pressed', String(quizState.flagged.has(question.id)));
  }

  function handleQuizSubmit() {
    if (!quizState) return;
    if (!quizState.showingFeedback) {
      const selected = quizChoices.querySelector('input[name="quizChoice"]:checked');
      if (!selected) {
        quizFeedback.textContent = 'Select an answer or use number keys (1–9) before submitting.';
        quizFeedback.className = 'feedback error';
        return;
      }
      gradeCurrentQuestion(selected.value);
    } else {
      quizState.index += 1;
      renderQuizQuestion();
    }
  }

  function gradeCurrentQuestion(selectedKey) {
    const question = quizState.questions[quizState.index];
    const correctOption = question.options.find(opt => opt.correct);
    const isCorrect = selectedKey === correctOption.key;
    quizChoices.querySelectorAll('.choice').forEach(choice => {
      const input = choice.querySelector('input');
      input.disabled = true;
      if (input.value === correctOption.key) {
        choice.classList.add('correct');
      }
      if (selectedKey && input.value === selectedKey && !isCorrect) {
        choice.classList.add('incorrect');
      }
    });
    quizFeedback.textContent = `${isCorrect ? '✅ Correct' : '❌ Keep reviewing'} — ${question.rationale}`;
    quizFeedback.className = isCorrect ? 'feedback success' : 'feedback error';
    quizSubmit.textContent = quizState.index === quizState.questions.length - 1 ? 'Finish' : 'Next';
    quizState.showingFeedback = true;
    quizState.responses.push({ id: question.id, correct: isCorrect, selected: selectedKey });
    recordAttempt(question.id, isCorrect, 'quiz');
    if (!isCorrect) {
      enqueueForReview(question.id, true);
    }
  }

  function handleTimeExpired() {
    if (!quizState) return;
    const question = quizState.questions[quizState.index];
    quizFeedback.textContent = '⏱️ Time expired — remaining questions marked for review.';
    quizFeedback.className = 'feedback error';
    quizState.responses.push({ id: question.id, correct: false, selected: null, timedOut: true });
    recordAttempt(question.id, false, 'quiz_time');
    enqueueForReview(question.id, true);
    endQuiz(true);
  }

  function endQuiz(timedOut) {
    if (!quizState) return;
    if (quizState.timerId) {
      clearInterval(quizState.timerId);
    }
    const total = quizState.questions.length;
    if (quizState.responses.length < total) {
      for (let i = quizState.responses.length; i < total; i += 1) {
        const question = quizState.questions[i];
        quizState.responses.push({ id: question.id, correct: false, selected: null, skipped: true });
        enqueueForReview(question.id, true);
        recordAttempt(question.id, false, 'quiz_skipped');
      }
    }
    const correctCount = quizState.responses.filter(r => r.correct).length;
    const elapsedSeconds = Math.round((Date.now() - quizState.startTime) / 1000);
    const summaryParts = [`Score: ${correctCount} / ${total}`];
    if (quizState.timed) {
      summaryParts.push(`Time: ${formatTime(Math.min(elapsedSeconds, quizState.remainingSeconds + elapsedSeconds))}`);
    } else {
      summaryParts.push(`Time: ${formatTime(elapsedSeconds)}`);
    }
    if (timedOut) summaryParts.push('Quiz ended when the timer expired.');
    quizSummary.textContent = summaryParts.join(' • ');
    const breakdown = new Map();
    quizState.responses.forEach((response, index) => {
      const question = quizState.questions[index];
      if (!breakdown.has(question.lesionGroup)) {
        breakdown.set(question.lesionGroup, {
          correct: 0,
          total: 0,
          lesionKey: question.lesionKey
        });
      }
      const entry = breakdown.get(question.lesionGroup);
      entry.total += 1;
      if (response.correct) entry.correct += 1;
    });
    resultTableBody.innerHTML = '';
    breakdown.forEach((entry, lesion) => {
      const row = document.createElement('tr');
      const lesionCell = document.createElement('td');
      lesionCell.textContent = lesion;
      const scoreCell = document.createElement('td');
      scoreCell.textContent = `${entry.correct}/${entry.total}`;
      const actionCell = document.createElement('td');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'secondary';
      button.dataset.lesion = entry.lesionKey;
      button.textContent = 'Study this lesion';
      actionCell.appendChild(button);
      row.appendChild(lesionCell);
      row.appendChild(scoreCell);
      row.appendChild(actionCell);
      resultTableBody.appendChild(row);
    });
    quizRemediation.innerHTML = '';
    const reviewButton = document.createElement('button');
    reviewButton.type = 'button';
    reviewButton.className = 'secondary';
    reviewButton.textContent = 'Open review queue';
    reviewButton.addEventListener('click', () => {
      switchPanel('review');
      loadReviewStatus();
      loadNextReview();
    });
    quizRemediation.appendChild(reviewButton);
    quizProgress.style.width = '100%';
    quizTake.hidden = true;
    quizResults.hidden = false;
    quizConfig.hidden = false;
    quizState = null;
  }

  function updateTimerDisplay() {
    if (!quizState) return;
    quizTimerDisplay.textContent = formatTime(quizState.remainingSeconds);
  }

  function showQuizConfig() {
    if (quizState && quizState.timerId) clearInterval(quizState.timerId);
    quizState = null;
    quizTake.hidden = true;
    quizResults.hidden = false;
    quizConfig.hidden = false;
  }

  function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  function shuffleArray(array) {
    const copy = array.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  document.addEventListener('keydown', event => {
    if (!quizState || quizTake.hidden) return;
    if (event.key >= '1' && event.key <= '9') {
      const index = parseInt(event.key, 10) - 1;
      const choice = quizChoices.querySelectorAll('input[name="quizChoice"]')[index];
      if (choice) {
        choice.checked = true;
      }
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      handleQuizSubmit();
    }
  });
  const reviewStatus = document.getElementById('reviewStatus');
  const reviewContent = document.getElementById('reviewContent');
  const reviewPrompt = document.getElementById('reviewPrompt');
  const reviewChoices = document.getElementById('reviewChoices');
  const reviewShow = document.getElementById('reviewShow');
  const reviewRationale = document.getElementById('reviewRationale');
  const reviewMeta = document.getElementById('reviewMeta');
  const reviewButtons = document.querySelectorAll('.review-controls button');

  const reviewState = {
    currentId: null
  };

  reviewButtons.forEach(button => {
    button.addEventListener('click', () => {
      const quality = parseInt(button.dataset.quality, 10);
      if (reviewState.currentId) {
        updateReviewItem(reviewState.currentId, quality);
        loadReviewStatus();
        loadNextReview();
      }
    });
  });

  reviewShow.addEventListener('click', () => {
    if (!reviewState.currentId) return;
    const question = getQuestionById(reviewState.currentId);
    if (!question) return;
    reviewRationale.textContent = question.rationale;
    reviewRationale.className = 'feedback success';
  });

  function loadReviewStatus() {
    const items = Object.values(reviewData.items);
    const due = items.filter(item => item.due <= Date.now()).length;
    const total = items.length;
    reviewStatus.innerHTML = '';
    const duePill = document.createElement('span');
    duePill.className = 'pill';
    duePill.textContent = `Due now: ${due}`;
    const totalPill = document.createElement('span');
    totalPill.className = 'pill';
    totalPill.textContent = `Scheduled: ${total}`;
    reviewStatus.appendChild(duePill);
    reviewStatus.appendChild(totalPill);
  }

  function loadNextReview() {
    const entries = Object.entries(reviewData.items)
      .sort((a, b) => a[1].due - b[1].due);
    const now = Date.now();
    let nextEntry = entries.find(([, data]) => data.due <= now);
    if (!nextEntry && entries.length) {
      nextEntry = entries[0];
    }
    if (!nextEntry) {
      reviewContent.hidden = true;
      reviewRationale.textContent = '';
      return false;
    }
    const [questionId] = nextEntry;
    const question = getQuestionById(questionId);
    if (!question) {
      delete reviewData.items[questionId];
      saveReview();
      return loadNextReview();
    }
    reviewState.currentId = questionId;
    renderMeta(reviewMeta, question);
    reviewPrompt.textContent = question.prompt;
    reviewChoices.innerHTML = '';
    question.options.forEach(option => {
      const div = document.createElement('div');
      div.className = 'choice';
      div.innerHTML = `<strong>${option.key}.</strong> ${option.text}`;
      reviewChoices.appendChild(div);
    });
    reviewRationale.textContent = '';
    reviewRationale.className = 'feedback';
    reviewContent.hidden = false;
    return true;
  }

  function updateReviewItem(questionId, quality) {
    const now = Date.now();
    const item = reviewData.items[questionId] || { interval: 0, repetition: 0, ease: 2.5 };
    const q = getQuestionById(questionId);
    if (!q) {
      delete reviewData.items[questionId];
      return;
    }
    item.lastQuality = quality;
    if (quality < 3) {
      item.repetition = 0;
      item.interval = 1;
    } else {
      item.repetition += 1;
      if (item.repetition === 1) item.interval = 1;
      else if (item.repetition === 2) item.interval = 6;
      else item.interval = Math.round(item.interval * item.ease);
      item.ease = Math.max(1.3, item.ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    }
    item.lastReviewed = now;
    item.due = now + item.interval * 24 * 60 * 60 * 1000;
    reviewData.items[questionId] = item;
    saveReview();
  }
  const DAY = 24 * 60 * 60 * 1000;

  function recordAttempt(questionId, correct, context) {
    const now = Date.now();
    if (!progress.questions[questionId]) {
      progress.questions[questionId] = { attempts: 0, correct: 0, lastResult: null, lastSeen: null, contexts: [] };
    }
    const stats = progress.questions[questionId];
    stats.attempts += 1;
    if (correct) stats.correct += 1;
    stats.lastResult = correct ? 'correct' : 'incorrect';
    stats.lastSeen = now;
    stats.contexts = stats.contexts || [];
    stats.contexts.push({ context, correct, timestamp: now });
    if (stats.contexts.length > 10) stats.contexts.shift();
    progress.quizHistory = progress.quizHistory || [];
    progress.quizHistory.push({ questionId, correct, context, timestamp: now });
    if (progress.quizHistory.length > 200) progress.quizHistory.shift();
    saveProgress();
  }

  function enqueueForReview(questionId, urgent) {
    const now = Date.now();
    if (!reviewData.items[questionId]) {
      reviewData.items[questionId] = { interval: 0, repetition: 0, ease: 2.5, due: now, lastQueued: now };
    } else if (urgent) {
      reviewData.items[questionId].due = now;
      reviewData.items[questionId].lastQueued = now;
    }
    saveReview();
  }
  adminApi = initAdmin({
    CATEGORY_OPTIONS,
    difficultyMap: DIFFICULTY_STRING_TO_LEVEL,
    getBank: () => bank,
    getCoreBank: () => CORE_BANK,
    getOverrides: () => overrides,
    setOverrides: next => { overrides = next; },
    saveOverrides,
    getProgress: () => progress,
    setProgress: next => { progress = next; },
    saveProgress,
    getReview: () => reviewData,
    setReview: next => { reviewData = next; },
    saveReview,
    rebuildBankAndUI,
    normalizeQuestion,
    fromSchemaQuestion,
    toSchemaQuestion,
    slugifyLesion,
    validator
  });

  applyStudyFilters();
  loadReviewStatus();
  loadNextReview();
    

}

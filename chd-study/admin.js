export function initAdmin(context) {
  const {
    CATEGORY_OPTIONS,
    difficultyMap,
    getBank,
    getCoreBank,
    getOverrides,
    setOverrides,
    saveOverrides,
    getProgress,
    setProgress,
    saveProgress,
    getReview,
    setReview,
    saveReview,
    rebuildBankAndUI,
    normalizeQuestion,
    fromSchemaQuestion,
    toSchemaQuestion,
    slugifyLesion,
    validator
  } = context;

  const adminSelect = document.getElementById('adminSelect');
  if (!adminSelect) {
    return { onBankUpdated: () => {} };
  }

  const adminForm = document.getElementById('adminForm');
  const adminId = document.getElementById('adminId');
  const adminLesion = document.getElementById('adminLesion');
  const adminKey = document.getElementById('adminKey');
  const adminClass = document.getElementById('adminClass');
  const adminCategory = document.getElementById('adminCategory');
  const adminDifficulty = document.getElementById('adminDifficulty');
  const adminTags = document.getElementById('adminTags');
  const adminPrompt = document.getElementById('adminPrompt');
  const adminOptions = document.getElementById('adminOptions');
  const adminRationale = document.getElementById('adminRationale');
  const adminRemediation = document.getElementById('adminRemediation');
  const loadQuestionBtn = document.getElementById('loadQuestion');
  const deleteOverrideBtn = document.getElementById('deleteOverride');
  const bulkArea = document.getElementById('bulkArea');
  const bulkImportBtn = document.getElementById('bulkImport');
  const downloadTemplateBtn = document.getElementById('downloadTemplate');
  const localCount = document.getElementById('localCount');
  const quizFeedback = document.getElementById('quizFeedback');

  const importArea = document.getElementById('importArea');
  const importJsonBtn = document.getElementById('importJson');
  const exportJsonBtn = document.getElementById('exportJson');
  const copyExportBtn = document.getElementById('copyExport');
  const clearDataBtn = document.getElementById('clearData');
  const importSummary = document.getElementById('importSummary');

  populateAdminCategory();
  updateAdminList();
  updateLocalCount();

  loadQuestionBtn?.addEventListener('click', () => {
    const selected = adminSelect.value;
    if (!selected) return;
    const overrides = getOverrides();
    const question = overrides[selected] || getBank().find(q => q.id === selected);
    if (!question) return;
    adminId.value = question.id;
    adminLesion.value = question.lesionGroup;
    adminKey.value = question.lesionKey || slugifyLesion(question.lesionGroup);
    adminClass.value = question.classification;
    adminCategory.value = question.category;
    adminDifficulty.value = question.difficulty;
    adminTags.value = (question.tags || []).join(', ');
    adminPrompt.value = question.prompt;
    adminOptions.value = JSON.stringify(question.options, null, 2);
    adminRationale.value = question.rationale;
    adminRemediation.value = question.remediation || '';
  });

  adminForm?.addEventListener('submit', event => {
    event.preventDefault();
    try {
      const parsedOptions = JSON.parse(adminOptions.value);
      if (!Array.isArray(parsedOptions)) {
        throw new Error('Options must be an array.');
      }
      const customQuestion = normalizeQuestion({
        id: adminId.value.trim(),
        lesionGroup: adminLesion.value.trim(),
        lesionKey: adminKey.value.trim() || slugifyLesion(adminLesion.value.trim()),
        classification: adminClass.value,
        category: adminCategory.value,
        difficulty: adminDifficulty.value,
        difficultyLevel: difficultyMap[adminDifficulty.value] || 2,
        tags: adminTags.value.split(',').map(t => t.trim()).filter(Boolean),
        prompt: adminPrompt.value.trim(),
        options: parsedOptions,
        rationale: adminRationale.value.trim(),
        remediation: adminRemediation.value.trim(),
        type: 'mcq',
        version: 'v1',
        references: []
      });
      const overrides = { ...getOverrides(), [customQuestion.id]: customQuestion };
      setOverrides(overrides);
      saveOverrides();
      rebuildBankAndUI();
      updateAdminList();
      updateLocalCount();
      if (quizFeedback) {
        quizFeedback.textContent = 'Question saved locally.';
        quizFeedback.className = 'feedback success';
      }
    } catch (error) {
      alert(error.message || 'Unable to save question. Check that the options JSON is valid.');
      console.error(error);
    }
  });

  deleteOverrideBtn?.addEventListener('click', () => {
    const id = adminId.value.trim();
    if (!id) return;
    const overrides = { ...getOverrides() };
    if (overrides[id]) {
      delete overrides[id];
      setOverrides(overrides);
      saveOverrides();
      rebuildBankAndUI();
      updateAdminList();
      updateLocalCount();
    }
  });

  bulkImportBtn?.addEventListener('click', () => {
    const raw = bulkArea.value.trim();
    if (!raw) {
      alert('Paste question JSON before importing.');
      return;
    }
    try {
      const result = processImport(raw, { includeState: false, mergeWithExisting: true });
      setOverrides(result.overrides);
      saveOverrides();
      rebuildBankAndUI();
      updateAdminList();
      updateLocalCount();
      bulkArea.value = '';
      alert(`${result.validCount} items processed • ${result.invalidItems.length} invalid`);
    } catch (error) {
      console.error(error);
      alert(error.message || 'Import failed. Ensure the JSON matches the schema.');
    }
  });

  downloadTemplateBtn?.addEventListener('click', async () => {
    const template = {
      id: 'NEW_ID',
      topic: 'acyanotic',
      lesion: 'Descriptive lesion name',
      category: 'pathophysiology',
      type: 'mcq',
      stem: 'Question stem goes here',
      options: ['Correct answer', 'Distractor'],
      answerIndex: 0,
      explanation: 'Brief explanation.',
      tags: ['example tag'],
      difficulty: 2,
      objective: 'Optional targeted follow-up.',
      references: [],
      version: 'v1'
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(template, null, 2));
      alert('Template copied to clipboard.');
    } catch (error) {
      alert('Copy failed. Manually copy the template from the admin panel.');
    }
  });

  exportJsonBtn?.addEventListener('click', () => {
    const payload = buildExportPayload();
    downloadJson(payload, 'questions.v1.json');
  });

  copyExportBtn?.addEventListener('click', async () => {
    const payload = buildExportPayload();
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      alert('Export copied to clipboard.');
    } catch (error) {
      alert('Copy failed. You may need to allow clipboard permissions.');
    }
  });

  importJsonBtn?.addEventListener('click', () => {
    const raw = importArea.value.trim();
    if (!raw) {
      alert('Paste JSON before importing.');
      return;
    }
    try {
      const result = processImport(raw, { includeState: true, mergeWithExisting: false });
      setOverrides(result.overrides);
      setProgress(result.progress);
      setReview(result.review);
      saveOverrides();
      saveProgress();
      saveReview();
      rebuildBankAndUI();
      updateAdminList();
      updateLocalCount();
      renderImportSummary(result, importSummary);
      importArea.value = '';
    } catch (error) {
      console.error(error);
      alert(error.message || 'Import failed. Verify that the JSON matches the schema.');
      if (importSummary) {
        importSummary.textContent = 'Import failed. See console for details.';
        importSummary.classList.add('error');
      }
    }
  });

  clearDataBtn?.addEventListener('click', () => {
    if (!confirm('This will erase local progress and custom questions. Continue?')) return;
    setOverrides({});
    setProgress({ questions: {}, quizHistory: [] });
    setReview({ items: {} });
    saveOverrides();
    saveProgress();
    saveReview();
    rebuildBankAndUI();
    updateAdminList();
    updateLocalCount();
  });

  return {
    onBankUpdated: () => {
      updateAdminList();
      updateLocalCount();
    }
  };

  function populateAdminCategory() {
    if (!adminCategory) return;
    adminCategory.innerHTML = '';
    CATEGORY_OPTIONS.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.value;
      opt.textContent = cat.label;
      adminCategory.appendChild(opt);
    });
  }

  function updateAdminList() {
    const overrides = getOverrides();
    const options = getBank().slice().sort((a, b) => a.id.localeCompare(b.id));
    adminSelect.innerHTML = '';
    options.forEach(question => {
      const option = document.createElement('option');
      const isOverride = Boolean(overrides[question.id]);
      option.value = question.id;
      option.textContent = `${question.id} — ${question.lesionGroup}${isOverride ? ' • custom' : ''}`;
      adminSelect.appendChild(option);
    });
  }

  function updateLocalCount() {
    if (!localCount) return;
    const overrides = getOverrides();
    const coreBank = getCoreBank();
    const totalOverrides = Object.keys(overrides).length;
    const extraQuestions = Object.values(overrides).filter(q => !coreBank.some(base => base.id === q.id)).length;
    localCount.textContent = `${totalOverrides} overrides saved (${extraQuestions} new questions beyond the core ${coreBank.length}).`;
  }

  function buildExportPayload() {
    return {
      exportedAt: new Date().toISOString(),
      format: 'chd-qbank',
      version: 'v1',
      coreSize: getCoreBank().length,
      questions: getBank().map(question => toSchemaQuestion(question)),
      progress: getProgress(),
      review: getReview()
    };
  }

  function downloadJson(payload, filename) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function processImport(raw, options = {}) {
    const { includeState = true, mergeWithExisting = false } = options;
    const data = JSON.parse(raw);
    const questionArray = Array.isArray(data) ? data : data && Array.isArray(data.questions) ? data.questions : null;
    if (!questionArray) {
      throw new Error('Expected an array of questions or an object with a "questions" array.');
    }

    const invalidItems = [];
    const normalizedQuestions = [];
    questionArray.forEach((item, index) => {
      const result = validateSchemaQuestion(item, index);
      if (!result.valid) {
        invalidItems.push({ id: result.id, errors: result.errors });
      } else if (result.normalized) {
        normalizedQuestions.push(result.normalized);
      }
    });

    const baseOverrides = mergeWithExisting ? { ...getOverrides() } : {};
    let appliedCount = 0;
    const coreBank = getCoreBank();
    normalizedQuestions.forEach(question => {
      const base = coreBank.find(entry => entry.id === question.id) || null;
      if (!base || !questionsEqual(base, question)) {
        const current = baseOverrides[question.id];
        if (!current || !questionsEqual(current, question)) {
          baseOverrides[question.id] = question;
          appliedCount += 1;
        }
      } else if (mergeWithExisting && baseOverrides[question.id]) {
        delete baseOverrides[question.id];
      }
    });

    const nextProgress = includeState && !Array.isArray(data) && data && data.progress
      ? sanitizeProgress(data.progress)
      : getProgress();
    const nextReview = includeState && !Array.isArray(data) && data && data.review
      ? sanitizeReview(data.review)
      : getReview();

    return {
      overrides: baseOverrides,
      progress: nextProgress,
      review: nextReview,
      validCount: normalizedQuestions.length,
      appliedCount,
      invalidItems
    };
  }

  function validateSchemaQuestion(item, index) {
    const isValid = validator(item);
    if (!isValid) {
      const errors = (validator.errors || []).map(err => ({
        message: err.message || 'Invalid value',
        instancePath: err.instancePath,
        schemaPath: err.schemaPath
      }));
      return {
        valid: false,
        normalized: null,
        errors,
        id: item && typeof item === 'object' && item.id ? item.id : `item-${index + 1}`
      };
    }
    const normalized = normalizeQuestion(fromSchemaQuestion(item));
    normalized.difficultyLevel = item.difficulty ?? normalized.difficultyLevel;
    return { valid: true, normalized, errors: [], id: normalized.id };
  }

  function sanitizeProgress(data) {
    if (!data || typeof data !== 'object') {
      return { questions: {}, quizHistory: [] };
    }
    return {
      questions: data.questions && typeof data.questions === 'object' ? data.questions : {},
      quizHistory: Array.isArray(data.quizHistory) ? data.quizHistory : []
    };
  }

  function sanitizeReview(data) {
    if (!data || typeof data !== 'object') {
      return { items: {} };
    }
    return {
      items: data.items && typeof data.items === 'object' ? data.items : {}
    };
  }

  function renderImportSummary(result, container) {
    if (!container) return;
    container.classList.remove('error');
    container.innerHTML = '';
    const summaryText = `${result.validCount} items loaded (${result.appliedCount} overrides applied) • ${result.invalidItems.length} invalid (blocked)`;
    const summarySpan = document.createElement('span');
    summarySpan.textContent = summaryText;
    container.appendChild(summarySpan);
    if (result.invalidItems.length) {
      const list = document.createElement('ul');
      result.invalidItems.forEach(item => {
        const li = document.createElement('li');
        const messages = item.errors.map(err => err.message).join('; ');
        li.textContent = `${item.id}: ${messages}`;
        list.appendChild(li);
      });
      container.appendChild(list);
    }
  }

  function questionsEqual(a, b) {
    return JSON.stringify(toSchemaQuestion(a)) === JSON.stringify(toSchemaQuestion(b));
  }
}

const copyButtons = document.querySelectorAll(".copy-btn");
const liveRegion = document.getElementById("live-region");

copyButtons.forEach((button) => {
  const defaultLabel = button.textContent;

  button.addEventListener("click", async () => {
    const targetId = button.dataset.copyTarget;
    if (!targetId) return;

    const textBlock = document.getElementById(targetId);
    if (!textBlock) return;

    const textToCopy = textBlock.textContent;
    const showFeedback = (message, stateClass) => {
      button.classList.add(stateClass);
      button.textContent = message;
      if (liveRegion) {
        liveRegion.textContent = message;
      }
      setTimeout(() => {
        button.classList.remove(stateClass);
        button.textContent = defaultLabel;
      }, 2000);
    };

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        throw new Error("Clipboard API unavailable");
      }
      showFeedback("Copied!", "copied");
    } catch (error) {
      const textarea = document.createElement("textarea");
      textarea.value = textToCopy;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (success) {
        showFeedback("Copied!", "copied");
      } else {
        showFeedback("Copy failed", "copy-error");
      }
    }
  });
});

const navLinks = document.querySelectorAll('.page-nav a[href^="#"]');
navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const hash = link.getAttribute("href");
    const target = document.querySelector(hash);
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

const detailControls = document.querySelectorAll(".toolbar-btn");
const accordionSections = document.querySelectorAll("details.accordion");

detailControls.forEach((control) => {
  control.addEventListener("click", () => {
    const action = control.dataset.action;
    if (!action) return;
    const shouldOpen = action === "expand";
    accordionSections.forEach((section) => {
      section.open = shouldOpen;
    });
  });
});

const panels = Array.from(document.querySelectorAll("main .panel"));
const searchInput = document.getElementById("section-search");
const searchFeedback = document.getElementById("search-feedback");
const defaultSearchMessage = "Press / to focus search, or filter by topic keywords.";
let latestFirstMatch = null;

const resetSearchState = () => {
  panels.forEach((panel) => {
    panel.classList.remove("is-hidden", "search-match", "flash-match");
  });
  if (searchFeedback) {
    searchFeedback.textContent = defaultSearchMessage;
  }
};

const updateSearch = (rawQuery) => {
  if (!searchInput) return;
  const query = rawQuery.trim().toLowerCase();
  latestFirstMatch = null;

  if (!query) {
    resetSearchState();
    return;
  }

  let matchCount = 0;
  panels.forEach((panel) => {
    const heading = panel.querySelector("h2");
    const searchable = `${heading ? heading.textContent : ""} ${panel.textContent}`.toLowerCase();
    if (searchable.includes(query)) {
      panel.classList.remove("is-hidden");
      panel.classList.add("search-match");
      if (!latestFirstMatch) {
        latestFirstMatch = panel;
      }
      matchCount += 1;
    } else {
      panel.classList.remove("search-match", "flash-match");
      panel.classList.add("is-hidden");
    }
  });

  if (searchFeedback) {
    if (matchCount === 0) {
      searchFeedback.textContent = `No matches for "${rawQuery}".`;
    } else if (matchCount === 1) {
      searchFeedback.textContent = `1 section matches "${rawQuery}".`;
    } else {
      searchFeedback.textContent = `${matchCount} sections match "${rawQuery}".`;
    }
  }

  if (latestFirstMatch) {
    latestFirstMatch.classList.add("flash-match");
    setTimeout(() => {
      latestFirstMatch && latestFirstMatch.classList.remove("flash-match");
    }, 1200);
  }
};

if (searchInput) {
  resetSearchState();
  searchInput.addEventListener("input", (event) => {
    updateSearch(event.target.value);
  });

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      searchInput.value = "";
      resetSearchState();
      searchInput.blur();
    }
    if (event.key === "Enter" && latestFirstMatch) {
      latestFirstMatch.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey && searchInput) {
    event.preventDefault();
    searchInput.focus();
  }
});

const navLinkMap = new Map();
navLinks.forEach((link) => {
  const hash = link.getAttribute("href");
  if (hash && hash.startsWith("#")) {
    navLinkMap.set(hash.slice(1), link);
  }
});

let activePanelId = null;
if (panels.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const { id } = entry.target;
          if (!id || activePanelId === id) return;
          activePanelId = id;
          navLinks.forEach((link) => {
            const linkTarget = link.getAttribute("href");
            const isActive = linkTarget === `#${id}`;
            link.classList.toggle("active", isActive);
          });
        }
      });
    },
    {
      threshold: 0.35,
      rootMargin: "-20% 0px -55% 0px",
    },
  );

  panels.forEach((panel) => observer.observe(panel));
}

const themeStorageKey = "pcqbank-theme";
const modeToggle = document.getElementById("mode-toggle");
const prefersDark = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
let manualThemeChoice = false;

const applyTheme = (theme) => {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark-mode", isDark);
  if (modeToggle) {
    modeToggle.setAttribute("aria-pressed", String(isDark));
    modeToggle.textContent = isDark ? "☀️ Light mode" : "🌙 Dark mode";
  }
  if (liveRegion) {
    liveRegion.textContent = `Switched to ${isDark ? "dark" : "light"} mode.`;
  }
};

const storedTheme = localStorage.getItem(themeStorageKey);
if (storedTheme) {
  manualThemeChoice = true;
  applyTheme(storedTheme);
} else if (prefersDark && prefersDark.matches) {
  applyTheme("dark");
} else {
  applyTheme("light");
}

if (modeToggle) {
  modeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark-mode");
    const newTheme = isDark ? "dark" : "light";
    modeToggle.setAttribute("aria-pressed", String(isDark));
    modeToggle.textContent = isDark ? "☀️ Light mode" : "🌙 Dark mode";
    localStorage.setItem(themeStorageKey, newTheme);
    manualThemeChoice = true;
    if (liveRegion) {
      liveRegion.textContent = `Switched to ${newTheme} mode.`;
    }
  });
}

if (prefersDark) {
  const handlePreferenceChange = (event) => {
    if (manualThemeChoice) return;
    applyTheme(event.matches ? "dark" : "light");
  };

  if (typeof prefersDark.addEventListener === "function") {
    prefersDark.addEventListener("change", handlePreferenceChange);
  } else if (typeof prefersDark.addListener === "function") {
    prefersDark.addListener(handlePreferenceChange);
  }
}

const trackerCheckboxes = document.querySelectorAll('[data-progress-step]');
const progressBar = document.querySelector(".progress-bar");
const progressFill = document.querySelector(".progress-bar-fill");
const progressLabel = document.getElementById("progress-label");
const trackerReset = document.querySelector(".tracker-reset");
const progressStorageKey = "pcqbank-workflow-tracker";

const readProgress = () => {
  try {
    const stored = localStorage.getItem(progressStorageKey);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
};

const writeProgress = (steps) => {
  try {
    localStorage.setItem(progressStorageKey, JSON.stringify(steps));
  } catch (error) {
    // ignore storage errors (e.g., private browsing)
  }
};

const updateProgress = () => {
  if (!trackerCheckboxes.length) return;
  const total = trackerCheckboxes.length;
  let completed = 0;
  const completedSteps = [];

  trackerCheckboxes.forEach((checkbox) => {
    const isChecked = checkbox.checked;
    const stepId = checkbox.dataset.progressStep;
    const label = checkbox.closest("label");
    if (isChecked) {
      completed += 1;
      if (stepId) completedSteps.push(stepId);
    }
    if (label) {
      label.classList.toggle("is-complete", isChecked);
    }
  });

  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  if (progressFill) {
    progressFill.style.width = `${percentage}%`;
  }
  if (progressBar) {
    progressBar.setAttribute("aria-valuenow", String(percentage));
  }
  if (progressLabel) {
    progressLabel.textContent = `${completed} of ${total} steps complete (${percentage}%)`;
  }

  writeProgress(completedSteps);
  if (liveRegion) {
    liveRegion.textContent = `Workflow tracker updated: ${completed} of ${total} steps complete.`;
  }
};

if (trackerCheckboxes.length) {
  const savedSteps = readProgress();
  trackerCheckboxes.forEach((checkbox) => {
    if (savedSteps.includes(checkbox.dataset.progressStep)) {
      checkbox.checked = true;
    }
    checkbox.addEventListener("change", () => {
      updateProgress();
    });
  });
  updateProgress();
}

if (trackerReset) {
  trackerReset.addEventListener("click", () => {
    trackerCheckboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });
    updateProgress();
  });
}

const backToTopButton = document.querySelector(".back-to-top");
if (backToTopButton) {
  const toggleBackToTop = () => {
    if (window.scrollY > 320) {
      backToTopButton.classList.add("visible");
    } else {
      backToTopButton.classList.remove("visible");
    }
  };

  window.addEventListener("scroll", toggleBackToTop, { passive: true });
  toggleBackToTop();

  backToTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

const jsonDbSection = document.getElementById("json-database");
if (jsonDbSection) {
  const jsonElements = {
    form: jsonDbSection.querySelector(".json-db-form"),
    title: document.getElementById("json-entry-title"),
    notes: document.getElementById("json-entry-notes"),
    payload: document.getElementById("json-entry-payload"),
    feedback: document.getElementById("json-db-feedback"),
    entryList: document.getElementById("json-entry-list"),
    deleteButton: jsonDbSection.querySelector('[data-json-action="delete"]'),
    exportButton: jsonDbSection.querySelector('[data-json-action="export"]'),
    refreshButton: jsonDbSection.querySelector('[data-json-action="refresh"]'),
    sampleButton: jsonDbSection.querySelector('[data-json-action="sample"]'),
    saveButton: jsonDbSection.querySelector('[data-json-action="save"]'),
    clearButton: jsonDbSection.querySelector('[data-json-action="clear"]'),
    preview: document.getElementById("json-preview"),
    previewTitle: document.getElementById("json-preview-title"),
  };

  const actionButtons = jsonDbSection.querySelectorAll("[data-json-action]");
  const hasIndexedDb = typeof window.indexedDB !== "undefined";
  const dbName = "pcqbank-json-library";
  const dbVersion = 1;
  const storeName = "entries";
  let dbPromise = null;
  let cachedEntries = [];
  let selectedEntryId = null;

  const sampleJson = `[
  {
    "qid": "PEDCARD-12345",
    "topic": "Congenital Heart Disease (CHD)",
    "subtopic": "Tetralogy of Fallot",
    "difficulty": "Intermediate",
    "question_type": "Single Best Answer",
    "learning_objective": "Recognize acute management for tet spells",
    "cognitive_level": "Application"
  }
]`;

  const setFeedback = (message, state) => {
    if (!jsonElements.feedback) return;
    jsonElements.feedback.textContent = message;
    jsonElements.feedback.classList.remove("is-success", "is-error");
    if (state === "success") {
      jsonElements.feedback.classList.add("is-success");
    } else if (state === "error") {
      jsonElements.feedback.classList.add("is-error");
    }
  };

  const disableActions = () => {
    actionButtons.forEach((button) => {
      button.disabled = true;
    });
  };

  const formatTimestamp = (ms) => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(ms));
    } catch (error) {
      return new Date(ms).toLocaleString();
    }
  };

  const prettyPrintJson = (raw) => {
    try {
      const parsed = JSON.parse(raw);
      return JSON.stringify(parsed, null, 2);
    } catch (error) {
      return raw;
    }
  };

  const openDb = () => {
    if (!hasIndexedDb) {
      return Promise.reject(new Error("IndexedDB not supported"));
    }
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, dbVersion);
      request.onerror = () => {
        reject(new Error("Unable to open database"));
      };
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(storeName)) {
          const store = db.createObjectStore(storeName, {
            keyPath: "id",
            autoIncrement: true,
          });
          store.createIndex("createdAt", "createdAt", { unique: false });
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => {
          db.close();
        };
        resolve(db);
      };
    });
    return dbPromise;
  };

  const runTransaction = (mode, callback) =>
    openDb().then(
      (db) =>
        new Promise((resolve, reject) => {
          const transaction = db.transaction(storeName, mode);
          const store = transaction.objectStore(storeName);
          const request = callback(store);
          transaction.oncomplete = () => resolve(request?.result);
          transaction.onerror = () => reject(transaction.error || new Error("Transaction failed"));
        }),
    );

  const addEntry = (entry) =>
    runTransaction("readwrite", (store) => store.add(entry));

  const getAllEntries = () =>
    runTransaction("readonly", (store) => store.getAll()).then((entries) => {
      if (!Array.isArray(entries)) return [];
      return entries.sort((a, b) => b.createdAt - a.createdAt);
    });

  const deleteEntry = (id) =>
    runTransaction("readwrite", (store) => store.delete(id));

  const resetSelection = () => {
    selectedEntryId = null;
    if (jsonElements.deleteButton) {
      jsonElements.deleteButton.disabled = true;
    }
    if (jsonElements.preview) {
      jsonElements.preview.textContent = "Select a saved batch to view its JSON.";
    }
    if (jsonElements.previewTitle) {
      jsonElements.previewTitle.textContent = "Preview";
    }
  };

  const renderEntries = (entries) => {
    cachedEntries = entries;
    if (!jsonElements.entryList) return;
    jsonElements.entryList.innerHTML = "";
    if (!entries.length) {
      const emptyMessage = document.createElement("li");
      emptyMessage.className = "json-entry-empty";
      emptyMessage.textContent = "No saved batches yet. Save a JSON payload to see it here.";
      jsonElements.entryList.appendChild(emptyMessage);
      resetSelection();
      return;
    }

    entries.forEach((entry) => {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.entryId = String(entry.id);
      button.innerHTML = `<span>${entry.title || "Untitled batch"}</span><span class="json-entry-meta">Saved ${formatTimestamp(
        entry.createdAt,
      )}${entry.notes ? ` · ${entry.notes}` : ""}</span>`;
      if (String(entry.id) === String(selectedEntryId)) {
        button.classList.add("is-selected");
      }
      item.appendChild(button);
      jsonElements.entryList.appendChild(item);
    });
  };

  const selectEntry = (id) => {
    if (!cachedEntries.length) return;
    const entry = cachedEntries.find((item) => String(item.id) === String(id));
    if (!entry) return;
    selectedEntryId = entry.id;
    if (jsonElements.preview) {
      jsonElements.preview.textContent = prettyPrintJson(entry.payload || "");
    }
    if (jsonElements.previewTitle) {
      jsonElements.previewTitle.textContent = entry.title || "Saved batch";
    }
    if (jsonElements.deleteButton) {
      jsonElements.deleteButton.disabled = false;
    }
    if (jsonElements.entryList) {
      jsonElements.entryList.querySelectorAll("button").forEach((button) => {
        const isMatch = button.dataset.entryId === String(entry.id);
        button.classList.toggle("is-selected", isMatch);
      });
    }
  };

  const refreshEntries = ({ silent = false } = {}) =>
    getAllEntries()
      .then((entries) => {
        renderEntries(entries);
        if (!silent) {
          setFeedback(`Loaded ${entries.length} saved ${entries.length === 1 ? "batch" : "batches"}.`, "success");
        }
      })
      .catch(() => {
        if (!silent) {
          setFeedback("Unable to load saved batches.", "error");
        }
      });

  if (!hasIndexedDb) {
    setFeedback("This browser doesn't support local storage for the JSON library.", "error");
    disableActions();
  } else {
    refreshEntries();
  }

  if (jsonElements.saveButton) {
    jsonElements.saveButton.addEventListener("click", () => {
      if (!hasIndexedDb) return;
      const rawPayload = jsonElements.payload ? jsonElements.payload.value.trim() : "";
      if (!rawPayload) {
        setFeedback("Paste a JSON payload before saving.", "error");
        return;
      }
      try {
        JSON.parse(rawPayload);
      } catch (error) {
        setFeedback("The JSON payload is invalid. Please fix any syntax errors.", "error");
        return;
      }

      const entry = {
        title: jsonElements.title?.value.trim() || `Saved batch (${new Date().toLocaleDateString()})`,
        notes: jsonElements.notes?.value.trim() || "",
        payload: prettyPrintJson(rawPayload),
        createdAt: Date.now(),
      };

      addEntry(entry)
        .then(() => {
          setFeedback("Batch saved to your local library.", "success");
          if (jsonElements.form) {
            jsonElements.form.reset();
          }
          refreshEntries({ silent: true });
        })
        .catch(() => {
          setFeedback("Unable to save this batch. Please try again.", "error");
        });
    });
  }

  if (jsonElements.clearButton) {
    jsonElements.clearButton.addEventListener("click", () => {
      if (jsonElements.form) {
        jsonElements.form.reset();
      }
      setFeedback("Form cleared.", "success");
    });
  }

  if (jsonElements.sampleButton) {
    jsonElements.sampleButton.addEventListener("click", () => {
      if (jsonElements.payload) {
        jsonElements.payload.value = sampleJson;
      }
      if (jsonElements.title && !jsonElements.title.value) {
        jsonElements.title.value = "Sample batch";
      }
      setFeedback("Sample JSON inserted. Adjust and save when ready.", "success");
    });
  }

  if (jsonElements.refreshButton) {
    jsonElements.refreshButton.addEventListener("click", () => {
      if (!hasIndexedDb) return;
      refreshEntries();
    });
  }

  if (jsonElements.entryList) {
    jsonElements.entryList.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const button = target.closest("button[data-entry-id]");
      if (!button) return;
      const { entryId } = button.dataset;
      if (entryId) {
        selectEntry(entryId);
        setFeedback("Loaded preview for the selected batch.", "success");
      }
    });
  }

  if (jsonElements.deleteButton) {
    jsonElements.deleteButton.addEventListener("click", () => {
      if (!hasIndexedDb || selectedEntryId === null) return;
      deleteEntry(Number(selectedEntryId))
        .then(() => {
          setFeedback("Batch deleted from your library.", "success");
          resetSelection();
          refreshEntries();
        })
        .catch(() => {
          setFeedback("Unable to delete this batch.", "error");
        });
    });
  }

  if (jsonElements.exportButton) {
    jsonElements.exportButton.addEventListener("click", () => {
      if (!hasIndexedDb) return;
      getAllEntries()
        .then((entries) => {
          if (!entries.length) {
            setFeedback("Nothing to export yet.", "error");
            return;
          }
          const exportPayload = entries.map((entry) => {
            let parsedPayload;
            try {
              parsedPayload = JSON.parse(entry.payload);
            } catch (error) {
              parsedPayload = entry.payload;
            }
            return {
              id: entry.id,
              title: entry.title,
              notes: entry.notes,
              createdAt: entry.createdAt,
              payload: parsedPayload,
            };
          });
          const exportBlob = new Blob([JSON.stringify(exportPayload, null, 2)], {
            type: "application/json",
          });
          const url = URL.createObjectURL(exportBlob);
          const anchor = document.createElement("a");
          anchor.href = url;
          const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");
          anchor.download = `pcqbank-json-library-${timestamp}.json`;
          document.body.appendChild(anchor);
          anchor.click();
          document.body.removeChild(anchor);
          URL.revokeObjectURL(url);
          setFeedback(`Exported ${entries.length} saved ${entries.length === 1 ? "batch" : "batches"}.`, "success");
        })
        .catch(() => {
          setFeedback("Export failed. Please try again.", "error");
        });
    });
  }
}

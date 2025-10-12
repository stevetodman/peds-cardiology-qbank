const smoothScrollTo = (element) => {
  if (!element) return;
  const prefersReducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  element.scrollIntoView({
    behavior: prefersReducedMotion ? "auto" : "smooth",
    block: "start",
  });
};

const announce = (liveRegion, message) => {
  if (liveRegion) {
    liveRegion.textContent = message;
  }
};

const initCopyButtons = (liveRegion) => {
  const copyButtons = document.querySelectorAll(".copy-btn");
  if (!copyButtons.length) return;

  copyButtons.forEach((button) => {
    const defaultLabel = button.textContent?.trim() || "Copy";

    button.addEventListener("click", async () => {
      const targetId = button.dataset.copyTarget;
      if (!targetId) return;
      const textBlock = document.getElementById(targetId);
      if (!textBlock) return;

      const textToCopy = textBlock.textContent || "";
      const showFeedback = (message, stateClass) => {
        button.classList.add(stateClass);
        button.textContent = message;
        announce(liveRegion, message);
        window.setTimeout(() => {
          button.classList.remove(stateClass);
          button.textContent = defaultLabel;
        }, 2000);
      };

      try {
        if (navigator.clipboard?.writeText) {
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
};

const initSmoothNavigation = (navLinks) => {
  if (!navLinks.length) return;

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const hash = link.getAttribute("href");
      if (!hash || !hash.startsWith("#")) return;
      const target = document.querySelector(hash);
      if (target) {
        event.preventDefault();
        smoothScrollTo(target);
      }
    });
  });
};

const initAccordionControls = () => {
  const detailControls = document.querySelectorAll(".toolbar-btn");
  const accordionSections = document.querySelectorAll("details.accordion");
  if (!detailControls.length || !accordionSections.length) return;

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
};

const initSectionSearch = ({
  panels,
  searchInput,
  searchFeedback,
  liveRegion,
}) => {
  if (!searchInput || !panels.length) return;

  const defaultMessage =
    "Press / to focus search, or filter by topic keywords.";
  let latestFirstMatch = null;

  const resetSearchState = () => {
    panels.forEach((panel) => {
      panel.classList.remove("is-hidden", "search-match", "flash-match");
    });
    if (searchFeedback) {
      searchFeedback.textContent = defaultMessage;
    }
    latestFirstMatch = null;
  };

  const updateSearch = (value) => {
    const query = value.trim().toLowerCase();
    latestFirstMatch = null;

    if (!query) {
      resetSearchState();
      return;
    }

    let matchCount = 0;
    panels.forEach((panel) => {
      const heading = panel.querySelector("h2");
      const searchable = `${heading ? heading.textContent : ""} ${
        panel.textContent || ""
      }`.toLowerCase();
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
        searchFeedback.textContent = `No matches for "${value}".`;
      } else if (matchCount === 1) {
        searchFeedback.textContent = `1 section matches "${value}".`;
      } else {
        searchFeedback.textContent = `${matchCount} sections match "${value}".`;
      }
    }

    if (latestFirstMatch) {
      latestFirstMatch.classList.add("flash-match");
      window.setTimeout(() => {
        latestFirstMatch?.classList.remove("flash-match");
      }, 1200);
    }
  };

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
      smoothScrollTo(latestFirstMatch);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (
      event.key === "/" &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey &&
      document.activeElement !== searchInput
    ) {
      event.preventDefault();
      searchInput.focus();
    }
  });
};

const initScrollSpy = ({ panels, navLinks }) => {
  if (!panels.length || !navLinks.length || !("IntersectionObserver" in window)) {
    return;
  }

  let activePanelId = null;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const { id } = entry.target;
        if (!id || activePanelId === id) return;
        activePanelId = id;
        navLinks.forEach((link) => {
          const isActive = link.getAttribute("href") === `#${id}`;
          link.classList.toggle("active", isActive);
        });
      });
    },
    { threshold: 0.35, rootMargin: "-20% 0px -55% 0px" },
  );

  panels.forEach((panel) => observer.observe(panel));
};

const initThemeToggle = (liveRegion) => {
  const modeToggle = document.getElementById("mode-toggle");
  if (!modeToggle) return;

  const themeStorageKey = "pcqbank-theme";
  const prefersDark =
    typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-color-scheme: dark)")
      : null;
  let manualChoice = false;

  const applyTheme = (theme) => {
    const isDark = theme === "dark";
    document.body.classList.toggle("dark-mode", isDark);
    modeToggle.setAttribute("aria-pressed", String(isDark));
    modeToggle.textContent = isDark ? "☀️ Light mode" : "🌙 Dark mode";
    announce(liveRegion, `Switched to ${isDark ? "dark" : "light"} mode.`);
  };

  const storedTheme = localStorage.getItem(themeStorageKey);
  if (storedTheme) {
    manualChoice = true;
    applyTheme(storedTheme);
  } else if (prefersDark?.matches) {
    applyTheme("dark");
  } else {
    applyTheme("light");
  }

  modeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark-mode");
    const newTheme = isDark ? "dark" : "light";
    modeToggle.setAttribute("aria-pressed", String(isDark));
    modeToggle.textContent = isDark ? "☀️ Light mode" : "🌙 Dark mode";
    localStorage.setItem(themeStorageKey, newTheme);
    manualChoice = true;
    announce(liveRegion, `Switched to ${newTheme} mode.`);
  });

  if (prefersDark) {
    const handlePreferenceChange = (event) => {
      if (manualChoice) return;
      applyTheme(event.matches ? "dark" : "light");
    };

    if (typeof prefersDark.addEventListener === "function") {
      prefersDark.addEventListener("change", handlePreferenceChange);
    } else if (typeof prefersDark.addListener === "function") {
      prefersDark.addListener(handlePreferenceChange);
    }
  }
};

const initWorkflowTracker = (liveRegion) => {
  const trackerCheckboxes = document.querySelectorAll("[data-progress-step]");
  if (!trackerCheckboxes.length) return;

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
      console.warn("Unable to read progress from storage", error);
      return [];
    }
  };

  const writeProgress = (steps) => {
    try {
      localStorage.setItem(progressStorageKey, JSON.stringify(steps));
    } catch (error) {
      console.warn("Unable to persist workflow tracker state", error);
    }
  };

  const updateProgress = () => {
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
    announce(liveRegion, `Workflow tracker updated: ${completed} of ${total} steps complete.`);
  };

  const savedSteps = readProgress();
  trackerCheckboxes.forEach((checkbox) => {
    if (savedSteps.includes(checkbox.dataset.progressStep)) {
      checkbox.checked = true;
    }
    checkbox.addEventListener("change", updateProgress);
  });

  updateProgress();

  if (trackerReset) {
    trackerReset.addEventListener("click", () => {
      trackerCheckboxes.forEach((checkbox) => {
        checkbox.checked = false;
      });
      updateProgress();
    });
  }
};

const initBackToTop = () => {
  const backToTopButton = document.querySelector(".back-to-top");
  if (!backToTopButton) return;

  const prefersReducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
    if (window.scrollTo) {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    } else {
      window.scrollTop = 0;
    }
  });
};

const initJsonLibrary = (liveRegion) => {
  const jsonDbSection = document.getElementById("json-database");
  if (!jsonDbSection) return;

  const elements = {
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
    importButton: jsonDbSection.querySelector('[data-json-action="import"]'),
    uploadInput: document.getElementById("json-entry-upload"),
    status: document.getElementById("json-db-status"),
  };

  const actionButtons = jsonDbSection.querySelectorAll("[data-json-action]");
  const hasIndexedDb = typeof window.indexedDB !== "undefined";
  const dbName = "pcqbank-json-library";
  const dbVersion = 1;
  const storeName = "entries";
  let dbPromise = null;
  let cachedEntries = [];
  let selectedEntryId = null;

  const sampleJson = `[\n  {\n    "qid": "PEDCARD-12345",\n    "topic": "Congenital Heart Disease (CHD)",\n    "subtopic": "Tetralogy of Fallot",\n    "difficulty": "Intermediate",\n    "question_type": "Single Best Answer",\n    "learning_objective": "Recognize acute management for tet spells",\n    "cognitive_level": "Application"\n  }\n]`;

  const setStatus = (message, type = "info") => {
    if (!elements.status) return;
    if (!message) {
      elements.status.hidden = true;
      elements.status.textContent = "";
      elements.status.classList.remove("is-error");
      return;
    }
    elements.status.hidden = false;
    elements.status.textContent = message;
    elements.status.classList.toggle("is-error", type === "error");
  };

  const setFeedback = (message, state) => {
    if (!elements.feedback) return;
    elements.feedback.textContent = message;
    elements.feedback.classList.remove("is-success", "is-error");
    if (state === "success") {
      elements.feedback.classList.add("is-success");
    } else if (state === "error") {
      elements.feedback.classList.add("is-error");
    }
    if (message) {
      announce(liveRegion, message);
    }
  };

  const disableAllActions = () => {
    actionButtons.forEach((button) => {
      button.disabled = true;
    });
    if (elements.form) {
      const fields = elements.form.querySelectorAll("input, textarea, button");
      fields.forEach((field) => {
        field.disabled = true;
      });
    }
  };

  const validateJsonPayload = (raw) => {
    if (!raw || !raw.trim()) {
      throw new Error("Paste a JSON payload before saving.");
    }
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      throw new Error(`Invalid JSON: ${error.message}`);
    }
    if (!(Array.isArray(parsed) || typeof parsed === "object")) {
      throw new Error("JSON payload must be an object or array.");
    }
    return JSON.stringify(parsed, null, 2);
  };

  const openDb = () => {
    if (!hasIndexedDb) {
      return Promise.reject(new Error("IndexedDB not supported"));
    }
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, dbVersion);
      request.onerror = () => reject(new Error("Unable to open database"));
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
        db.onversionchange = () => db.close();
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
          let request;
          try {
            request = callback(store);
          } catch (error) {
            reject(error);
            return;
          }
          transaction.oncomplete = () => resolve(request?.result);
          transaction.onerror = () =>
            reject(transaction.error || new Error("Transaction failed"));
        }),
    );

  const addEntry = (entry) => runTransaction("readwrite", (store) => store.add(entry));

  const getAllEntries = () =>
    runTransaction("readonly", (store) => store.getAll()).then((entries) => {
      if (!Array.isArray(entries)) return [];
      return entries.sort((a, b) => b.createdAt - a.createdAt);
    });

  const deleteEntry = (id) =>
    runTransaction("readwrite", (store) => store.delete(id));

  const resetSelection = () => {
    selectedEntryId = null;
    if (elements.deleteButton) {
      elements.deleteButton.disabled = true;
    }
    if (elements.preview) {
      elements.preview.textContent = "Select a saved batch to view its JSON.";
    }
    if (elements.previewTitle) {
      elements.previewTitle.textContent = "Preview";
    }
  };

  const renderEntries = (entries) => {
    cachedEntries = entries;
    if (!elements.entryList) return;
    elements.entryList.innerHTML = "";
    if (!entries.length) {
      const emptyMessage = document.createElement("li");
      emptyMessage.className = "json-entry-empty";
      emptyMessage.textContent = "No saved batches yet. Save a JSON payload to see it here.";
      elements.entryList.appendChild(emptyMessage);
      resetSelection();
      return;
    }

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
      elements.entryList.appendChild(item);
    });
  };

  const selectEntry = (entryId) => {
    if (!elements.entryList) return;
    const entry = cachedEntries.find((candidate) => String(candidate.id) === String(entryId));
    if (!entry) return;
    selectedEntryId = entry.id;
    const buttons = elements.entryList.querySelectorAll("button[data-entry-id]");
    buttons.forEach((button) => {
      const isSelected = button.dataset.entryId === String(entry.id);
      button.classList.toggle("is-selected", isSelected);
    });
    if (elements.preview) {
      elements.preview.textContent = entry.payload || "";
    }
    if (elements.previewTitle) {
      const timestamp = new Date(entry.createdAt).toLocaleString();
      elements.previewTitle.textContent = `${entry.title || "Saved batch"} • ${timestamp}`;
    }
    if (elements.deleteButton) {
      elements.deleteButton.disabled = false;
    }
  };

  const refreshEntries = ({ silent = false } = {}) => {
    getAllEntries()
      .then((entries) => {
        renderEntries(entries);
        if (!silent) {
          setFeedback(`Loaded ${entries.length} saved ${entries.length === 1 ? "batch" : "batches"}.`, "success");
        }
      })
      .catch((error) => {
        console.error("Unable to load saved entries", error);
        setFeedback("Unable to load saved batches.", "error");
      });
  };

  if (!hasIndexedDb) {
    setStatus("IndexedDB is unavailable in this browser. JSON batches cannot be stored locally.", "error");
    disableAllActions();
    return;
  }

  setStatus("Saved batches stay on this device. Refresh or export at any time.");

  if (elements.saveButton) {
    elements.saveButton.addEventListener("click", () => {
      if (!elements.payload) return;
      try {
        const formattedPayload = validateJsonPayload(elements.payload.value);
        const entry = {
          title:
            elements.title?.value.trim() || `Saved batch (${new Date().toLocaleDateString()})`,
          notes: elements.notes?.value.trim() || "",
          payload: formattedPayload,
          createdAt: Date.now(),
        };
        addEntry(entry)
          .then(() => {
            setFeedback("Batch saved to your local library.", "success");
            elements.form?.reset();
            refreshEntries({ silent: true });
          })
          .catch((error) => {
            console.error("Unable to save JSON batch", error);
            setFeedback("Unable to save this batch. Please try again.", "error");
          });
      } catch (error) {
        setFeedback(error.message, "error");
      }
    });
  }

  if (elements.clearButton) {
    elements.clearButton.addEventListener("click", () => {
      elements.form?.reset();
      setFeedback("Form cleared.", "success");
    });
  }

  if (elements.sampleButton) {
    elements.sampleButton.addEventListener("click", () => {
      if (elements.payload) {
        elements.payload.value = sampleJson;
      }
      if (elements.title && !elements.title.value) {
        elements.title.value = "Sample batch";
      }
      setFeedback("Sample JSON inserted. Adjust and save when ready.", "success");
    });
  }

  if (elements.refreshButton) {
    elements.refreshButton.addEventListener("click", () => {
      refreshEntries();
    });
  }

  if (elements.entryList) {
    elements.entryList.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const button = target.closest("button[data-entry-id]");
      if (!button) return;
      selectEntry(button.dataset.entryId || "");
      setFeedback("Loaded preview for the selected batch.", "success");
    });
  }

  if (elements.deleteButton) {
    elements.deleteButton.addEventListener("click", () => {
      if (selectedEntryId === null) return;
      deleteEntry(Number(selectedEntryId))
        .then(() => {
          setFeedback("Batch deleted from your library.", "success");
          resetSelection();
          refreshEntries();
        })
        .catch((error) => {
          console.error("Unable to delete JSON batch", error);
          setFeedback("Unable to delete this batch.", "error");
        });
    });
  }

  if (elements.exportButton) {
    elements.exportButton.addEventListener("click", () => {
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
          const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
            type: "application/json",
          });
          const url = URL.createObjectURL(blob);
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
        .catch((error) => {
          console.error("Export failed", error);
          setFeedback("Export failed. Please try again.", "error");
        });
    });
  }

  const importEntries = (entries) => {
    if (!Array.isArray(entries) || !entries.length) {
      setFeedback("Import file must contain an array of batches.", "error");
      return;
    }

    const normalized = entries
      .map((entry, index) => {
        if (!entry) return null;
        const rawPayload = entry.payload ?? entry.data ?? null;
        if (!rawPayload) return null;

        let payloadText;
        if (typeof rawPayload === "string") {
          try {
            payloadText = validateJsonPayload(rawPayload);
          } catch (error) {
            console.warn("Skipping invalid payload during import", error);
            return null;
          }
        } else {
          try {
            payloadText = JSON.stringify(rawPayload, null, 2);
          } catch (error) {
            console.warn("Skipping unparsable payload during import", error);
            return null;
          }
        }

        return {
          title: entry.title || `Imported batch ${index + 1}`,
          notes: entry.notes || "",
          payload: payloadText,
          createdAt: typeof entry.createdAt === "number" ? entry.createdAt : Date.now(),
        };
      })
      .filter(Boolean);

    if (!normalized.length) {
      setFeedback("No valid batches found in the import file.", "error");
      return;
    }

    Promise.allSettled(normalized.map((entry) => addEntry(entry)))
      .then((results) => {
        const successCount = results.filter((result) => result.status === "fulfilled").length;
        refreshEntries({ silent: true });
        setFeedback(`Imported ${successCount} ${successCount === 1 ? "batch" : "batches"} from file.`, "success");
      })
      .catch((error) => {
        console.error("Import failed", error);
        setFeedback("Import failed. Please try again.", "error");
      });
  };

  if (elements.importButton && elements.uploadInput) {
    elements.importButton.addEventListener("click", () => {
      elements.uploadInput.value = "";
      elements.uploadInput.click();
    });

    elements.uploadInput.addEventListener("change", (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      file
        .text()
        .then((text) => {
          let parsed;
          try {
            parsed = JSON.parse(text);
          } catch (error) {
            throw new Error("Import file is not valid JSON.");
          }
          importEntries(parsed);
        })
        .catch((error) => {
          console.error("Import failed", error);
          setFeedback(error.message || "Unable to import file.", "error");
        })
        .finally(() => {
          elements.uploadInput.value = "";
        });
    });
  }

  refreshEntries({ silent: true });
};

document.addEventListener("DOMContentLoaded", () => {
  const liveRegion = document.getElementById("live-region");
  const navLinks = Array.from(document.querySelectorAll('.page-nav a[href^="#"]'));
  const panels = Array.from(document.querySelectorAll("main .panel"));
  const searchInput = document.getElementById("section-search");
  const searchFeedback = document.getElementById("search-feedback");

  initCopyButtons(liveRegion);
  initSmoothNavigation(navLinks);
  initAccordionControls();
  initSectionSearch({ panels, searchInput, searchFeedback, liveRegion });
  initScrollSpy({ panels, navLinks });
  initThemeToggle(liveRegion);
  initWorkflowTracker(liveRegion);
  initBackToTop();
  initJsonLibrary(liveRegion);
});

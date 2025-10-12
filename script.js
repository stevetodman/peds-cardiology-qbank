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

const copyTextToClipboard = async (text) => {
  if (!text) return false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (error) {
    // Fallback below
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  let success = false;
  try {
    success = document.execCommand("copy");
  } catch (error) {
    success = false;
  }

  document.body.removeChild(textarea);
  return success;
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
        const success = await copyTextToClipboard(textToCopy);
        showFeedback(success ? "Copied!" : "Copy failed", success ? "copied" : "copy-error");
      } catch (error) {
        showFeedback("Copy failed", "copy-error");
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
    "Press / to focus search or open the command palette with Ctrl+K / ⌘K.";
  const panelCache = panels.map((panel) => {
    const heading = panel.querySelector("h2");
    const descriptor = panel.dataset.panelDescription || "";
    const keywords = panel.dataset.panelKeywords || "";
    const searchText = `${heading ? heading.textContent : ""} ${descriptor} ${
      keywords
    } ${(panel.textContent || "").replace(/\s+/g, " ")}`
      .toLowerCase()
      .trim();
    panel.dataset.searchCache = searchText;
    return { element: panel, searchText };
  });
  let latestFirstMatch = null;

  const resetSearchState = () => {
    panelCache.forEach(({ element }) => {
      element.classList.remove("is-hidden", "search-match", "flash-match");
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
    panelCache.forEach(({ element, searchText }) => {
      if (searchText.includes(query)) {
        element.classList.remove("is-hidden");
        element.classList.add("search-match");
        if (!latestFirstMatch) {
          latestFirstMatch = element;
        }
        matchCount += 1;
      } else {
        element.classList.remove("search-match", "flash-match");
        element.classList.add("is-hidden");
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

const initPinnedSections = ({ panels, liveRegion }) => {
  const pinnedList = document.getElementById("pinned-list");
  const pinnedEmpty = document.getElementById("pinned-empty");
  if (!pinnedList || !pinnedEmpty) {
    return {
      togglePin: () => false,
      isPinned: () => false,
      openPanel: (panelId) => {
        const panel =
          typeof panelId === "string" ? document.getElementById(panelId) : panelId;
        if (panel) smoothScrollTo(panel);
      },
      copyPanel: async () => false,
      getMetadata: (panelOrId) => {
        const panel =
          typeof panelOrId === "string"
            ? document.getElementById(panelOrId)
            : panelOrId;
        if (!panel) return null;
        const title =
          panel.dataset.panelTitle ||
          panel.querySelector("h2")?.textContent?.trim() ||
          panel.id;
        const description = panel.dataset.panelDescription || "";
        return { id: panel.id, title, description, element: panel };
      },
      getPinnedIds: () => [],
      subscribe: () => () => {},
    };
  }

  const pinnablePanels = panels.filter(
    (panel) => panel.id && panel.dataset.pinnable !== "false",
  );
  const toggles = [];
  pinnablePanels.forEach((panel) => {
    const toggle = panel.querySelector(".pin-toggle");
    if (toggle) {
      if (!toggle.dataset.panelTarget) {
        toggle.dataset.panelTarget = panel.id;
      }
      toggles.push(toggle);
    }
  });

  const storageKey = "pcqbank-pinned-panels";
  const subscribers = new Set();

  const sanitizePins = (ids) =>
    ids.filter((id) => pinnablePanels.some((panel) => panel.id === id));

  const readPins = () => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? sanitizePins(parsed) : [];
    } catch (error) {
      console.warn("Unable to read pinned sections", error);
      return [];
    }
  };

  let pinnedIds = readPins();

  const persistPins = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(pinnedIds));
    } catch (error) {
      console.warn("Unable to persist pinned sections", error);
    }
  };

  const getMetadata = (panelOrId) => {
    const panel =
      typeof panelOrId === "string"
        ? document.getElementById(panelOrId)
        : panelOrId;
    if (!panel) return null;
    const title =
      panel.dataset.panelTitle ||
      panel.querySelector("h2")?.textContent?.trim() ||
      panel.id;
    const description = panel.dataset.panelDescription || "";
    return { id: panel.id, title, description, element: panel };
  };

  const getPinnedIds = () => [...pinnedIds];

  const notify = () => {
    subscribers.forEach((callback) => {
      try {
        callback(getPinnedIds());
      } catch (error) {
        console.error("Pinned section subscriber failed", error);
      }
    });
  };

  const updateToggleState = () => {
    toggles.forEach((toggle) => {
      const panelId = toggle.dataset.panelTarget || "";
      const isPinned = pinnedIds.includes(panelId);
      const meta = getMetadata(panelId);
      toggle.classList.toggle("is-pinned", isPinned);
      toggle.setAttribute("aria-pressed", String(isPinned));
      toggle.textContent = isPinned ? "📍 Unpin" : "📌 Pin";
      if (meta) {
        toggle.setAttribute(
          "aria-label",
          `${isPinned ? "Unpin" : "Pin"} ${meta.title}`,
        );
      }
    });
  };

  const renderPinnedList = () => {
    pinnedList.innerHTML = "";
    if (!pinnedIds.length) {
      pinnedList.hidden = true;
      pinnedEmpty.hidden = false;
      return;
    }

    pinnedList.hidden = false;
    pinnedEmpty.hidden = true;

    pinnedIds.forEach((panelId) => {
      const meta = getMetadata(panelId);
      if (!meta) return;
      const listItem = document.createElement("li");
      listItem.className = "pinned-item";
      listItem.dataset.panelId = panelId;

      const openButton = document.createElement("button");
      openButton.type = "button";
      openButton.className = "pinned-link";
      openButton.dataset.command = "open";
      openButton.dataset.panelId = panelId;
      openButton.textContent = meta.title;

      const actions = document.createElement("div");
      actions.className = "pinned-actions";

      const copyButton = document.createElement("button");
      copyButton.type = "button";
      copyButton.className = "pinned-action";
      copyButton.dataset.command = "copy";
      copyButton.dataset.panelId = panelId;
      copyButton.title = `Copy ${meta.title}`;
      copyButton.textContent = "📋";

      const unpinButton = document.createElement("button");
      unpinButton.type = "button";
      unpinButton.className = "pinned-action";
      unpinButton.dataset.command = "pin";
      unpinButton.dataset.panelId = panelId;
      unpinButton.title = `Unpin ${meta.title}`;
      unpinButton.textContent = "✖";

      actions.append(copyButton, unpinButton);
      listItem.append(openButton, actions);
      pinnedList.appendChild(listItem);
    });
  };

  const openPanel = (panelId) => {
    const meta = getMetadata(panelId);
    if (!meta) return;
    smoothScrollTo(meta.element);
    meta.element.classList.add("flash-match");
    window.setTimeout(() => {
      meta.element.classList.remove("flash-match");
    }, 900);
  };

  const copyPanel = async (panelId) => {
    const meta = getMetadata(panelId);
    if (!meta) return false;
    const clone = meta.element.cloneNode(true);
    clone.querySelectorAll(".panel-actions, .pin-toggle").forEach((node) => {
      node.remove();
    });
    const text = clone.innerText.replace(/\s+\n/g, "\n").trim();
    const success = await copyTextToClipboard(text);
    announce(
      liveRegion,
      success
        ? `Copied ${meta.title}.`
        : `Unable to copy ${meta.title}.`,
    );
    return success;
  };

  const togglePin = (panelId) => {
    if (!panelId) return false;
    const currentIndex = pinnedIds.indexOf(panelId);
    let isNowPinned = false;
    if (currentIndex >= 0) {
      pinnedIds.splice(currentIndex, 1);
    } else {
      pinnedIds.push(panelId);
      isNowPinned = true;
    }
    pinnedIds = sanitizePins(pinnedIds);
    persistPins();
    updateToggleState();
    renderPinnedList();
    notify();
    const meta = getMetadata(panelId);
    if (meta) {
      announce(
        liveRegion,
        `${isNowPinned ? "Pinned" : "Unpinned"} ${meta.title}.`,
      );
    }
    return isNowPinned;
  };

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      togglePin(toggle.dataset.panelTarget || "");
    });
  });

  pinnedList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-command]");
    if (!button) return;
    const panelId = button.dataset.panelId || "";
    if (!panelId) return;
    const command = button.dataset.command;
    if (command === "open") {
      openPanel(panelId);
    } else if (command === "copy") {
      copyPanel(panelId);
    } else if (command === "pin") {
      togglePin(panelId);
    }
  });

  renderPinnedList();
  updateToggleState();

  return {
    togglePin,
    isPinned: (panelId) => pinnedIds.includes(panelId),
    openPanel,
    copyPanel,
    getMetadata,
    getPinnedIds,
    subscribe: (callback) => {
      if (typeof callback === "function") {
        subscribers.add(callback);
        callback(getPinnedIds());
        return () => subscribers.delete(callback);
      }
      return () => {};
    },
  };
};

const initCommandPalette = ({ panels, pinManager }) => {
  const trigger = document.getElementById("command-toggle");
  const palette = document.getElementById("command-palette");
  const backdrop = document.getElementById("command-palette-backdrop");
  const searchInput = document.getElementById("command-search");
  const resultsList = document.getElementById("command-results");
  const closeButton = document.getElementById("command-close");
  if (
    !trigger ||
    !palette ||
    !backdrop ||
    !searchInput ||
    !resultsList ||
    !pinManager
  ) {
    return;
  }

  const panelEntries = panels
    .filter((panel) => panel.dataset.pinnable !== "false")
    .map((panel) => pinManager.getMetadata(panel))
    .filter(Boolean);

  let filteredEntries = panelEntries;
  let highlightIndex = 0;
  let isOpen = false;

  const updateAriaExpanded = () => {
    trigger.setAttribute("aria-expanded", String(isOpen));
  };

  const renderResults = () => {
    resultsList.innerHTML = "";
    if (!filteredEntries.length) {
      const emptyState = document.createElement("li");
      emptyState.className = "command-empty";
      emptyState.setAttribute("aria-hidden", "true");
      emptyState.textContent = "No matches. Try a different keyword.";
      resultsList.appendChild(emptyState);
      searchInput.removeAttribute("aria-activedescendant");
      return;
    }

    filteredEntries.forEach((entry, index) => {
      const listItem = document.createElement("li");
      listItem.className = "command-item";
      listItem.dataset.panelId = entry.id;
      listItem.setAttribute("role", "option");
      const isHighlighted = index === highlightIndex;
      listItem.classList.toggle("is-highlighted", isHighlighted);
      listItem.setAttribute("aria-selected", String(isHighlighted));

      const row = document.createElement("div");
      row.className = "command-row";

      const mainButton = document.createElement("button");
      mainButton.type = "button";
      mainButton.className = "command-result";
      const optionId = `command-option-${entry.id}`;
      mainButton.id = optionId;
      mainButton.dataset.panelId = entry.id;
      mainButton.innerHTML = `
        <span class="command-title">${entry.title}</span>
        <span class="command-desc">${entry.description}</span>
      `;

      const actions = document.createElement("div");
      actions.className = "command-actions";

      const pinButton = document.createElement("button");
      pinButton.type = "button";
      pinButton.className = "command-action";
      pinButton.dataset.command = "pin";
      pinButton.dataset.panelId = entry.id;
      const pinned = pinManager.isPinned(entry.id);
      pinButton.setAttribute("aria-pressed", String(pinned));
      pinButton.title = pinned ? "Unpin from shortcuts" : "Pin to shortcuts";
      pinButton.textContent = pinned ? "📍" : "📌";

      const copyButton = document.createElement("button");
      copyButton.type = "button";
      copyButton.className = "command-action";
      copyButton.dataset.command = "copy";
      copyButton.dataset.panelId = entry.id;
      copyButton.title = "Copy this section";
      copyButton.textContent = "📋";

      actions.append(pinButton, copyButton);
      row.append(mainButton, actions);
      listItem.appendChild(row);
      resultsList.appendChild(listItem);

      if (isHighlighted) {
        searchInput.setAttribute("aria-activedescendant", optionId);
      }
    });
  };

  const filterEntries = (query) => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      filteredEntries = panelEntries;
    } else {
      filteredEntries = panelEntries.filter((entry) => {
        const panel = document.getElementById(entry.id);
        const searchCache = panel?.dataset.searchCache;
        if (searchCache) {
          return searchCache.includes(trimmed);
        }
        const combined = `${entry.title} ${entry.description}`.toLowerCase();
        return combined.includes(trimmed);
      });
    }
    highlightIndex = 0;
    renderResults();
  };

  const closePalette = ({ refocus } = { refocus: true }) => {
    if (!isOpen) return;
    isOpen = false;
    palette.hidden = true;
    backdrop.hidden = true;
    document.body.classList.remove("command-open");
    updateAriaExpanded();
    if (refocus) {
      trigger.focus();
    }
  };

  const openPalette = () => {
    if (isOpen) {
      closePalette({ refocus: false });
      return;
    }
    isOpen = true;
    palette.hidden = false;
    backdrop.hidden = false;
    document.body.classList.add("command-open");
    updateAriaExpanded();
    filterEntries(searchInput.value);
    window.setTimeout(() => {
      searchInput.focus();
      searchInput.select();
    }, 0);
  };

  trigger.addEventListener("click", () => {
    openPalette();
  });

  closeButton?.addEventListener("click", () => closePalette());
  backdrop.addEventListener("click", () => closePalette({ refocus: false }));

  document.addEventListener("keydown", (event) => {
    const isModifier = event.metaKey || event.ctrlKey;
    if (event.key === "k" && isModifier && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      openPalette();
    }
    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      closePalette();
    }
  });

  searchInput.addEventListener("input", (event) => {
    filterEntries(event.target.value);
  });

  searchInput.addEventListener("keydown", (event) => {
    if (!filteredEntries.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      highlightIndex = (highlightIndex + 1) % filteredEntries.length;
      renderResults();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      highlightIndex =
        (highlightIndex - 1 + filteredEntries.length) % filteredEntries.length;
      renderResults();
    } else if (event.key === "Enter") {
      event.preventDefault();
      const entry = filteredEntries[highlightIndex];
      if (!entry) return;
      if (event.shiftKey) {
        pinManager.copyPanel(entry.id);
      } else if (event.altKey) {
        pinManager.togglePin(entry.id);
        renderResults();
      } else {
        closePalette();
        pinManager.openPanel(entry.id);
      }
    }
  });

  resultsList.addEventListener("click", (event) => {
    const actionButton = event.target.closest("button[data-command]");
    if (actionButton) {
      const panelId = actionButton.dataset.panelId || "";
      if (!panelId) return;
      const command = actionButton.dataset.command;
      if (command === "pin") {
        pinManager.togglePin(panelId);
        renderResults();
      } else if (command === "copy") {
        pinManager.copyPanel(panelId);
      }
      return;
    }

    const resultButton = event.target.closest(".command-result");
    if (resultButton) {
      const panelId = resultButton.dataset.panelId || "";
      if (!panelId) return;
      closePalette();
      pinManager.openPanel(panelId);
    }
  });

  pinManager.subscribe(() => {
    renderResults();
  });

  renderResults();
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
  const pinManager = initPinnedSections({ panels, liveRegion });
  initCommandPalette({ panels, pinManager });
  initBackToTop();
  initJsonLibrary(liveRegion);
});

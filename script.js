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

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

# Pediatric Cardiology QBank Prompt Pack — User Guide

This guide walks you through the refreshed Pediatric Cardiology QBank prompt pack. It explains, in everyday language, how to navigate the page, copy the materials you need, and run your workflow from start to finish.

## 1. What this site offers

* **Single home base:** Everything required to build and review 5,000 exam-quality pediatric cardiology questions lives on one scrolling page.
* **Plain-language structure:** The content is arranged in the order you would actually use it—from orienting yourself, to generating content, to reviewing it for quality.
* **Ready-to-copy prompts:** Every major block includes a one-click copy button so you can paste text directly into your tooling without formatting issues.
* **Built-in checklists:** Quality controls, reviewer rubrics, and acceptance criteria appear exactly where you need them, so nothing is missed when moving items into the bank.

## 2. Getting started (5-minute overview)

1. **Open `index.html` in your browser.** You will see a bold header that summarizes the purpose of the prompt pack.
2. **Use the sticky navigation bar or tap `/` to search.** The search field instantly filters sections so you can jump straight to the block you need.
3. **Toggle light or dark mode** from the navigation bar to match your lighting conditions.
4. **Skim the "Quick Start Workflow"** for a bird's-eye view of the entire production process, then mark progress with the Workflow Progress Tracker right below it.
5. **Follow the workflow panels** in order; each one mirrors the steps you would take when generating and validating new MCQs.
6. **Save approved JSON arrays** inside the JSON Batch Library so you can reopen, export, or re-import them without digging through folders.

## 3. Section-by-section tour

| Section | Plain-language purpose |
| --- | --- |
| **Hero banner** | Reminds you what the pack is for and provides quick links to the two most-used sections: Quick Start and System Instructions. |
| **Quick Start Workflow** | Shows the entire process in four steps, from setting the system message to final quality checks. Ideal for first-time users. |
| **Workflow Progress Tracker** | Lets you check off six major milestones and stores your selections locally so you always know where the team left off. |
| **What's Improved** | Highlights the upgrades that distinguish this pack from earlier drafts—helpful when sharing with teammates or leadership. |
| **System Instructions** | Contains the exact wording for the system/developer message. Use the copy button before every generation session to ensure consistency. |
| **JSON Schema** | Presents the required output format with clear headings and indentation so you can confirm every field before submission. |
| **Blueprint** | Lays out the targets for difficulty, question type, and domain coverage. Use these tables as your checklist when planning batches. |
| **Batch Prompts** | Supplies pre-written prompts for stem creation, explanation writing, and reviewer workflows. Each prompt sits inside a copy-ready panel. |
| **JSON Batch Library** | Lets you paste validated JSON, save it with a friendly title and notes, then reopen, export, import, or delete batches directly in the browser. |
| **Quality Controls** | Groups the reviewer rubric, statistical acceptance thresholds, and safety checklist so you can sign off on batches with confidence. |

## 4. Working through the workflow

### Step 1: Set the tone

* Scroll to **System Instructions**.
* Click the **"Copy" button** beside the block. A short “Copied!” message lets you know it worked.
* Paste the text into your AI tool or workflow engine to establish the correct behavior for content generation.

### Step 2: Plan your batch

* Review the **Blueprint tables** to confirm which domains, difficulties, and question types you still need.
* Note the counts directly on the page or in your own tracker so the next generation run stays balanced.

### Step 3: Generate new material

* Head to **Batch Prompts** and choose either the main 100-item stems prompt or one of the focused options (Tetralogy of Fallot or ECG images).
* Use the copy button to grab the prompt and run it in your AI tool.
* When stems return, use the **Explanations Pass prompt** to add explanations only for approved items.

### Step 4: Review and approve

* Move to the **Quality Controls** section.
* Apply the **Reviewer Packet Prompt** to collect structured SME feedback.
* Compare reviewer results against the **Batch Acceptance Criteria** and the **Quality Control Checklist** before moving items into production.

## 5. Helpful interface features

* **Sticky navigation & search:** The menu stays visible as you scroll, and the search bar (or `/` shortcut) filters sections in real time.
* **Theme toggle:** Switch between light and dark palettes with one click so the page stays comfortable during long working sessions.
* **Workflow tracker:** Check off key milestones; progress is saved locally so you can resume work later without wondering what’s done.
* **JSON Batch Library:** Store, preview, export, and import JSON batches using built-in IndexedDB storage—no login or external software required.
* **Smooth scrolling:** Clicking a navigation link gently moves you to the chosen section so you can stay oriented.
* **Expandable accordions:** Long blocks (such as the prompts) sit inside sections you can expand or collapse in one click. Use the toolbar above each group to open or close all items at once.
* **Copy feedback:** When you copy any prompt, the button briefly changes to “Copied!” and a small announcement is sent to assistive technologies, ensuring everyone receives confirmation.
* **Back to top button:** A floating shortcut appears after scrolling so you can return to the hero section instantly.

## 6. Tips for teams

* **Share the link:** Because the page is self-contained, teammates only need the URL or file path to have the same experience.
* **Standardize your process:** Encourage writers, reviewers, and project managers to follow the Quick Start checklist so everyone speaks the same language.
* **Track progress visibly:** Use the built-in Workflow Progress Tracker plus the blueprint tables to log which domains are complete. A simple color-coding scheme in a shared spreadsheet pairs well with the counts shown here.
* **Catalog approved JSON:** Save each vetted batch inside the JSON library with a short note (e.g., “Ready for SME review”) so teammates know the next action at a glance, then export/import the file to sync across browsers.
* **Flag verification needs:** Whenever a citation or dosing statement shows “VERIFY_NEEDED,” mark it for SME follow-up before approving the batch.

## 7. Troubleshooting

| Situation | What to try |
| --- | --- |
| Copy button does nothing | Refresh the page and try again. If copying still fails, highlight the text manually and use your device’s copy shortcut. |
| Navigation links do not scroll | Ensure the page is open in a modern browser. If you are working offline, confirm that `script.js` is loading correctly by reloading the page. |
| Sections feel overwhelming | Collapse unused accordions and rely on the sticky menu to tackle one block at a time. |
| JSON library buttons are disabled | Switch to a modern browser (Chrome, Edge, Firefox, Safari) or enable local storage. The JSON Batch Library needs IndexedDB access to save batches and will show a warning banner if support is missing. |

## 8. Frequently asked questions

**Do I need coding knowledge to use this?**  
No. Everything is presented as ready-to-copy text with instructions written in plain English.

**Can I adapt the prompts for other specialties?**
Yes. Replace the pediatric cardiology references with your own domain-specific details, but keep the structure so the workflows remain intact.

**How do I keep track of completed items?**
Use the Workflow Progress Tracker for quick snapshots of what’s done, then update the blueprint counts and your external project tracker after each batch review.

**How do I move saved batches to another browser?**
Click **Export all** to download a JSON file, then open the destination browser and choose **Import library** to load the saved batches instantly.

**What if guidelines change?**
Update the relevant sections (such as the system instructions, prompts, and citations) with the new recommendations, then redistribute the page to your team.

**Where does the JSON library store my data?**
Everything stays inside your browser using IndexedDB. Nothing is uploaded to a server, and you can export, import, or delete batches at any time using the buttons in the JSON Batch Library.

## 9. Staying up to date

Schedule periodic reviews (e.g., quarterly) to refresh guideline references, dosing standards, and blueprint counts. When updates occur, re-share the page or export a new PDF so stakeholders always reference the latest version.

---

With this guide, you can confidently walk new collaborators through the prompt pack and ensure the entire team follows the same non-technical, repeatable workflow.

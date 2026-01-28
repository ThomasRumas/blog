# MoltBot macOS Usage Summary

This document summarizes **MoltBot setup and capabilities on macOS**, focusing on **CLI-only vs Companion App usage**.

---

## 1. MoltBot Setup Options on macOS

### A) CLI-Only Setup
- Components: `CLI + Gateway + Node`
- Runs in terminal / headless
- Good for:
  - Shell automation
  - Browser automation (Playwright, Puppeteer)
  - File system access
  - Headless scripts / DevOps tasks
- Limitations:
  - macOS UI automation is fragile
  - AppleScript may fail silently
  - Screen capture / vision workflows unreliable
  - No menu bar or notifications
  - Human-like UI interaction not possible

### B) CLI + macOS Companion App
- Adds: menu bar app + gateway broker + permission management
- Enables:
  - Reliable macOS UI automation (mouse, keyboard, windows)
  - Screen capture and visual reasoning
  - Camera / microphone access
  - AppleScript / automation at scale
  - Gateway auto-start, crash recovery, notifications

**Rule of thumb:**  
> If the agent needs to "see" or "touch" the macOS desktop → Companion App is required.  
> If the agent talks to programs via APIs / shells → CLI is enough.

---

## 2. Molt Tools → Companion App Requirement

| Category | Companion App Requirement | Notes |
|---------|---------------------------|------|
| Human-like Mac UI usage (mouse, keyboard, windows) | 🟥 REQUIRED | Accessibility + Input Monitoring needed |
| Screen / vision / clicks | 🟥 REQUIRED | Screen Recording + vision |
| Camera / microphone / media capture | 🟥 REQUIRED | TCC permissions |
| AppleScript / System Events | 🟨 Optional | CLI works sometimes; better reliability with Companion |
| Gateway reliability (auto-start, crash recovery) | 🟨 Optional | Companion keeps Gateway alive |
| Menu bar status & notifications | 🟨 Optional | CLI cannot show menu bar UI |
| Browser automation (Playwright, Puppeteer, Selenium) | 🟩 Not needed | Works fully headless |
| Shell / CLI tools (system.run, system.which, file I/O, API calls) | 🟩 Not needed | Full functionality without Companion |
| Headless server / background automation | 🟩 Not needed | CLI-only is sufficient |

---

## 3. Usage Definition

| Setup | Best Use Cases | Limitations |
|-------|----------------|------------|
| **CLI-only** | Shell scripts, browser automation, DevOps, headless tasks | Fragile macOS UI automation, no screen / vision, no menu bar |
| **Companion App** | Full macOS automation, vision-based UI reasoning, human-like interaction, media capture | Extra install, GUI-based |

---

### 4. Key Takeaways
1. **CLI-only** is sufficient for most **automation, scripting, and server tasks**.
2. **Companion App** is required for **full macOS desktop integration** and reliable UI automation.
3. Any **visual / human-like desktop interaction** or **media capture** always requires the Companion App.
4. Browser automation is fully functional without the Companion App.

---

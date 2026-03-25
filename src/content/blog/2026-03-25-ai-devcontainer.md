---
title: "Why I Created an AI DevContainer Sandbox?"
date: 2026-03-25
description: From a broken skill evaluation at ADEO to a clean sandbox environment for AI tools — how a DevContainer became my go-to setup for experimenting with AI agents without breaking anything.
img: devcontainer.png
tags: [Developer Experience, AI]
---

## Evaluating Copilot Skills at ADEO

At ADEO, we've been investing in GitHub Copilot to boost developer productivity. One natural step forward was to create **custom skills** — reusable capabilities that extend what Copilot can do for our teams. I started using the `/skill-creator` skill from Anthropic to help design and iterate on new skills.

But when I tried to run an evaluation on the skills I had created, something felt off.

The results looked too good. Too accurate. Something didn't add up.

After digging in, I realized what was happening: **the AI model was cheating**. Not intentionally, but structurally. It was smart enough to look beyond the instructions I had given it — scanning my local machine, picking up repositories, documentation, and other context it shouldn't have had access to during the evaluation. The evaluation wasn't measuring the skill, it was measuring the model's ability to browse my own environment.

That's when I understood the core issue: **to evaluate skills properly, I needed a controlled, isolated environment**. A sandbox where the AI has only what I explicitly give it, nothing more.

The fix? A DevContainer.

---

## Beyond Evaluation: The Developer Workflow Problem

Once I had the sandbox idea in mind, I realized it solved a second, more general problem.

AI tooling is evoling incredibly fast. Claude Code, OpenCode, GitHub Copilot CLI, MCP servers, agent skills, custom configurations — the ecosystem is exploding. New tools, new workflows, new experiments appear every week. A lot of developers and teams are sharing their own agents, skills, and configurations openly.

But here's the thing: **as a developer, you don't want to break your own setup to try something new**.

Your local environment is finely tuned. Your shell config, your AI tool configurations, your editor settings — it's your working environment. Installing an experimental agent or testing a community-contributed skill on your host machine is a gamble. It might conflict with your existing setup, pollute your config files, or leave behind artifacts you didn't ask for.

The solution is the same as for the evaluation problem: **a sandbox**. A disposable, reproducible environment where you can experiment freely, then commit the changes to your host only when you're confident they work.

---

## The Solution: An AI DevContainer

I built [devcontainer-ai](https://github.com/ThomasRumas/devcontainer-ai), a ready-to-use DevContainer designed specifically for working with AI agents and CLI tools.

The core idea is simple:

> A fully isolated environment where AI coding agents can execute code, browse the web, manage files, and run containers — without ever touching your host machine.

### Two Goals, One Container

**1. Smooth Developer Experience**

DevContainers are declarative and reproducible. You define what you want once, version it in Git, and anyone (or any machine) can spin up the exact same environment. No "works on my machine" issues, no manual setup steps.

For AI tooling specifically, this means you can define which agents are installed, which skills are loaded, and which API keys are available — all in a single configuration file. Rebuilding the container gives you a clean slate.

**2. A Sandbox for AI Experimentation**

Whether you're evaluating custom skills, testing a new AI CLI, or trying out a community agent configuration you found online — the DevContainer is your blast radius limiter. Break it, reset it, rebuild it. Your host stays clean.

---

## What's Inside

### Always Available

The container is built on top of `mcr.microsoft.com/devcontainers/base:ubuntu-24.04`, and includes a curated set of tools that are always present:

- **Node.js** (via nvm, LTS) — runtime for the npm AI ecosystem
- **Python 3.12** — ML/AI frameworks, scripting, and most AI tooling
- **Docker-in-Docker** — so agents can build and run containers inside the sandbox
- **GitHub CLI** — manage repos, PRs, and Actions directly from the container
- **Git LFS** — for repos with binaries or models

I chose **Node.js and Python** deliberately. Looking at the AI tooling landscape, the vast majority of agent frameworks, CLI tools, and skill packages are built in one of these two languages. They cover almost everything you'll encounter. That said, DevContainer features make it trivial to layer in additional runtimes — Java, Go, Rust — if a specific tool requires it.

### AI Tools (Configurable)

By default, three AI CLI tools are installed, toggled via a `devcontainer.env` file:

| Tool | What it is |
|---|---|
| **GitHub Copilot CLI** | Always included with DevContainer features, but can be removed — Copilot integration directly in the terminal |
| **Claude Code** | Anthropic's autonomous coding agent CLI |
| **OpenCode** | OpenCode coding agent CLI |
| **Playwright CLI** | Be able to browse a webpage for our AI Agent when developping, evaluating skills... |

The configuration is straightforward:

```dotenv
# .devcontainer/devcontainer.env
INSTALL_CLAUDE_CODE=true
INSTALL_OPENCODE=true
INSTALL_PLAYWRIGHT=true
INSTALL_EXTRAS=true

# API keys
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GITHUB_TOKEN=ghp_...
```

These are git-ignored by default, so your API keys never leak to version control.

### Agent Skills — Auto-installed on every start

One of the more powerful features is the `skills.txt` file. Declare which agent skills you want, and they're automatically installed on every container start — no rebuild required.

```
# .devcontainer/skills.txt
npx skills add https://github.com/anthropics/skills --skill skill-creator
npx skills add https://github.com/microsoft/playwright-cli --skill playwright-cli
```

Skills are installed to `.agents/skills/` (universal) and also to `.claude/skills/` if Claude Code is detected. This means you can iterate on your skill list without touching the container definition itself — just edit `skills.txt` and restart.

---

## How it works

The container lifecycle is split into two phases:

| Phase | Hook | What happens |
|---|---|---|
| **Build** | `postCreateCommand` | Reads `devcontainer.env`, installs selected tools |
| **Every start** | `postStartCommand` | Reads `skills.txt`, installs each declared skill |

This separation gives you flexibility: heavy tool installs happen once at build time, while skills (which are lightweight and change more often) are refreshed on every start.

---

## Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/ThomasRumas/devcontainer-ai
cd devcontainer-ai

# 2. Copy and customize the environment template
cp .devcontainer/devcontainer.env.example .devcontainer/devcontainer.env

# 3. Open in VS Code and launch the container
code .
# → Command Palette → "Dev Containers: Reopen in Container"
```

A verification script is also included (`.devcontainer/tests/verify.sh`) to confirm that everything is set up correctly after the build.

---

## What this changes

Going back to the original problem: I now run all my skill evaluations inside the DevContainer. The AI model has access only to what I explicitly put in the container. The evaluation results are meaningful.

More broadly, I've made it my default environment for anything AI-agent-related. Want to test a new skill I found on [skills.sh](https://skills.sh)? Add it to `skills.txt`, restart. Want to try OpenCode for the first time? Flip the flag in `devcontainer.env`, rebuild. Want to add a Java tool? Drop a DevContainer feature in `devcontainer.json`.

The sandbox is the workflow.

The repository is open: [github.com/ThomasRumas/devcontainer-ai](https://github.com/ThomasRumas/devcontainer-ai). Feel free to fork it, extend it, and adapt it to your own AI workflow.

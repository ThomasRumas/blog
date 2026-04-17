---
title: "MoE vs Dense on a budget GPU: How Qwen3.6-35B lost to a 9B Model from the same family"
date: 2026-04-17
description: I benchmarked Qwen3.6-35B-A3B with CPU offloading against Qwopus-9B on 26 coding tasks. The MoE model has 3 billion active parameters — fewer than the dense 9B. It still got crushed. Here is why.
img: MoEvsDense.png
tags: [AI, Local LLM, Developer Experience]
---

## The Question I Wanted to Answer

[Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B) was released yesterday — April 16, 2026. It is the first open-weight model of the Qwen3.6 generation, and the official benchmarks are genuinely impressive: **75.0% on SWE-bench Verified**, **51.5% on Terminal-Bench 2.0** (thinking mode, full hardware), and MMLU-Pro at 86.1%. In Qwen's own comparison table, those numbers put it in the same tier as **Qwen3.5-27B** — a much larger dense model — across most tasks.

That is a compelling pitch for a MoE model. A 35-billion parameter model is normally out of reach for a consumer GPU, but the Mixture of Experts architecture changes the math. Qwen3.6-35B-A3B only activates roughly **3 billion parameters per token**. In theory, you get the knowledge of a 27–35B model at the inference cost of a 3B model.

So the question was natural: on my RTX 5080 with 16 GB of VRAM (or any 8–16 GB gaming GPU), does a 3B-active-parameter MoE model beat a dense 9B at coding tasks?

I ran the test. The short answer is no — not even close. The longer answer is interesting enough to write down.

---

## The Setup: Deliberately Aggressive

I used [Terminal Bench](https://github.com/aorwall/terminal-bench), extracting a suite of 26 real software engineering tasks ranging from building a C compiler to running a PyPI server to implementing a gpt-2 code golf solution. These aren't toy prompts — each task has a verifier that runs automated tests and assigns a pass/fail grade.

**The models under test:**

- **Qwopus-9B** — a dense 9-billion parameter model, loaded entirely on GPU. Importantly, Qwopus-9B is built on **Qwen3.5**, the same base architecture as Qwen3.6-35B-A3B, but has been **distilled to behave like Anthropic's Claude Opus 4.6**. So while the two models share architectural roots, Qwopus-9B has been trained specifically to replicate the reasoning and instruction-following patterns of a frontier model — a targeted, task-aligned 9B, not just a shrunken generic.
- **Qwen3.6-35B-A3B** — a 35-billion parameter MoE model, with the `--cpu-moe` flag in llama.cpp to force only the **active experts onto the GPU**, leaving inactive experts in RAM

The `--cpu-moe` flag is the constraint that makes the comparison adversarial. With it, only the routed expert weights live on VRAM during inference. The remaining experts stay in system RAM and are fetched on demand over the CPU memory bus. I also limited the KV cache to **4-bit quantization** capped at **4096 MB** to ensure the whole thing fit within 8 GB of VRAM. The goal was to simulate what you get on a GPU where headroom is tight.

The agent running both models was **Claude Code**, running in `bypassPermissions` mode with a 20-minute execution timeout per task.

One important caveat: Qwen's official Terminal-Bench 2.0 score of 51.5% was achieved on full server-grade hardware with a **3-hour timeout and 48 GB of RAM** per task. My setup is intentionally the opposite — a constrained gaming GPU. That gap is exactly what this test is measuring.

---

## What Is MoE and Why the Theory Sounded Good

A standard dense LLM activates every parameter on every token. A Mixture of Experts model is different. Each transformer layer contains multiple "expert" sub-networks, and a learned router decides which one or two experts are relevant for each token. Only those fire; the rest do nothing.

For Qwen3.6-35B-A3B, this means ~3B parameters are active per token even though the model has 35B parameters in total. A correctly-loaded MoE on hardware with enough VRAM to hold all experts would give you roughly the knowledge of a 35B model at the inference cost of a 3B model. It is a genuinely clever architecture.

The problem, as I was about to find out, is the word "correctly-loaded."

---

## The Results

| Metric | Qwen3.6-35B-A3B (MoE) | Qwopus-9B (Dense) |
|---|:---:|:---:|
| Total tasks | 26 | 26 |
| **Successful** | **3 (11.5%)** | **9 (34.6%)** |
| Failures | 8 | 6 |
| Timeouts | **15 (57.7%)** | 11 (42.3%) |

The dense model solved **3× more tasks**. That alone seals the verdict, but the per-task timing tells an even starker story.

### Task-by-task where both models ran

These are the three tasks that both models actually completed:

| Task | Qwen3.6-35B (MoE) | Qwopus-9B (Dense) |
|---|:---:|:---:|
| `build-pmars` | ✅ 8m 40s | ✅ 5m 26s |
| `fix-git` | ✅ 6m 54s | ✅ 2m 32s |
| `git-leak-recovery` | ✅ 15m 45s | ✅ **1m 18s** |

The `git-leak-recovery` result is worth staring at. The MoE model spent twelve minutes on a task that the dense model handled in under 80 seconds — more than a **12× difference** in wall-clock time for an identical outcome.

### Tasks where the dense model won outright

| Task | Qwen3.6-35B (MoE) | Qwopus-9B (Dense) |
|---|:---:|:---:|
| `cancel-async-tasks` | ❌ partial (1 test failed) | ✅ 1m 17s |
| `cobol-modernization` | ⏱ timeout at 20m | ✅ 20m 51s |
| `headless-terminal` | ⏱ timeout (191 tokens generated) | ✅ 8m 41s |
| `kv-store-grpc` | ❌ failure | ✅ 1m 35s |
| `prove-plus-comm` | ⏱ timeout at 20m | ✅ 2m 40s |
| `pypi-server` | ⏱ timeout at 20m | ✅ 16m 51s |

The `headless-terminal` row stands out. Qwen3.6 was allocated a full 20 minutes and produced just **191 output tokens** before the clock ran out. The model was not frozen — it was just crawling. Qwopus solved the same task with 5,187 output tokens in 8 minutes.

Six tasks solved by Qwopus-9B, zero extra tasks solved by the MoE model.

---

## Why the MoE Model Was So Slow

The answer is bandwidth, and it was entirely predictable in hindsight.

### Expert routing requires loading experts from RAM

At every transformer layer, the router decides which experts to use for the current token batch. With `--cpu-moe`, those expert weights live in system RAM. So every inference step involves:

1. Router decides which expert (or experts) are needed
2. Those expert weights are copied from DDR5 RAM to GPU VRAM
3. The computation happens on the GPU
4. Results are returned

My DDR5 system RAM peaks around 70 GB/s. The RTX 5080's GDDR7 does over 960 GB/s. **Every expert activation crossing that bus takes roughly 20× longer than if the weights were already on the GPU.** Qwen3.6 has 94 experts per layer across many layers — even routing to just 2 per token, that is a constant stream of CPU→GPU memory copies.

### KV cache pressure compounds the problem

I intentionally limited the KV cache to 4-bit at 4096 MB of VRAM. That means for long coding tasks — the kind where the agent reads multiple source files, examines build errors, and iterates — the context fills up fast and every token generation slows down further as the cache is compressed or evicted.

Dense models don't have the expert-loading overhead, so the same KV cache constraint hits them more cleanly: you see slower generations at large context, but not the per-step tax of fetching expert weights.

### The cascade effect on agent performance

An agentic coding session is not a single inference call. It is dozens of turns: read a file, write a file, run a command, interpret the output, repeat. Each tool call is fast (the terminal is just executing commands), but the agent's response between tool calls is a full forward pass through the LLM. If each of those passes takes 3–4× longer, the entire chain slows proportionally.

At 3–4 tokens per second effective throughput, a task that a faster model resolves in 2 minutes now takes 6–7 minutes. Push it to a harder task and you hit the 20-minute wall before the model reaches a solution. This is why 57.7% of Qwen3.6's runs ended in timeout — not because the model is bad, but because the CPU offloading budget ran out of time.

---

## What Would Have Made This Fair

To be clear: this was a deliberately constrained test. I was probing the limits, not finding optimal settings. There are scenarios where MoE makes sense on constrained hardware:

**If all experts fit in VRAM.** A smaller MoE model — a 14B total with 2B active, for instance — might fit completely on a 16 GB GPU without routing any experts through RAM. In that case the architecture advantage is real and you'd likely see better throughput than a comparable dense model.

**If your task is latency-insensitive.** Batch inference, embeddings, or overnight jobs don't care if generation is slow. The routing overhead matters far less when you're not waiting on an agent loop.

**If you have a lot of CPU RAM and a very fast PCIe bus.** PCIe 5.0 with 128 GB/s doubles the practical bandwidth for expert loading. Still not GPU-class, but the gap narrows.

None of those were true for this test, and none are particularly common for developers running LLMs on gaming hardware.

---

## Conclusion: Dense wins on 8–16 GB GPUs for Coding

If you have 8 to 16 GB of VRAM and you want to use a local model for software engineering work — terminal sessions, agentic loops, long context code reading — pick a dense model that fits fully on your GPU. A well-tuned 9B or 14B dense model will outperform a larger-paper MoE model that has to route experts through system RAM.

The numbers from this benchmark are unambiguous: **11.5% success vs 34.6%**, **57.7% timeouts vs 42.3%**, and wall-clock timing that is anywhere from 1.5× to 12× slower per task for the MoE variant.

But there is a deeper takeaway beyond "dense beats MoE under VRAM pressure." Qwopus-9B is not a generic 9B model. It is a **distilled, task-aligned** model — trained to compress the reasoning patterns of a much larger frontier model into a fraction of the weights. That is a fundamentally different beast from a large, general-purpose MoE running with compromised bandwidth.

The maxim that emerges from this test: **on 8–16 GB hardware, a smaller dense model that has been fine-tuned or distilled for your specific domain will consistently outperform a larger generic MoE model that cannot fit properly in VRAM.** Raw parameter count matters far less than whether those parameters are resident on the GPU, and whether the model has been trained to be good at the exact class of tasks you are throwing at it.

MoE is a genuinely powerful architecture. If you have a 24 GB or 48 GB GPU where the full weight set fits in VRAM, a large MoE can be the best thing running locally. But constrained to the 8 GB tier with CPU offloading, the expert routing overhead dominates everything else, and the theoretical advantage evaporates entirely. Invest that VRAM budget in a well-distilled dense model instead.

The benchmarks are live on the [Benchmarks](/benchmarks) page if you want to drill into the task-by-task data.

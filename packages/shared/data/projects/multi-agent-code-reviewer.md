# Multi-Agent Code Reviewer

> Parallel Security/Performance/Style agents reviewing diffs with a Sonnet supervisor.

## Problem

A single general-purpose model that "reviews code" tends to miss whole categories — it finds a few security issues, glosses over performance, and produces unbalanced reports on long files. The goal was a multi-agent orchestration where each domain has its own specialist, the specialists run in parallel for speed, and a supervisor synthesizes one coherent report with a 0–100 score and a deduplicated finding list — all streamed to the browser in real time.

## Decisions

- **3 specialists in parallel + 1 supervisor** — Security, Performance, and Maintainability agents each get a focused system prompt with domain-specific criteria. They run via `Promise.all`, taking total latency from ~45s sequential to ~15s parallel. A supervisor then deduplicates and scores.
- **Sonnet for specialists, Haiku for the supervisor** — deep reasoning lives in the agents that detect subtle vulnerabilities; the supervisor's task is mechanical (sort, dedupe, summarize), so the cheaper model is sufficient and cuts cost.
- **`generateObject` + Zod as the contract** — every agent returns JSON that conforms to `FindingArraySchema`/`ReviewReportSchema`. The SDK rejects malformed responses before they reach app code, so the agents behave like typed components, not unpredictable text producers.
- **Single SSE endpoint instead of POST + polling** — no external KV/Redis needed; the same `POST /api/review` request emits live events as each agent completes.

## Results

- End-to-end pipeline: parse input → metadata → 3 parallel agents → supervisor → scored report
- Accepts raw snippets or public GitHub URLs (auto-converted to `raw.githubusercontent.com`)
- Live timeline UI updates per agent state and renders before/after diffs for every finding
- Rate limit of 3 reviews/IP/hour protects against the 4-LLM-call-per-review cost

## Stack

Next.js 16 App Router, TypeScript, Vercel AI SDK v6, Claude Sonnet 4.6 (specialists) + Haiku 4.5 (supervisor) via Vercel AI Gateway, Zod v4, native SSE streaming, Tailwind v4.

## Links

- Repo: https://github.com/NeryC/multi-agent-code-reviewer
- Demo: https://multi-agent-code-reviewer-sable.vercel.app

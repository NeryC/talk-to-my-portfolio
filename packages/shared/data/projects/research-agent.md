# Research Agent

> Multi-step web research with streaming UI and source citations.

## Problem

A plain chatbot answers from frozen training data and fabricates citations. The goal was a transparent research assistant that searches the live web, reads the pages it finds, reasons across multiple steps, and produces a synthesized answer where every claim is backed by a source the user can verify. The challenge: orchestrate an agent loop that can iteratively search and read without runaway costs or infinite loops.

## Decisions

- **`ToolLoopAgent` over manual `streamText` loops** — AI SDK v6's recommended pattern declaratively encapsulates model, tools, and `stopWhen(stepCountIs(8))`, eliminating the fragile boilerplate of detecting tool calls, re-feeding results, and managing termination by hand.
- **Terminal `finalAnswer` tool without `execute`** — when the model calls a tool that has no executor, the SDK stops the loop immediately and returns the typed object. Zero regex, zero free-text parsing — citations arrive as a validated `{ answer, sources[] }`.
- **Exa over Google/Bing scraping** — Exa returns clean page text and pre-extracted highlights, so the agent skips HTML parsers, anti-bot walls, and JS-heavy rendering.
- **Vercel AI Gateway** — one API key for every model, automatic failover across Anthropic/Vertex/Bedrock, request logs and cost visibility per call.

## Results

- End-to-end agent: search → read → reason → cite, streamed step-by-step into a live timeline UI
- 14 unit tests covering Exa client, tools, and rate limiter
- IP-scoped rate limit (5 requests/hour) keeps Exa quota and model spend bounded
- Per-page content capped at 8,000 characters to stay inside the token budget

## Stack

Next.js 16 App Router, TypeScript, Vercel AI SDK v6, Claude Sonnet 4.6 via Vercel AI Gateway, Exa AI, Tailwind v4, shadcn/ui, Vitest.

## Links

- Repo: https://github.com/NeryC/research-agent
- Demo: https://research-agent-three-pi.vercel.app

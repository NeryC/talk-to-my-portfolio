# RAG Agent with Memory

> PDF → pgvector → chat with citations + dual memory (short and long term).

## Problem

Build a full RAG pipeline that ingests user-uploaded PDFs, answers questions with verifiable page-level citations, falls back to web search when the documents don't cover the topic, and — crucially — remembers durable facts about the user across sessions. Two constraints made this non-trivial: Vercel Hobby's hard 10s function timeout (which kills background ingestion), and the fact that popular PDF libraries like `pdfjs-dist` crash on serverless Node because they rely on browser-only APIs like `DOMMatrix`.

## Decisions

- **Zero-dependency PDF parser using Node's built-in `zlib`** — instead of `pdf-parse`/`pdfjs-dist`, the extractor decompresses `FlateDecode` streams with `inflateSync` and pulls text from the `Tj`/`TJ` PostScript operators via regex. No npm install, no DOM dependencies, works in any serverless runtime.
- **Synchronous ingest inside the upload route** — the whole pipeline (download → extract → chunk → embed → store) runs inside `POST /api/upload` and returns `status: 'ready'`. For typical 1–10 page PDFs it finishes in 2–5s, well inside the 10s Hobby ceiling — no background workers, no KV polling.
- **Voyage AI `input_type` differentiation** — passing `"document"` at ingest and `"query"` at search time pushes relevant cosine similarities from a flat ~0.25 into the 0.5–0.8 range, while irrelevant pairs stay under threshold. One-line change, transformative on retrieval quality.
- **Dual memory** — short-term: top-5 pgvector chunks injected into the system prompt per query. Long-term: a background Haiku call extracts durable user facts (`confidence > 0.7`), embeds them, and stores them in a `memories` table. Next session's top-3 relevant memories are recalled automatically.
- **Anonymous HttpOnly cookie sessions** — UUID per user, 24h TTL, no login. Every document/chunk/memory is scoped by `session_id` so users are isolated without auth friction.

## Results

- Full pipeline live with chunking (~500 tokens, 50-token overlap), HNSW pgvector indexes, and SQL RPCs for similarity search
- Citations rendered inline as `[file.pdf p.N]` from the same retrieval that built the context
- Web fallback via Exa when documents are insufficient
- Up to 5 PDFs per session; conversations and memories persist for 24 hours

## Stack

Next.js 16 App Router, Vercel AI SDK v6 (`generateText` with tools + `generateObject` for memory), Claude Sonnet 4.6 (chat) + Haiku 4.5 (memory extraction), Voyage AI `voyage-3` embeddings, Supabase Postgres + pgvector, Vercel Blob (private), Exa AI, Tailwind v4.

## Links

- Repo: https://github.com/NeryC/rag-agent-memory
- Demo: https://rag-agent-memory.vercel.app

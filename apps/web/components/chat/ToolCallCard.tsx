"use client";

import { Card, CardContent } from "@/components/ui/card";
import { McpServerBadge } from "@/components/mcp/McpServerBadge";
import { ResourceViewer } from "@/components/mcp/ResourceViewer";
import { ChevronRight, Loader2 } from "lucide-react";
import { useState } from "react";

interface Props {
  toolName: string;
  state: string;
  input?: unknown;
  output?: unknown;
  errorText?: string;
  sourceServer?: string;
}

/**
 * Renders a single tool invocation surfaced from the AI SDK v6 UI message
 * stream. By default we show only a compact pill (tool name + status); the
 * raw JSON input/output is noise for end users and would dominate the chat
 * column. Clicking expands a `<details>`-style view with the args and a
 * truncated output preview for debugging.
 *
 * If the output references an MCP resource (`portfolio://...`) we render
 * it through ResourceViewer regardless of expanded state.
 */
export function ToolCallCard({
  toolName,
  state,
  input,
  output,
  errorText,
  sourceServer,
}: Props) {
  const [open, setOpen] = useState(false);
  const resource = extractResource(output);
  const isRunning =
    state === "input-streaming" ||
    state === "input-available" ||
    state === "executing";
  const isDone = state === "output-available";

  return (
    <Card size="sm" className="border-l-2 border-l-primary/40">
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex min-w-0 flex-1 items-center gap-1.5 text-left font-mono text-xs text-foreground hover:text-primary"
            aria-expanded={open}
          >
            <ChevronRight
              className={`size-3 shrink-0 transition-transform ${open ? "rotate-90" : ""}`}
            />
            <span className="truncate">{toolName}</span>
            {isRunning ? (
              <Loader2 className="size-3 shrink-0 animate-spin text-muted-foreground" />
            ) : isDone ? (
              <span className="shrink-0 text-[10px] text-emerald-600 dark:text-emerald-400">
                ✓
              </span>
            ) : null}
          </button>
          {sourceServer ? <McpServerBadge server={sourceServer} /> : null}
        </div>

        {errorText ? (
          <div className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">
            {errorText}
          </div>
        ) : null}

        {resource ? (
          <ResourceViewer
            uri={resource.uri}
            mimeType={resource.mimeType}
            text={resource.text}
          />
        ) : null}

        {open ? (
          <div className="space-y-2">
            {input !== undefined && input !== null ? (
              <div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  args
                </div>
                <pre className="mt-1 overflow-x-auto rounded-md bg-muted/40 p-2 text-[11px]">
                  <code>{safeStringify(input)}</code>
                </pre>
              </div>
            ) : null}
            {!resource && output !== undefined && output !== null ? (
              <div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  output
                </div>
                <pre className="mt-1 overflow-x-auto rounded-md bg-muted/30 p-2 text-[11px]">
                  <code>{previewOutput(output)}</code>
                </pre>
              </div>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function safeStringify(v: unknown): string {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

function previewOutput(v: unknown): string {
  const s = safeStringify(v);
  return s.length > 800 ? s.slice(0, 800) + "\n…" : s;
}

interface ResourceLike {
  uri: string;
  mimeType?: string;
  text?: string;
}

function extractResource(output: unknown): ResourceLike | null {
  if (!output || typeof output !== "object") return null;
  const o = output as Record<string, unknown>;
  if (typeof o.uri === "string" && o.uri.startsWith("portfolio://")) {
    return {
      uri: o.uri,
      mimeType: typeof o.mimeType === "string" ? o.mimeType : undefined,
      text: typeof o.text === "string" ? o.text : undefined,
    };
  }
  return null;
}

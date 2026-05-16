"use client";

import { Card, CardContent } from "@/components/ui/card";
import { McpServerBadge } from "@/components/mcp/McpServerBadge";
import { ResourceViewer } from "@/components/mcp/ResourceViewer";
import { ChevronRight } from "lucide-react";
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
 * stream. Args collapse into a `<details>`; output renders inline.
 *
 * If the output references an MCP resource (`portfolio://...`) we lazy-render
 * it through ResourceViewer to keep the rich-text view consistent.
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

  return (
    <Card size="sm" className="border-l-2 border-l-primary/40">
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-1 font-mono text-xs text-foreground hover:text-primary"
              aria-expanded={open}
            >
              <ChevronRight
                className={`size-3 transition-transform ${open ? "rotate-90" : ""}`}
              />
              {toolName}
            </button>
            <span className="text-[10px] text-muted-foreground">{state}</span>
          </div>
          {sourceServer ? <McpServerBadge server={sourceServer} /> : null}
        </div>

        {open ? (
          <pre className="overflow-x-auto rounded-md bg-muted/40 p-2 text-[11px]">
            <code>{safeStringify(input)}</code>
          </pre>
        ) : null}

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
        ) : output !== undefined && output !== null ? (
          <pre className="overflow-x-auto rounded-md bg-muted/30 p-2 text-[11px]">
            <code>{previewOutput(output)}</code>
          </pre>
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

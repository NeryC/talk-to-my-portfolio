"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  uri: string;
  mimeType?: string;
  text?: string;
}

/**
 * Inline renderer for MCP resource payloads referenced by a `portfolio://` URI.
 * Routes by mime type — markdown via react-markdown, JSON via pretty-print,
 * everything else falls through to plain text.
 */
export function ResourceViewer({ uri, mimeType, text }: Props) {
  if (text === undefined || text === null) return null;

  const mt = (mimeType ?? "text/plain").toLowerCase();

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
      <div className="mb-2 font-mono text-[11px] text-muted-foreground">
        {uri}
      </div>
      {mt === "text/markdown" ? (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
        </div>
      ) : mt === "application/json" ? (
        <pre className="overflow-x-auto rounded-md bg-background/60 p-2 text-xs">
          <code>{tryFormatJson(text)}</code>
        </pre>
      ) : (
        <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs">
          {text}
        </pre>
      )}
    </div>
  );
}

function tryFormatJson(text: string): string {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}

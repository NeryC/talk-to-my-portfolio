"use client";

import type { UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface Props {
  messages: UIMessage[];
  isStreaming?: boolean;
}

/**
 * Decide whether a message part should appear in the chat. We hide all tool
 * call traces (`dynamic-tool`, `tool-*`) and the model's reasoning, since
 * those are implementation details — visitors only need the final assistant
 * text. The agent still calls tools internally; we just don't surface them.
 */
function isVisiblePart(part: UIMessage["parts"][number]): boolean {
  return part.type === "text";
}

export function MessageList({ messages, isStreaming }: Props) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isStreaming]);

  // Skip messages whose only content is tool calls / reasoning. This avoids
  // empty grey bubbles while the agent is mid-tool-call (e.g. between the
  // user message and the first text token of the assistant reply).
  const visibleMessages = messages.filter((m) => m.parts.some(isVisiblePart));

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      {visibleMessages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
      {isStreaming ? (
        <div className="text-xs text-muted-foreground">…</div>
      ) : null}
      <div ref={endRef} />
    </div>
  );
}

function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-1",
        isUser ? "items-end" : "items-start",
      )}
    >
      <div
        className={cn(
          "min-w-0 rounded-lg px-3 py-2 text-sm",
          // User messages stay narrow ("speech bubble"); assistant messages
          // take the full width so wide content (tables, code) doesn't get
          // squeezed into a 85% column inside the 380px widget iframe.
          isUser
            ? "max-w-[85%] bg-primary text-primary-foreground shadow-sm"
            : "w-full border border-border bg-card text-card-foreground",
        )}
      >
        {message.parts.filter(isVisiblePart).map((part, i) => (
          <PartRenderer key={i} part={part} />
        ))}
      </div>
    </div>
  );
}

function PartRenderer({ part }: { part: UIMessage["parts"][number] }) {
  if (part.type === "text") {
    return (
      <div
        className={cn(
          "prose prose-sm dark:prose-invert max-w-none",
          // Tables wider than the widget column scroll horizontally instead
          // of being squashed and breaking words mid-character (which made
          // "Proficient" render as "Profic / ient" at 360px width).
          //   - prose-table:block + overflow-x-auto: the table itself scrolls
          //   - default cell wrapping: words break at spaces, not characters
          //   - inline <code> falls back to break-words for long no-space tokens
          //   - <pre> blocks keep their own internal scroll
          "prose-table:block prose-table:overflow-x-auto",
          "[&_td]:align-top [&_td]:px-2 [&_th]:px-2",
          "[&_code]:break-words",
          "[&_pre]:overflow-x-auto [&_pre]:whitespace-pre-wrap",
        )}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{part.text}</ReactMarkdown>
      </div>
    );
  }
  // Tool calls and reasoning parts are intentionally not rendered — see
  // isVisiblePart above. This branch only fires if a new part type appears.
  return null;
}

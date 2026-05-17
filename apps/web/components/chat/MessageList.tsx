"use client";

import type { UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
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

  const hasThinkingIndicator =
    isStreaming &&
    // Show a typing indicator while the agent is running a tool / thinking,
    // i.e. the last visible message is still from the user OR the assistant
    // message has no text content yet.
    (visibleMessages.length === 0 ||
      visibleMessages[visibleMessages.length - 1]?.role === "user");

  return (
    <div className="flex flex-col gap-5 px-4 py-5">
      {visibleMessages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
      {hasThinkingIndicator ? <ThinkingIndicator /> : null}
      <div ref={endRef} />
    </div>
  );
}

function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  if (isUser) {
    return (
      <div className="flex animate-fade-up justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-sm text-primary-foreground shadow-[0_4px_12px_-4px_rgba(46,117,182,0.55)]">
          {message.parts.filter(isVisiblePart).map((part, i) => (
            <PartRenderer key={i} part={part} />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="flex animate-fade-up min-w-0 items-start gap-2.5">
      <AssistantAvatar />
      <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md border border-border bg-card/80 px-3.5 py-2.5 text-sm text-card-foreground shadow-sm backdrop-blur-sm">
        {message.parts.filter(isVisiblePart).map((part, i) => (
          <PartRenderer key={i} part={part} />
        ))}
      </div>
    </div>
  );
}

function AssistantAvatar() {
  return (
    <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-md shadow-primary/30 ring-1 ring-primary/20">
      <Sparkles className="size-3.5" />
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex items-start gap-2.5">
      <AssistantAvatar />
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-border bg-card/80 px-3.5 py-3 backdrop-blur-sm">
        <span className="size-1.5 animate-[bounce_1.2s_infinite_0ms] rounded-full bg-muted-foreground/70" />
        <span className="size-1.5 animate-[bounce_1.2s_infinite_150ms] rounded-full bg-muted-foreground/70" />
        <span className="size-1.5 animate-[bounce_1.2s_infinite_300ms] rounded-full bg-muted-foreground/70" />
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

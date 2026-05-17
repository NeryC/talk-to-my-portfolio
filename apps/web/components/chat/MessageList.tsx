"use client";

import type { UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ToolCallCard } from "./ToolCallCard";

interface Props {
  messages: UIMessage[];
  isStreaming?: boolean;
}

export function MessageList({ messages, isStreaming }: Props) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isStreaming]);

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      {messages.map((m) => (
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
          // take the full width so wide content (tables, code, tool cards)
          // doesn't get squeezed into a 85% column inside an already-narrow
          // 360px widget iframe.
          isUser ? "max-w-[85%] bg-primary text-primary-foreground" : "w-full bg-muted text-foreground",
        )}
      >
        {message.parts.map((part, i) => (
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
          // Markdown tables overflow narrow widget columns when cells contain
          // inline code (which is no-wrap by default). Make the whole table
          // scroll horizontally rather than blow out the layout, and let
          // inline code wrap at any character.
          "prose-table:block prose-table:overflow-x-auto prose-table:whitespace-normal",
          "[&_code]:break-words [&_code]:[overflow-wrap:anywhere]",
          "[&_pre]:overflow-x-auto [&_pre]:whitespace-pre-wrap",
          "[&_td]:align-top [&_td]:[overflow-wrap:anywhere]",
          "[&_th]:[overflow-wrap:anywhere]",
        )}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{part.text}</ReactMarkdown>
      </div>
    );
  }
  if (part.type === "reasoning") {
    return (
      <details className="text-xs text-muted-foreground">
        <summary className="cursor-pointer">reasoning</summary>
        <pre className="mt-1 whitespace-pre-wrap text-[11px]">{part.text}</pre>
      </details>
    );
  }
  if (part.type === "dynamic-tool") {
    return (
      <ToolCallCard
        toolName={part.toolName}
        state={part.state}
        input={"input" in part ? part.input : undefined}
        output={"output" in part ? part.output : undefined}
        errorText={"errorText" in part ? part.errorText : undefined}
        sourceServer={extractServer(part.toolName)}
      />
    );
  }
  if (typeof part.type === "string" && part.type.startsWith("tool-")) {
    const p = part as {
      type: string;
      state: string;
      input?: unknown;
      output?: unknown;
      errorText?: string;
    };
    const toolName = p.type.slice("tool-".length);
    return (
      <ToolCallCard
        toolName={toolName}
        state={p.state}
        input={p.input}
        output={p.output}
        errorText={p.errorText}
        sourceServer={extractServer(toolName)}
      />
    );
  }
  return null;
}

function extractServer(toolName: string): string | undefined {
  const idx = toolName.indexOf("__");
  if (idx < 0) return undefined;
  return toolName.slice(0, idx);
}

"use client";

import { useChat } from "@/hooks/useChat";
import { ElicitationForm } from "@/components/mcp/ElicitationForm";
import { SamplingIndicator } from "@/components/mcp/SamplingIndicator";
import { EmptyState } from "./EmptyState";
import { InputBar } from "./InputBar";
import { MessageList } from "./MessageList";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface Props {
  mode: "widget" | "demo";
  initialMessage?: string;
  className?: string;
}

export function ChatShell({ mode, initialMessage, className }: Props) {
  const {
    messages,
    status,
    sendMessage,
    stop,
    overlay,
    resolveElicitation,
  } = useChat();

  // Auto-send a chip-initiated message exactly once on mount.
  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      void sendMessage({ text: initialMessage });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isStreaming = status === "submitted" || status === "streaming";

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden bg-background",
        // Both modes fill their container. The widget mode used to set a
        // fixed 360x520 panel, but the FAB iframe in packages/widget already
        // controls the outer dimensions and rounded border — having a second
        // bordered panel inside leaves dead space at the edges.
        "h-full w-full",
        className,
      )}
    >
      {mode === "widget" ? (
        <header className="relative flex items-center gap-2.5 border-b border-border bg-gradient-to-b from-card/60 to-transparent px-4 py-3 text-sm backdrop-blur-md">
          <div className="relative flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-md shadow-primary/30 ring-1 ring-primary/20">
            <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(74,222,128,0.8)] ring-2 ring-card" />
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
              <path d="M9.937 15.5A2 2 0 0 1 8.5 14.063L7 9l-1.5 5.063A2 2 0 0 1 4.063 15.5L-1 17l5.063 1.5A2 2 0 0 1 5.5 19.937L7 25l1.5-5.063A2 2 0 0 1 9.937 18.5L15 17l-5.063-1.5Zm9-5L17.5 5l-1.437 4.5A2 2 0 0 1 14.5 10.937L10 12.5l4.5 1.563a2 2 0 0 1 1.563 1.437L17.5 20l1.437-4.5A2 2 0 0 1 20.437 14.063L25 12.5l-4.563-1.563a2 2 0 0 1-1.437-1.437Z" />
            </svg>
          </div>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate font-semibold text-foreground">
              Nery&apos;s portfolio
            </span>
            <span className="truncate text-[10px] text-muted-foreground">
              MCP-powered · grounded in real data
            </span>
          </div>
          <span className="ml-auto rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-emerald-300">
            online
          </span>
        </header>
      ) : null}
      {mode === "demo" ? (
        <header className="flex items-center justify-between border-b border-border px-4 py-2 text-sm">
          <span className="font-medium">Talk to my portfolio</span>
          <span className="text-xs text-muted-foreground">demo</span>
        </header>
      ) : null}

      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && !isStreaming ? (
          <EmptyState onPick={(text) => void sendMessage({ text })} />
        ) : (
          <MessageList messages={messages} isStreaming={isStreaming} />
        )}
        {overlay.isSampling ? (
          <div className="px-4 pb-2">
            <SamplingIndicator />
          </div>
        ) : null}
      </div>

      {overlay.elicitation ? (
        <div className="border-t border-border bg-muted/30 p-3">
          <ElicitationForm
            // The schema shape is unknown at the protocol level; the form
            // tolerates the minimal { type:"object", properties, required }.
            schema={overlay.elicitation.schema as never}
            message={overlay.elicitation.message}
            onSubmit={(values) => resolveElicitation(values)}
            onCancel={() => resolveElicitation(null)}
          />
        </div>
      ) : null}

      <InputBar
        onSubmit={(text) => void sendMessage({ text })}
        onStop={() => void stop()}
        isStreaming={isStreaming}
        disabled={isStreaming}
      />
    </div>
  );
}

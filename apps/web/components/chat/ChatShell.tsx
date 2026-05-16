"use client";

import { useChat } from "@/hooks/useChat";
import { ElicitationForm } from "@/components/mcp/ElicitationForm";
import { SamplingIndicator } from "@/components/mcp/SamplingIndicator";
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
        mode === "demo"
          ? "h-full w-full"
          : "h-[520px] w-[360px] rounded-xl border border-border shadow-lg",
        className,
      )}
    >
      {mode === "demo" ? (
        <header className="flex items-center justify-between border-b border-border px-4 py-2 text-sm">
          <span className="font-medium">Talk to my portfolio</span>
          <span className="text-xs text-muted-foreground">demo</span>
        </header>
      ) : null}

      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} isStreaming={isStreaming} />
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

"use client";

import { useChat as useChatBase } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { DefaultChatTransport } from "ai";
import { useMemo, useState } from "react";

/**
 * Elicitation request surfaced from the MCP bridge as a UI overlay.
 * Phase 6 wires the data shape — actual stream-part decoding lands when
 * the MCP bridges expose elicitation/sampling as UI message stream parts.
 */
export interface ElicitationRequest {
  id: string;
  schema: unknown;
  message?: string;
}

export interface ChatOverlayState {
  elicitation: ElicitationRequest | null;
  isSampling: boolean;
}

export interface UseChatResult {
  messages: UIMessage[];
  status: ReturnType<typeof useChatBase>["status"];
  error: Error | undefined;
  sendMessage: ReturnType<typeof useChatBase>["sendMessage"];
  stop: () => Promise<void>;
  overlay: ChatOverlayState;
  resolveElicitation: (values: Record<string, unknown> | null) => void;
}

/**
 * Thin wrapper around `@ai-sdk/react`'s `useChat` that exposes the streaming
 * primitives plus a placeholder overlay state for MCP elicitation/sampling.
 *
 * Bridges aren't yet surfaced via UI message stream parts; consumers can read
 * `overlay` to render the ElicitationForm / SamplingIndicator, but the events
 * are stubbed until the protocol wiring lands.
 */
export function useChat(api = "/api/agent"): UseChatResult {
  const transport = useMemo(() => new DefaultChatTransport({ api }), [api]);
  const { messages, status, error, sendMessage, stop } = useChatBase({
    transport,
  });

  const [elicitation, setElicitation] = useState<ElicitationRequest | null>(
    null,
  );
  const [isSampling] = useState(false);

  const resolveElicitation = (_values: Record<string, unknown> | null) => {
    setElicitation(null);
  };

  return {
    messages,
    status,
    error,
    sendMessage,
    stop,
    overlay: { elicitation, isSampling },
    resolveElicitation,
  };
}

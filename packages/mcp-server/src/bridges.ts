export interface SamplingBridge {
  (req: {
    messages: { role: "user"; content: { type: "text"; text: string } }[];
    maxTokens: number;
  }): Promise<{ content: { type: "text"; text: string } }>;
}

export interface ElicitationBridge {
  (req: {
    message: string;
    requestedSchema: Record<string, unknown>;
  }): Promise<{
    action: "accept" | "decline" | "cancel";
    content?: Record<string, unknown>;
  }>;
}

interface SamplingRequest {
  messages: { role: "user" | "assistant"; content: { type: "text"; text: string } }[];
  maxTokens: number;
  modelPreferences?: unknown;
}
interface SamplingResponse {
  content: { type: "text"; text: string };
  model?: string;
  stopReason?: string;
}

interface ElicitationRequest {
  message: string;
  requestedSchema: Record<string, unknown>;
}
interface ElicitationResponse {
  action: "accept" | "decline" | "cancel";
  content?: Record<string, unknown>;
}

interface Capabilities {
  sampling?: object;
  elicitation?: object;
}

export class MockMcpClient {
  private capabilities: Capabilities;
  private samplingHandler?: (req: SamplingRequest) => Promise<SamplingResponse>;
  private elicitationHandler?: (req: ElicitationRequest) => Promise<ElicitationResponse>;
  private recorded: { kind: "sampling" | "elicitation"; payload: unknown }[] = [];

  constructor(opts: { capabilities: Capabilities }) {
    this.capabilities = opts.capabilities;
  }

  supportsSampling(): boolean {
    return !!this.capabilities.sampling;
  }
  supportsElicitation(): boolean {
    return !!this.capabilities.elicitation;
  }

  onSampling(handler: (req: SamplingRequest) => Promise<SamplingResponse>) {
    this.samplingHandler = handler;
  }
  onElicitation(handler: (req: ElicitationRequest) => Promise<ElicitationResponse>) {
    this.elicitationHandler = handler;
  }

  async simulateSampling(req: SamplingRequest): Promise<SamplingResponse> {
    if (!this.supportsSampling()) throw new Error("client does not support sampling");
    if (!this.samplingHandler) throw new Error("no sampling handler set");
    this.recorded.push({ kind: "sampling", payload: req });
    return this.samplingHandler(req);
  }
  async simulateElicitation(req: ElicitationRequest): Promise<ElicitationResponse> {
    if (!this.supportsElicitation()) throw new Error("client does not support elicitation");
    if (!this.elicitationHandler) throw new Error("no elicitation handler set");
    this.recorded.push({ kind: "elicitation", payload: req });
    return this.elicitationHandler(req);
  }

  getRecordedRequests() {
    return [...this.recorded];
  }
  clearRecorded() {
    this.recorded = [];
  }
}

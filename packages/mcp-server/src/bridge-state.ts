import type { SamplingBridge, ElicitationBridge } from "./bridges.js";

export interface BridgeState {
  samplingBridge: SamplingBridge | null;
  elicitationBridge: ElicitationBridge | null;
  clientSupportsSampling: boolean;
  clientSupportsElicitation: boolean;
}

let _state: BridgeState = {
  samplingBridge: null,
  elicitationBridge: null,
  clientSupportsSampling: false,
  clientSupportsElicitation: false,
};

export function configureBridges(next: BridgeState): void {
  _state = next;
}

export function getBridgeState(): BridgeState {
  return _state;
}

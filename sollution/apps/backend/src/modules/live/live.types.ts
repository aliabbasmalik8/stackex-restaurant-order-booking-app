import type { AppEventMap, AppEventName } from '../events';

export type LivePingMessage = {
  type: 'ping';
  at: string;
};

/** One catalog event forwarded to SSE clients. */
export type LiveChangeMessage = {
  [K in AppEventName]: {
    type: K;
    payload: AppEventMap[K];
    at: string;
  };
}[AppEventName];

export type LiveStreamMessage = LivePingMessage | LiveChangeMessage;

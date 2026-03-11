// ─────────────────────────────────────────────────────────────────────────────
// services/websocket/index.ts
// Public surface of the websocket service layer.
// Import from here – never reach into sub-modules directly.
// ─────────────────────────────────────────────────────────────────────────────

import { WsManager, wsManager } from "./WsManager";

 
export { wsManager, WsManager } ;
export type {
  WsSubscribeMessage,
  MarketTick,
  RawTickFrame,
  TickHandler,
  LifecycleHandler,
  WsLifecycleEvent,
} from "./types";
export {
  WS_BASE_URL,
  PING_INTERVAL_MS,
  PONG_TIMEOUT_MS,
  RECONNECT_MAX_ATTEMPTS,
  DEFAULT_SUBSCRIPTIONS,
  getReconnectDelay,
} from "./config";
export {
  parseRawFrame,
  isPong,
  isErrorFrame,
  extractTicks,
  normaliseTick,
} from "./messageParser";

import { useEffect, useRef } from "react";
import { useMarketStore } from "@/store";
import { 
  parseRawFrame, 
  isPong, 
  extractTicks, 
  normaliseTick 
} from "@/services/websocket/messageParser";
import {
  getReconnectDelay,
  PING_INTERVAL_MS,
  PONG_TIMEOUT_MS,
  SERVER_URL,
} from "@/services/websocket/reconnectStrategy";

export function useWebSocket() {
  const wsRef         = useRef<WebSocket | null>(null);
  const retryRef      = useRef(0);
  const retryTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingTimer     = useRef<ReturnType<typeof setInterval> | null>(null);
  const pongTimer     = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { setStock, setOrderBook, setConnected, addEvent } = useMarketStore.getState();

  function stopHeartbeat() {
    if (pingTimer.current) { clearInterval(pingTimer.current); pingTimer.current = null; }
    if (pongTimer.current) { clearTimeout(pongTimer.current);  pongTimer.current = null; }
  }

  function startHeartbeat(ws: WebSocket) {
    stopHeartbeat();
    pingTimer.current = setInterval(() => {
      if (ws.readyState !== WebSocket.OPEN) return;
      ws.send(JSON.stringify({ type: "PING", ts: Date.now() }));
      addEvent("PING sent", "ping");
      pongTimer.current = setTimeout(() => {
        console.warn("[WS] PONG timeout — closing zombie socket");
        ws.close();
      }, PONG_TIMEOUT_MS);
    }, PING_INTERVAL_MS);
  }

  function connect() {
    const ws = new WebSocket(SERVER_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      retryRef.current = 0;
      addEvent("Connected to " + SERVER_URL, "connect");
      startHeartbeat(ws);
    };

    ws.onmessage = (event: MessageEvent) => {
      const frame = parseRawFrame(event.data as string);
      if (!frame) return;

      // 1. Handle Heartbeat using isPong helper
      if (isPong(frame)) {
        if (pongTimer.current) { 
          clearTimeout(pongTimer.current); 
          pongTimer.current = null; 
        }
        addEvent("PONG received", "ping");
        return;
      }

      // 2. Handle Stock Updates using extractTicks helper
      const ticks = extractTicks(frame);
      if (ticks.length > 0) {
        ticks.forEach((rawTick) => {
          const cleanTick = normaliseTick(rawTick);
          
          // Map to your store's "Stock" type
        setStock({
          symbol: cleanTick.token,
          name: cleanTick.token, 
          price: cleanTick.ltp,
          change: cleanTick.change,
          changePercent: cleanTick.changePercent,
          prevClose: cleanTick.close,
          // Add these to fix the TS2345 error:
          open: cleanTick.open,
          high: cleanTick.high,
          low: cleanTick.low,
          volume: cleanTick.volume,
          sector: "N/A" 
        });

          addEvent(`${cleanTick.token} → ₹${cleanTick.ltp.toFixed(2)}`, "price");
        });
        return;
      }

      // 3. Handle Order Book
      const f = frame as Record<string, any>;
      if (f.type === "ORDER_BOOK") {
        setOrderBook({ symbol: f.symbol, bids: f.bids, asks: f.asks });
        return;
      }
    };

    ws.onclose = () => {
      setConnected(false);
      stopHeartbeat();
      const delay = getReconnectDelay(retryRef.current);
      retryRef.current += 1;
      addEvent(`Disconnected. Retrying in ${(delay / 1000).toFixed(1)}s…`, "disconnect");
      retryTimer.current = setTimeout(connect, delay);
    };

    ws.onerror = () => addEvent("WebSocket error", "error");
  }

  useEffect(() => {
    connect();
    return () => {
      stopHeartbeat();
      if (retryTimer.current) clearTimeout(retryTimer.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, []);

  function send(data: object) {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }

  return { send };
}
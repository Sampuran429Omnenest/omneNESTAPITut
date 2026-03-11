// ─────────────────────────────────────────────────────────────────────────────
// App.tsx  (updated)
// Wires authentication → live WebSocket connection → tab layout
// ─────────────────────────────────────────────────────────────────────────────
 
import { useState, useEffect } from "react";
 
// Existing local WebSocket (simulated data)
import { useWebSocket } from "@/shared/hooks/useWebSocket";
 
// ★ NEW: live market WebSocket hook
import { useLiveMarketWs } from "@/shared/hooks/useLiveMarketWs";
 
import { Header } from "@/shared/components/Header";
import { NotificationStack } from "@/shared/components/NotificationStack";
import { DashboardPage } from "@/pages/DashboardPage";
import { PortfolioPage } from "@/features/portfolio-overview/PortfolioPage";
import { OrderBookPage } from "@/features/order-book/OrderBookPage";
import { WatchlistPage } from "@/features/dashboard/WatchlistPage";
import { LoginPage } from "./features/auth/Login";
import { useUIStore } from "@/store/ui.store";
import { DashboardHeader } from "@/shared/components/DashboardHeader";
 
// ★ NEW: connection status badge
import { WsStatusBadge } from "@/shared/components/WsStatusBadge";
import { wsManager } from "@/services/websocket";
 
// ─── Token → clientCode helper ────────────────────────────────────────────────
 
function getClientCodeFromToken(token: string | null): string {
  if (!token) return "";
  try {
    // JWT payload is the second segment, base64-url encoded
    const payload = JSON.parse(atob(token.split(".")[1]));
    // OmneNest JWTs carry "clientCode" in the payload
    return (payload.clientCode ?? payload.sub ?? "") as string;
  } catch {
    // Fallback: if we can't parse the JWT, use a stored value
    return localStorage.getItem("client_code") ?? "";
  }
}
 
// ─── Root component ────────────────────────────────────────────────────────────
 
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [clientCode, setClientCode]           = useState("");
 
  useEffect(() => {
    const token = localStorage.getItem("bearer_token");
    if (token) {
      setIsAuthenticated(true);
      setClientCode(getClientCodeFromToken(token));
    }
  }, []);
 
  // ── Simulated local WebSocket (existing behaviour, unchanged)
  useWebSocket();
 
  // ── ★ Live OmneNest WebSocket (only when authenticated)
  useLiveMarketWs({
    clientCode,
    extraSubscriptions: [
      { exchange: "NSE_CM", tokens: ["11377"] }, // HDFCBANK
    ],
  });
 
  const activeTab    = useUIStore((s) => s.activeTab);
 
  const renderTab = () => {
    switch (activeTab) {
      case "dashboard":  return <DashboardPage />;
      case "portfolio":  return <PortfolioPage />;
      case "orderbook":  return <OrderBookPage />;
      case "watchlist":  return <WatchlistPage />;
      default:           return <DashboardPage />;
    }
  };
 
  if (!isAuthenticated) {
    return (
      <LoginPage
        onLoginSuccess={() => {
          const token = localStorage.getItem("bearer_token");
          setClientCode(getClientCodeFromToken(token));
          setIsAuthenticated(true);
        }}
      />
    );
  }
 
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100vh", overflow: "hidden",
      background: "var(--bg-void)",
    }}>
      <DashboardHeader />
      <Header />
 
      <main style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        {renderTab()}
      </main>
 
      <footer style={{
        padding: "4px 20px",
        borderTop: "1px solid var(--border)",
        background: "var(--bg-panel)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: "9px", color: "var(--text-muted)",
        fontFamily: "var(--font-mono)", letterSpacing: "0.5px",
        flexShrink: 0,
      }}>
        {/* Left: simulated server info */}
        <span>ws://localhost:8080 · Simulated data — for learning only</span>
 
        {/* Right: ★ live WebSocket status */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span>wss://preprodapisix.omnenest.com · Live</span>
          <WsStatusBadge
            showRetry
            onRetry={() => wsManager.connect(clientCode)}
          />
        </div>
      </footer>
 
      <NotificationStack />
    </div>
  );
}
 

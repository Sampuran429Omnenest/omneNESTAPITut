import { useWebSocket } from "@/shared/hooks/useWebSocket";
import { Header } from "@/shared/components/Header";
import { NotificationStack } from "@/shared/components/NotificationStack";
import { DashboardPage } from "@/pages/DashboardPage";
import { PortfolioPage } from "@/features/portfolio-overview/PortfolioPage";
import { OrderBookPage } from "@/features/order-book/OrderBookPage";
import { WatchlistPage } from "@/features/dashboard/WatchlistPage";
import { useUIStore } from "@/store/ui.store";
import { useState } from "react";
import { LoginPage } from "./features/auth/Login";
import { DashboardHeader } from "./shared/components/DashboardHeader";

// 1. Create a sub-component for the Authenticated View
const AuthenticatedApp = () => {
  // This hook now only runs once this component is mounted (after login)
  useWebSocket();

  const activeTab = useUIStore((s) => s.activeTab);

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard":  return <DashboardPage />;
      case "portfolio":  return <PortfolioPage />;
      case "orderbook":  return <OrderBookPage />;
      case "watchlist":  return <WatchlistPage />;
      default:           return <DashboardPage />;
    }
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100vh", overflow: "hidden",
      background: "var(--bg-void)",
    }}>
      <DashboardHeader/>
      <Header />
      <main style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        {renderTab()}
      </main>
      <footer style={{
        padding: "4px 20px",
        borderTop: "1px solid var(--border)",
        background: "var(--bg-panel)",
        display: "flex", justifyContent: "space-between",
        fontSize: "9px", color: "var(--text-muted)",
        fontFamily: "var(--font-mono)", letterSpacing: "0.5px",
        flexShrink: 0,
      }}>
        <span>ws://localhost:8080</span>
        <span>omneNEST · Simulated data</span>
      </footer>
      <NotificationStack />
    </div>
  );
};

// 2. Main App Component
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!localStorage.getItem('bearer_token')
  );

  // If not authenticated, show ONLY the login page
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // If authenticated, show the AuthenticatedApp (which triggers WebSocket)
  return <AuthenticatedApp />;
}
import { useEffect, useMemo } from "react";
import { useUIStore } from "@/store/ui.store";
import { useMarketStore } from "@/store";
import { formatPrice, formatPercent } from "@/shared/utils";
import { Sparkline } from "@/widgets/ChartContainer/Sparkline";
import { fetchWatchList, fetchWatchlistScripts } from "@/services/api/watchlist";

export function WatchlistPage() {
  /** STORE */
  const watchlists = useUIStore((s) => s.watchlists);
  const selectedWatchlistId = useUIStore((s) => s.selectedWatchlistId);
  const watchlistScripts = useUIStore((s) => s.watchlistScripts);

  const setWatchlists = useUIStore((s) => s.setWatchlists);
  const setSelectedWatchlist = useUIStore((s) => s.setSelectedWatchlist);
  const setWatchlistScripts = useUIStore((s) => s.setWatchlistScripts);

  const removeFromWatchlist = useUIStore((s) => s.removeFromWatchlist);
  const setActiveTab = useUIStore((s) => s.setActiveTab);

  const stocks = useMarketStore((s) => s.stocks);
  const priceHistory = useMarketStore((s) => s.priceHistory);
  const setSelected = useMarketStore((s) => s.setSelected);
  const setStock = useMarketStore((s) => s.setStock);

  /** LOAD WATCHLISTS */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchWatchList();

        const all = [
          ...res.userDefinedWatchlists,
          ...res.predefinedWatchlists,
        ];

        setWatchlists(all);

        if (res.defaultWatchlistId) {
          setSelectedWatchlist(res.defaultWatchlistId);
        }
      } catch (error) {
        console.error("Failed to load watchlists", error);
      }
    };

    load();
  }, []);

  /** LOAD SCRIPTS */
  useEffect(() => {
    if (!selectedWatchlistId) return;

    const loadScripts = async () => {
      try {
        const res = await fetchWatchlistScripts(selectedWatchlistId);
        setWatchlistScripts(res.scrips || []);
      } catch (error) {
        console.error("Failed to load scripts", error);
      }
    };

    loadScripts();
  }, [selectedWatchlistId]);

  /** MAP DATA */
  const items = useMemo(() => {
    return watchlistScripts.map((s) => {
      const live = stocks[s.symbolName];

      const price =
        live?.price ??
        s.lastTradedPrice ??
        s.previousClosePrice ??
        0;

      const changePercent =
        live?.changePercent ??
        (s.previousClosePrice
          ? ((price - s.previousClosePrice) / s.previousClosePrice) * 100
          : 0);

      return {
        symbol: s.symbolName,
        name: s.companyName,
        price,
        changePercent,
      };
    });
  }, [watchlistScripts, stocks]);

  /** CLICK HANDLER (FIXED) */
  const handleClick = (symbol: string, name: string, price: number, changePercent: number) => {
    // ensure exists in market store
    if (!stocks[symbol]) {
      setStock({
        symbol,
        name,
        price,
        change: 0,
        changePercent,
        open: price,
        high: price,
        low: price,
        prevClose: price,
        volume: 0,
      });
    }

    setSelected(symbol);
    setActiveTab("dashboard");
  };

  /** UI */
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
      {/* HEADER */}
      <div style={{ marginBottom: "16px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "700" }}>Watchlist</h2>
        <div style={{ fontSize: "11px", opacity: 0.7 }}>
          {items.length} stocks being tracked
        </div>
      </div>

      {/* WATCHLIST TABS */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "18px" }}>
        {watchlists.map((wl) => (
          <button
            key={wl.watchlistId}
            onClick={() => setSelectedWatchlist(wl.watchlistId)}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: "1px solid var(--border)",
              background:
                selectedWatchlistId === wl.watchlistId
                  ? "var(--bg-panel)"
                  : "transparent",
              cursor: "pointer",
            }}
          >
            {wl.watchlistName}
          </button>
        ))}
      </div>

      {/* EMPTY */}
      {items.length === 0 ? (
        <div style={{ padding: "60px", textAlign: "center", opacity: 0.7 }}>
          No stocks in this watchlist
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "14px",
          }}
        >
          {items.map(({ symbol, name, price, changePercent }) => {
            const isPos = changePercent >= 0;

            const history = priceHistory[symbol];

            return (
              <div
                key={symbol}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  padding: "16px",
                  cursor: "pointer",
                }}
                onClick={() => handleClick(symbol, name, price, changePercent)}
              >
                {/* TOP */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "12px",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>{symbol}</div>
                    <div style={{ fontSize: "11px", opacity: 0.7 }}>{name}</div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWatchlist(symbol);
                    }}
                    style={{
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      fontSize: "16px",
                    }}
                  >
                    ×
                  </button>
                </div>

                {/* PRICE */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "18px", fontWeight: 700 }}>
                      {formatPrice(price)}
                    </div>

                    <span className={`badge ${isPos ? "badge-green" : "badge-red"}`}>
                      {formatPercent(changePercent)}
                    </span>
                  </div>

                  {/* ✅ FIXED SPARKLINE */}
                  <Sparkline
                    prices={history?.length ? history : [price, price, price]}
                    isGreen={isPos}
                    width={80}
                    height={36}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
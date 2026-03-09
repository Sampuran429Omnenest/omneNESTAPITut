import { getDashboardConfig } from "@/services/api/dashboard";
import { getMarketStatus } from "@/services/api/market";
import { memo, useEffect, useState } from "react";

interface DashboardFeature{
    name:string;
}

export const DashboardHeader=memo(function DashboardHeader(){
    const [features,setFeatures]=useState<DashboardFeature[]>([]);
    const [isMarketOpen,setIsMarketOpen]=useState<boolean>(false);
    const [loading,setLoading]=useState<boolean>(true);
    useEffect(()=>{
        const fetchHeaderConfig=async()=>{
            try {
                //run for both dashboard config and market status since market status do not require a seperate component
                const [configRes,marketRes]=await Promise.all([
                    getDashboardConfig(),
                    getMarketStatus()
                ]);
                if(configRes?.dashboard?.features){
                    setFeatures(configRes.dashboard.features);
                }
                const firstStatus=marketRes?.market_status?.[0]?.marketStatus || "";
                console.log(firstStatus);
                setIsMarketOpen(firstStatus.toLowerCase().includes("open"));
            } catch (error) {
                console.error("Dashboard config fetching error",error);
            } finally{
                setLoading(false);
            }
        };
        fetchHeaderConfig();
    },[])
    return(
        <header style={containerStyle}>
            <div style={logoStyle}>omneNEST</div>
            <nav style={navStyle}>
                {loading ? (
                    <span style={loadingStyle}>FETCHING_NAV...</span>
                ) : (
                    features.map((feature,idx)=>(
                        <div key={idx} style={itemStyle}>
                            {feature.name.toUpperCase()}
                        </div>
                    ))
                )}
            </nav>
            <div style={statusStyle}>
                <span style={{
                    color:isMarketOpen ? "#4caf50" : "#f44336",
                    marginRight:"4px"
                }}>
                    ●
                </span>
                MARKET_{isMarketOpen ? "OPEN" : "CLOSED"}
            </div>
        </header>
    );
});

const containerStyle: React.CSSProperties = {
    height: "32px",
    display: "flex",
    alignItems: "center",
    padding: "0 20px",
    background: "var(--bg-panel)",
    borderBottom: "1px solid var(--border)",
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    gap: "24px"
};

const logoStyle: React.CSSProperties = {
    color: "var(--accent-primary, #007acc)",
    fontWeight: "bold"
};

const navStyle: React.CSSProperties = {
    display: "flex",
    gap: "18px",
    flex: 1
};

const itemStyle: React.CSSProperties = {
    color: "var(--text-muted)",
    cursor: "pointer"
};

const statusStyle: React.CSSProperties = {
    color: "var(--text-main)",
    fontSize: "9px"
};

const loadingStyle: React.CSSProperties = {
    color: "var(--text-muted)",
    opacity: 0.5
};
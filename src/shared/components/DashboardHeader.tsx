import { getDashboardConfig } from "@/services/api/dashboard";
import { memo, useEffect, useState } from "react";

interface DashboardFeature{
    name:string;
}

export const DashboardHeader=memo(function DashboardHeader(){
    const [features,setFeatures]=useState<DashboardFeature[]>([]);
    const [loading,setLoading]=useState<boolean>(true);
    useEffect(()=>{
        const fetchHeaderConfig=async()=>{
            try {
                const response=await getDashboardConfig();
                if(response?.dashboard?.features){
                    setFeatures(response.dashboard.features);
                }
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
            <div style={statusStyle}>SYSTEM_READY</div>
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
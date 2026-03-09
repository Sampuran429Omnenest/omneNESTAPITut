import { login } from "@/services/api/login";
import { preAuthHandShake } from "@/services/api/preAuthHandshake";
import { validateOtp } from "@/services/api/validOtp";
import React, { useState } from "react";

interface LoginPageProps{
    onLoginSuccess:()=>void;
}
export const LoginPage=({onLoginSuccess}:LoginPageProps)=>{
    const [username,setUsername]=useState('AMITH1');
    const [password,setPassword]=useState('abc@12345');
    const [otp,setOtp]=useState('');
    const [step,setStep]=useState(1);
    const [loading,setLoading]=useState(false);
    
    const handleInitialAuth=async(e:React.FormEvent)=>{
        e.preventDefault();
        setLoading(true);
        try {
            await preAuthHandShake();
            await login(username,password);
            setStep(2);
        } catch  {
            alert("Login Failed");
        }finally{
            setLoading(false);
        }
    };

    const handleOtpVerify=async(e:React.FormEvent)=>{
        e.preventDefault();
        setLoading(true);
        try {
            const response=await validateOtp(username,otp);
            const token=response?.jwtTokens?.accessToken;
            if(token){
                console.log("Token is received");
                localStorage.setItem('bearer_token',token);
                onLoginSuccess();
            }
        } catch  {
            alert("Invalid Otp or connection error");
        }finally{
            setLoading(false);
        }
    }
     return (
        <div style={{
            display: "flex", 
            flexDirection: "column",
            height: "100vh", 
            overflow: "hidden",
            background: "var(--bg-void)",
            fontFamily: "var(--font-mono)",
        }}>
            {/* Centered Login Form Container */}
            <main style={{ 
                flex: 1, 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center",
                position: "relative" 
            }}>
                <div style={{
                    background: "var(--bg-panel)",
                    padding: "24px",
                    border: "1px solid var(--border)",
                    width: "100%",
                    maxWidth: "320px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px"
                }}>
                    <div style={{ 
                        fontSize: "11px", 
                        color: "var(--accent-primary, #007acc)", 
                        fontWeight: "bold",
                        letterSpacing: "1px"
                    }}>
                        {step === 1 ? "[ PHASE_01: AUTH ]" : "[ PHASE_02: OTP ]"}
                    </div>

                    {step === 1 ? (
                        <form onSubmit={handleInitialAuth} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>USER_ID</label>
                                <input 
                                    type="text" 
                                    value={username} 
                                    onChange={(e) => setUsername(e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>ACCESS_KEY</label>
                                <input 
                                    type="password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                            <button type="submit" disabled={loading} style={buttonStyle}>
                                {loading ? "VALIDATING..." : "EXECUTE_LOGIN"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleOtpVerify} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>OTP_CODE</label>
                                <input 
                                    type="text" 
                                    value={otp} 
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="******"
                                    style={{...inputStyle, textAlign: 'center', letterSpacing: '2px'}}
                                />
                            </div>
                            <button type="submit" disabled={loading} style={buttonStyle}>
                                {loading ? "VERIFYING..." : "GRANT_ACCESS"}
                            </button>
                            <span 
                                onClick={() => setStep(1)} 
                                style={{ 
                                    fontSize: "9px", 
                                    color: "var(--text-muted)", 
                                    cursor: "pointer", 
                                    textAlign: "center",
                                    marginTop: "8px",
                                    textDecoration: "underline"
                                }}
                            >
                                ABORT_AND_RETURN
                            </span>
                        </form>
                    )}
                </div>
            </main>

            {/* Terminal Style Footer */}
            <footer style={{
                padding: "4px 20px",
                borderTop: "1px solid var(--border)",
                background: "var(--bg-panel)",
                display: "flex", 
                justifyContent: "space-between",
                fontSize: "9px", 
                color: "var(--text-muted)",
                letterSpacing: "0.5px",
                flexShrink: 0,
            }}>
                <span>STATUS: {loading ? "BUSY" : "AWAITING_INPUT"}</span>
                <span>v1.0.4-stable</span>
            </footer>
        </div>
    );
};
const inputGroupStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "4px"
};

const labelStyle: React.CSSProperties = {
    fontSize: "9px",
    color: "var(--text-muted)",
};

const inputStyle: React.CSSProperties = {
    background: "rgba(0,0,0,0.2)",
    border: "1px solid var(--border)",
    padding: "8px",
    color: "var(--text-main)",
    fontFamily: "var(--font-mono)",
    fontSize: "12px",
    outline: "none",
};

const buttonStyle: React.CSSProperties = {
    background: "var(--accent-primary, #007acc)",
    color: "white",
    border: "none",
    padding: "10px",
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    cursor: "pointer",
    marginTop: "10px",
    transition: "opacity 0.2s"
};
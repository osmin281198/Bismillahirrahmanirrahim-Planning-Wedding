import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getRole } from "../lib/roles";

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap');
@keyframes fadeUp { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
@keyframes shimmer {
  0%{background-position:-200% center}100%{background-position:200% center}
}
`;

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [groom, setGroom]       = useState("");
  const [bride, setBride]       = useState("");
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = STYLES;
    document.head.appendChild(el);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const role = getRole(session.user.email);
        if (role === "family") navigate("/guests");
        else if (role === "admin") navigate("/dashboard");
      }
    });

    supabase.from("settings").select("groom, bride, photo_url").eq("id",1).single()
      .then(({ data }) => {
        if (data) { setGroom(data.groom||""); setBride(data.bride||""); setPhotoUrl(data.photo_url||""); }
      });

    return () => document.head.removeChild(el);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError("Email atau password salah."); setLoading(false); return; }
    const role = getRole(data.user.email);
    if (role === "family") navigate("/guests");
    else if (role === "admin") navigate("/dashboard");
    else { await supabase.auth.signOut(); setError("Akun tidak memiliki akses."); setLoading(false); }
  };

  const gold = "#C4A45A";

  return (
    <div style={{ minHeight:"100vh", display:"flex", fontFamily:"'Inter',sans-serif",
      background:"linear-gradient(135deg,#0F172A 0%,#1E293B 60%,#0F2744 100%)" }}>

      {/* Kiri — Foto & Branding */}
      <div className="hidden md:flex" style={{
        width:"45%", flexDirection:"column", alignItems:"center", justifyContent:"center",
        padding:"48px 40px", position:"relative", overflow:"hidden",
        borderRight:"1px solid rgba(196,164,90,0.15)",
      }}>
        {/* Background pattern */}
        <div style={{ position:"absolute", inset:0, opacity:0.04,
          backgroundImage:"radial-gradient(circle,white 1px,transparent 1px)",
          backgroundSize:"28px 28px" }} />

        {/* Foto */}
        <div style={{ position:"relative", marginBottom:32, animation:"fadeUp 0.8s ease both" }}>
          {photoUrl ? (
            <div style={{ position:"relative" }}>
              <div style={{
                position:"absolute", inset:-3, borderRadius:20,
                background:"linear-gradient(135deg,#C4A45A,#E8CC8A,#C4A45A)",
                backgroundSize:"200% 200%", animation:"shimmer 3s linear infinite",
              }} />
              <img src={photoUrl} alt="Foto Pasangan" style={{
                position:"relative", width:280, height:320,
                objectFit:"cover", borderRadius:18, display:"block",
                boxShadow:"0 24px 64px rgba(0,0,0,0.5)",
              }} onError={e => e.target.style.display="none"} />
            </div>
          ) : (
            <div style={{ width:200, height:200, borderRadius:"50%",
              background:"rgba(196,164,90,0.1)", border:"2px dashed rgba(196,164,90,0.3)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:"4rem" }}>💑</div>
          )}
        </div>

        <div style={{ textAlign:"center", animation:"fadeUp 0.8s 0.2s ease both" }}>
          <p style={{ color:"rgba(196,164,90,0.7)", fontSize:"0.65rem",
            letterSpacing:"0.35em", textTransform:"uppercase", marginBottom:12 }}>The Wedding Of</p>
          {groom && bride ? (
            <>
              <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2.8rem",
                fontWeight:600, color:"white", lineHeight:1.1 }}>{groom.split(" ")[0]}</h1>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.8rem",
                color:gold, margin:"4px 0" }}>&amp;</p>
              <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2.8rem",
                fontWeight:600, color:"white", lineHeight:1.1 }}>{bride.split(" ")[0]}</h1>
            </>
          ) : (
            <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2.5rem",
              fontWeight:600, color:"white" }}>Wedding Planner</h1>
          )}
          <div style={{ marginTop:16, height:1, maxWidth:120, margin:"16px auto 0",
            background:"linear-gradient(90deg,transparent,rgba(196,164,90,0.6),transparent)" }} />
          <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.75rem", marginTop:12, letterSpacing:"0.1em" }}>
            Wedding Management System
          </p>
        </div>
      </div>

      {/* Kanan — Form */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 32px" }}>
        <div style={{ width:"100%", maxWidth:380, animation:"fadeUp 0.8s 0.1s ease both" }}>

          {/* Mobile branding */}
          <div className="md:hidden" style={{ textAlign:"center", marginBottom:40 }}>
            <p style={{ color:"rgba(196,164,90,0.7)", fontSize:"0.6rem",
              letterSpacing:"0.3em", textTransform:"uppercase", marginBottom:8 }}>Wedding Planner</p>
            <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2.2rem",
              color:"white", fontWeight:600 }}>Our Big Day</h1>
          </div>

          <div style={{ marginBottom:36 }}>
            <p style={{ color:gold, fontSize:"0.65rem", letterSpacing:"0.25em",
              textTransform:"uppercase", marginBottom:8 }}>Selamat Datang</p>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2rem",
              fontWeight:600, color:"white", marginBottom:8 }}>Masuk ke Dashboard</h2>
            <p style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.82rem" }}>Kelola pernikahan impian Anda</p>
          </div>

          {error && (
            <div style={{
              marginBottom:20, padding:"12px 16px", borderRadius:12,
              background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)",
              color:"#FCA5A5", fontSize:"0.82rem",
            }}>⚠ {error}</div>
          )}

          <form onSubmit={handleLogin} style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div>
              <label style={{ display:"block", color:"rgba(255,255,255,0.4)", fontSize:"0.65rem",
                letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:8 }}>Email</label>
              <input type="email" placeholder="email@contoh.com" value={email}
                onChange={e => setEmail(e.target.value)} required
                style={{
                  width:"100%", padding:"14px 16px", borderRadius:12, fontSize:"0.9rem",
                  background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
                  color:"white", outline:"none", boxSizing:"border-box",
                  transition:"border-color 0.2s",
                }}
                onFocus={e => e.target.style.borderColor="rgba(196,164,90,0.5)"}
                onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.1)"}
              />
            </div>
            <div>
              <label style={{ display:"block", color:"rgba(255,255,255,0.4)", fontSize:"0.65rem",
                letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:8 }}>Password</label>
              <div style={{ position:"relative" }}>
                <input type={showPass ? "text" : "password"} placeholder="••••••••" value={password}
                  onChange={e => setPassword(e.target.value)} required
                  style={{
                    width:"100%", padding:"14px 48px 14px 16px", borderRadius:12, fontSize:"0.9rem",
                    background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
                    color:"white", outline:"none", boxSizing:"border-box",
                    transition:"border-color 0.2s",
                  }}
                  onFocus={e => e.target.style.borderColor="rgba(196,164,90,0.5)"}
                  onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.1)"}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)",
                    background:"none", border:"none", color:"rgba(255,255,255,0.3)",
                    cursor:"pointer", fontSize:"0.85rem" }}>
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              style={{
                marginTop:8, padding:"15px", borderRadius:12, border:"none",
                background: loading ? "rgba(196,164,90,0.3)" : "linear-gradient(135deg,#C4A45A,#E8CC8A)",
                color:"#0F172A", fontWeight:700, fontSize:"0.9rem",
                letterSpacing:"0.05em", cursor: loading ? "not-allowed" : "pointer",
                transition:"all 0.2s", boxShadow: loading ? "none" : "0 8px 24px rgba(196,164,90,0.3)",
              }}>
              {loading ? (
                <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  <div style={{ width:16, height:16, borderRadius:"50%",
                    border:"2px solid #0F172A", borderTopColor:"transparent",
                    animation:"spin 0.8s linear infinite" }} />
                  Masuk...
                </span>
              ) : "Masuk →"}
            </button>
          </form>

          <p style={{ textAlign:"center", color:"rgba(255,255,255,0.2)", fontSize:"0.7rem", marginTop:32 }}>
            © 2026 Wedding Planner · All rights reserved
          </p>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

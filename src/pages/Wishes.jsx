import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Sidebar from "../components/Sidebar";

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&display=swap');
@keyframes fadeUp { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
`;

const STATUS = {
  "Hadir":       { color:"#4ADE80", bg:"rgba(74,222,128,0.1)",  border:"rgba(74,222,128,0.2)",  icon:"✓" },
  "Tidak Hadir": { color:"#F87171", bg:"rgba(248,113,113,0.1)", border:"rgba(248,113,113,0.2)", icon:"✗" },
  "Masih Ragu":  { color:"#FBBF24", bg:"rgba(251,191,36,0.1)",  border:"rgba(251,191,36,0.2)",  icon:"?" },
};

export default function Wishes() {
  const [wishes, setWishes]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("Semua");
  const [search, setSearch]   = useState("");

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = STYLES;
    document.head.appendChild(el);
    fetchWishes();
    return () => document.head.removeChild(el);
  }, []);

  const fetchWishes = async () => {
    setLoading(true);
    const { data } = await supabase.from("rsvp").select("*").order("id", { ascending:false });
    if (data) setWishes(data);
    setLoading(false);
  };

  const deleteWish = async (id) => {
    await supabase.from("rsvp").delete().eq("id", id);
    setWishes(wishes.filter(w => w.id !== id));
  };

  const gold = "#C4A45A";
  const filtered = wishes
    .filter(w => filter === "Semua" || w.attendance === filter)
    .filter(w => !search || w.name?.toLowerCase().includes(search.toLowerCase()));

  const counts = {
    hadir:  wishes.filter(w => w.attendance === "Hadir").length,
    tidak:  wishes.filter(w => w.attendance === "Tidak Hadir").length,
    ragu:   wishes.filter(w => w.attendance === "Masih Ragu").length,
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#0F172A", fontFamily:"'Inter',sans-serif" }}>
      <Sidebar />
      <main style={{ flex:1, padding:"80px 20px 32px" }} className="md:pt-8 md:p-8">

        {/* Header */}
        <div style={{ marginBottom:28, animation:"fadeUp 0.6s ease both" }}>
          <p style={{ color:gold, fontSize:"0.6rem", letterSpacing:"0.3em",
            textTransform:"uppercase", marginBottom:6 }}>Konfirmasi Kehadiran</p>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2.2rem",
            fontWeight:600, color:"white" }}>Ucapan & RSVP</h1>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12,
          marginBottom:24, animation:"fadeUp 0.6s 0.1s ease both" }}>
          {[
            { label:"Hadir",       count:counts.hadir, ...STATUS["Hadir"] },
            { label:"Tidak Hadir", count:counts.tidak, ...STATUS["Tidak Hadir"] },
            { label:"Masih Ragu",  count:counts.ragu,  ...STATUS["Masih Ragu"] },
          ].map(s => (
            <div key={s.label} style={{
              padding:"20px 16px", borderRadius:16, textAlign:"center",
              background:s.bg, border:`1px solid ${s.border}`,
            }}>
              <p style={{ fontSize:"1.8rem", fontWeight:700, color:s.color }}>{s.count}</p>
              <p style={{ fontSize:"0.7rem", color:"rgba(255,255,255,0.4)", marginTop:4 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter + Search */}
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:20,
          animation:"fadeUp 0.6s 0.15s ease both" }}>
          <input placeholder="🔍 Cari nama..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex:1, minWidth:160, padding:"10px 16px", borderRadius:12,
              background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
              color:"white", fontSize:"0.85rem", outline:"none" }} />
          {["Semua","Hadir","Tidak Hadir","Masih Ragu"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding:"10px 16px", borderRadius:12, fontSize:"0.8rem",
                border: filter===f ? `1px solid ${gold}` : "1px solid rgba(255,255,255,0.08)",
                background: filter===f ? "rgba(196,164,90,0.15)" : "rgba(255,255,255,0.03)",
                color: filter===f ? gold : "rgba(255,255,255,0.4)",
                cursor:"pointer", transition:"all 0.2s",
              }}>{f}</button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div style={{ textAlign:"center", padding:"48px", color:"rgba(255,255,255,0.3)" }}>Memuat...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"64px 0" }}>
            <p style={{ fontSize:"3rem", marginBottom:12 }}>💌</p>
            <p style={{ color:"rgba(255,255,255,0.3)" }}>Belum ada ucapan.</p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {filtered.map((w, i) => {
              const s = STATUS[w.attendance] || STATUS["Masih Ragu"];
              return (
                <div key={w.id}
                  style={{
                    padding:"18px 20px", borderRadius:16,
                    background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)",
                    animation:`fadeUp 0.4s ${i*0.04}s ease both`,
                    transition:"all 0.2s",
                  }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                        <div style={{ width:32, height:32, borderRadius:"50%", flexShrink:0,
                          background:`linear-gradient(135deg,${s.color}30,${s.color}10)`,
                          border:`1px solid ${s.border}`,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          color:s.color, fontSize:"0.75rem", fontWeight:700 }}>{s.icon}</div>
                        <div>
                          <p style={{ color:"white", fontWeight:600, fontSize:"0.9rem" }}>{w.name}</p>
                          <span style={{
                            fontSize:"0.68rem", padding:"2px 8px", borderRadius:99,
                            background:s.bg, border:`1px solid ${s.border}`, color:s.color,
                          }}>{w.attendance}</span>
                        </div>
                      </div>
                      {w.message && (
                        <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.82rem",
                          fontStyle:"italic", paddingLeft:42, lineHeight:1.6 }}>
                          "{w.message}"
                        </p>
                      )}
                    </div>
                    <button onClick={() => deleteWish(w.id)}
                      style={{ background:"none", border:"none", color:"rgba(255,255,255,0.15)",
                        cursor:"pointer", fontSize:"1rem", padding:4, flexShrink:0,
                        transition:"color 0.2s" }}
                      onMouseEnter={e => e.target.style.color="rgba(239,68,68,0.6)"}
                      onMouseLeave={e => e.target.style.color="rgba(255,255,255,0.15)"}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

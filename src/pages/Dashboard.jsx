import { useEffect, useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { supabase } from "../lib/supabase";

const DASHBOARD_MUSIC = "https://myakgpkcqschdyfunlso.supabase.co/storage/v1/object/public/wedding-music/Terpukau.mp3";

const CAT_COLORS = {
  "Venue":              { bar: "#C4A45A", light: "rgba(196,164,90,0.1)" },
  "Catering":           { bar: "#4ADE80", light: "rgba(74,222,128,0.1)" },
  "Dekorasi":           { bar: "#60A5FA", light: "rgba(96,165,250,0.1)" },
  "Fotografer":         { bar: "#A78BFA", light: "rgba(167,139,250,0.1)" },
  "Busana & Seserahan": { bar: "#F472B6", light: "rgba(244,114,182,0.1)" },
  "Undangan":           { bar: "#FB923C", light: "rgba(251,146,60,0.1)"  },
  "Rukun Nikah":        { bar: "#FBBF24", light: "rgba(251,191,36,0.1)"  },
  "Transportasi":       { bar: "#34D399", light: "rgba(52,211,153,0.1)"  },
  "KUA":                { bar: "#E879F9", light: "rgba(232,121,249,0.1)" },
  "Lainnya":            { bar: "#94A3B8", light: "rgba(148,163,184,0.1)" },
};

const getColor = (cat) => CAT_COLORS[cat] || { bar:"#C4A45A", light:"rgba(196,164,90,0.1)" };
const gold = "#C4A45A";
const goldLight = "#E8CC8A";
const fmt = (num, hide) => hide ? "Rp ••••••" : `Rp ${num.toLocaleString("id-ID")}`;

// ── Floating Music ────────────────────────────────────────
function FloatingMusic() {
  const audioRef              = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [volume, setVolume]   = useState(0.5);
  const [showVol, setShowVol] = useState(false);

  useEffect(() => {
    const tryPlay = () => {
      if (audioRef.current && !started) {
        audioRef.current.volume = volume;
        audioRef.current.play().then(() => { setPlaying(true); setStarted(true); }).catch(() => {});
      }
    };
    document.addEventListener("touchstart", tryPlay, { once:true });
    document.addEventListener("click",      tryPlay, { once:true });
    return () => {
      document.removeEventListener("touchstart", tryPlay);
      document.removeEventListener("click",      tryPlay);
    };
  }, [started]);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play().then(()=>setPlaying(true)).catch(()=>{}); }
    setStarted(true);
  };

  const handleEnded = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().then(()=>setPlaying(true)).catch(()=>{});
    }
  };

  return (
    <div style={{ position:"fixed", bottom:24, right:16, zIndex:50,
      display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8 }}>
      <audio ref={audioRef} src={DASHBOARD_MUSIC} preload="auto" onEnded={handleEnded} />
      {showVol && (
        <div style={{ background:"rgba(15,23,42,0.95)", borderRadius:14,
          padding:"12px 10px", border:`1px solid rgba(196,164,90,0.2)`,
          boxShadow:"0 8px 24px rgba(0,0,0,0.4)",
          display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
          <span style={{ fontSize:"0.6rem", color:gold }}>🔊</span>
          <input type="range" min={0} max={1} step={0.01} value={volume}
            onChange={e => { setVolume(parseFloat(e.target.value)); if(audioRef.current) audioRef.current.volume=parseFloat(e.target.value); }}
            style={{ writingMode:"vertical-lr", direction:"rtl", height:70, accentColor:gold }} />
          <span style={{ fontSize:"0.6rem", color:gold }}>🔈</span>
        </div>
      )}
      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
        {playing && (
          <div style={{ display:"flex", gap:2, alignItems:"flex-end", height:20 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ width:3, borderRadius:2, background:gold,
                animation:`pulse${i} ${0.4+i*0.1}s ease-in-out infinite alternate` }} />
            ))}
            <style>{`
              @keyframes pulse1{from{height:4px}to{height:16px}}
              @keyframes pulse2{from{height:6px}to{height:20px}}
              @keyframes pulse3{from{height:5px}to{height:14px}}
              @keyframes pulse4{from{height:8px}to{height:18px}}
            `}</style>
          </div>
        )}
        <button onClick={e=>{e.stopPropagation();setShowVol(!showVol)}}
          style={{ width:36, height:36, borderRadius:"50%",
            background:"rgba(196,164,90,0.15)", border:`1px solid rgba(196,164,90,0.3)`,
            display:"flex", alignItems:"center", justifyContent:"center",
            cursor:"pointer", fontSize:"0.9rem" }}>🎚</button>
        <button onClick={togglePlay}
          style={{ width:46, height:46, borderRadius:"50%",
            background:`linear-gradient(135deg,${gold},${goldLight})`,
            boxShadow:`0 4px 16px rgba(196,164,90,0.4)`, border:"none",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"1rem", color:"#0F172A", cursor:"pointer" }}>
          {playing ? "⏸" : "▶"}
        </button>
      </div>
      {started && (
        <div style={{ background:"rgba(15,23,42,0.9)", borderRadius:20,
          padding:"4px 12px", border:`1px solid rgba(196,164,90,0.2)` }}>
          <p style={{ fontSize:"0.58rem", color:gold, fontWeight:600, margin:0 }}>🎵 Terpukau</p>
          <p style={{ fontSize:"0.52rem", color:"rgba(255,255,255,0.35)", margin:0 }}>Wedding Playlist</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, color, hide }) {
  return (
    <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:16,
      padding:"16px 14px", border:"1px solid rgba(255,255,255,0.08)" }}>
      <p style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.62rem",
        letterSpacing:"0.18em", textTransform:"uppercase", marginBottom:6 }}>{label}</p>
      <p style={{ fontSize:"1rem", fontWeight:700, color:color||gold, margin:0,
        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
        {hide ? "Rp ••••••" : value}
      </p>
      {sub && <p style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.25)", marginTop:4 }}>
        {hide ? "•••" : sub}
      </p>}
    </div>
  );
}

export default function Dashboard() {
  const [groom, setGroom]                   = useState("");
  const [bride, setBride]                   = useState("");
  const [photoUrl, setPhotoUrl]             = useState("");
  const [dashboardPhoto, setDashboardPhoto] = useState("");
  const [weddingDate, setWeddingDate]       = useState("");
  const [weddingTime, setWeddingTime]       = useState("");
  const [weddingLocation, setWeddingLocation] = useState("");
  const [totalBudget, setTotalBudget]       = useState(0);
  const [totalSpent, setTotalSpent]         = useState(0);
  const [totalGuests, setTotalGuests]       = useState(0);
  const [planningDone, setPlanningDone]     = useState(0);
  const [planningTotal, setPlanningTotal]   = useState(0);
  const [hadir, setHadir]                   = useState(0);
  const [categoryStats, setCategoryStats]   = useState([]);
  const [loading, setLoading]               = useState(true);
  const [totalSudahDipakai, setTotalSudahDipakai] = useState(0);
  const [totalBankBSI, setTotalBankBSI]           = useState(0);
  const [showSudahDipakai, setShowSudahDipakai]   = useState(true);
  const [showBankBSI, setShowBankBSI]             = useState(true);
  const [hideBalance, setHideBalance]             = useState(false);
  const [guestSlug, setGuestSlug]                 = useState("");

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [settingsRes, rabRes, guestsRes, planningRes, rsvpRes] = await Promise.all([
      supabase.from("settings").select("groom, bride, photo_url, dashboard_photo_url, wedding_date, wedding_time, wedding_location").eq("id",1).single(),
      supabase.from("rab").select("budget, spent, category, status_dana"),
      supabase.from("guests").select("id, slug"),
      supabase.from("planning").select("done"),
      supabase.from("rsvp").select("attendance"),
    ]);

    if (!settingsRes.error && settingsRes.data) {
      const d = settingsRes.data;
      setGroom(d.groom||""); setBride(d.bride||"");
      setPhotoUrl(d.photo_url||""); setDashboardPhoto(d.dashboard_photo_url||"");
      setWeddingDate(d.wedding_date||""); setWeddingTime(d.wedding_time||"");
      setWeddingLocation(d.wedding_location||"");
    }

    if (!rabRes.error && rabRes.data) {
      const rows = rabRes.data;
      setTotalBudget(rows.reduce((s,r)=>s+(parseFloat(r.budget)||0),0));
      setTotalSpent(rows.reduce((s,r)=>s+(parseFloat(r.spent)||0),0));
      setTotalSudahDipakai(rows.filter(r=>!r.status_dana||r.status_dana==="Sudah Dipakai").reduce((s,r)=>s+(parseFloat(r.spent)||0),0));
      setTotalBankBSI(rows.filter(r=>r.status_dana==="Dana di Bank BSI").reduce((s,r)=>s+(parseFloat(r.spent)||0),0));
      const catMap = {};
      rows.forEach(r => {
        const cat = r.category||"Lainnya";
        if (!catMap[cat]) catMap[cat] = { budget:0, spent:0, sudahDipakai:0, bankBSI:0 };
        catMap[cat].budget += parseFloat(r.budget)||0;
        catMap[cat].spent  += parseFloat(r.spent)||0;
        if (!r.status_dana||r.status_dana==="Sudah Dipakai") catMap[cat].sudahDipakai += parseFloat(r.spent)||0;
        else if (r.status_dana==="Dana di Bank BSI") catMap[cat].bankBSI += parseFloat(r.spent)||0;
      });
      setCategoryStats(Object.entries(catMap)
        .map(([cat,val])=>({cat,...val,realisasi:val.budget>0?Math.round((val.spent/val.budget)*100):0}))
        .sort((a,b)=>b.budget-a.budget));
    }

    if (!guestsRes.error && guestsRes.data) {
      setTotalGuests(guestsRes.data.length);
      if (guestsRes.data.length > 0) setGuestSlug(guestsRes.data[0].slug||"tamu");
    }
    if (!planningRes.error && planningRes.data) {
      setPlanningTotal(planningRes.data.length);
      setPlanningDone(planningRes.data.filter(t=>t.done).length);
    }
    if (!rsvpRes.error && rsvpRes.data) setHadir(rsvpRes.data.filter(r=>r.attendance==="Hadir").length);
    setLoading(false);
  };

  const persen           = totalBudget > 0 ? Math.round((totalSpent/totalBudget)*100) : 0;
  const progressPlanning = planningTotal > 0 ? Math.round((planningDone/planningTotal)*100) : 0;
  const hariLagi         = weddingDate ? Math.max(0,Math.floor((new Date(weddingDate)-new Date())/86400000)) : 0;
  const monitoringTotal  = (showSudahDipakai?totalSudahDipakai:0)+(showBankBSI?totalBankBSI:0);
  const heroPic          = dashboardPhoto||photoUrl;

  const formatDate = (d) => {
    if (!d) return "Tanggal belum diatur";
    return new Date(d).toLocaleDateString("id-ID",{weekday:"long",year:"numeric",month:"long",day:"numeric"});
  };

  const grandSudahDipakai = categoryStats.reduce((s,c)=>s+c.sudahDipakai,0);
  const grandBankBSI      = categoryStats.reduce((s,c)=>s+c.bankBSI,0);
  const grandSpent        = categoryStats.reduce((s,c)=>s+c.spent,0);
  const grandBudget       = categoryStats.reduce((s,c)=>s+c.budget,0);

  const cardStyle = {
    background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
    borderRadius:16, padding:"16px",
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#0F172A",
      fontFamily:"'Inter',sans-serif", maxWidth:"100vw", overflow:"hidden" }}>
      <Sidebar />
      <FloatingMusic />

      <main style={{ flex:1, minWidth:0, width:0, padding:"68px 14px 32px",
        overflowX:"hidden", boxSizing:"border-box" }}>

        {/* ── HERO ─────────────────────────────────────── */}
        <div style={{ borderRadius:20, overflow:"hidden", marginBottom:16,
          background:`linear-gradient(135deg,#0F172A 0%,#1E293B 60%,#2D3748 100%)`,
          border:`1px solid rgba(196,164,90,0.2)`,
          boxShadow:`0 8px 32px rgba(0,0,0,0.4)` }}>
          <div style={{ position:"relative" }}>
            <div style={{ position:"absolute", inset:0, opacity:0.04,
              backgroundImage:"radial-gradient(circle,white 1px,transparent 1px)",
              backgroundSize:"20px 20px" }} />
            <div style={{ position:"relative", display:"flex", alignItems:"center",
              gap:14, padding:"18px 16px" }}>
              {heroPic ? (
                <img src={heroPic} alt="Foto"
                  style={{ width:56, height:56, objectFit:"cover", borderRadius:14, flexShrink:0,
                    border:`2px solid rgba(196,164,90,0.4)`,
                    boxShadow:`0 4px 16px rgba(196,164,90,0.2)` }} />
              ) : (
                <div style={{ width:56, height:56, borderRadius:14, flexShrink:0,
                  background:"rgba(196,164,90,0.1)", border:`2px dashed rgba(196,164,90,0.3)`,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.5rem" }}>💑</div>
              )}
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ color:"rgba(196,164,90,0.7)", fontSize:"0.58rem",
                  letterSpacing:"0.25em", textTransform:"uppercase", marginBottom:3 }}>Wedding Dashboard</p>
                <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.4rem",
                  fontWeight:600, color:"white", margin:0, lineHeight:1.2,
                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {groom&&bride ? `${groom.split(" ")[0]} & ${bride.split(" ")[0]}` : "Wedding Planner"}
                </h1>
                <p style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.68rem", marginTop:3,
                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {formatDate(weddingDate)}{weddingTime?` • ${weddingTime}`:""}
                </p>
              </div>
              <div style={{ textAlign:"center", flexShrink:0 }}>
                <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2rem",
                  fontWeight:700, color:"white", margin:0, lineHeight:1 }}>{hariLagi}</p>
                <p style={{ color:"rgba(196,164,90,0.7)", fontSize:"0.55rem",
                  letterSpacing:"0.15em", textTransform:"uppercase", margin:0 }}>Hari Lagi</p>
              </div>
            </div>

            {/* Tombol aksi */}
            <div style={{ padding:"0 16px 16px", display:"flex", gap:8, flexWrap:"wrap" }}>
              {/* ✅ Tombol Review Undangan */}
              <a href={`/invitation/${guestSlug||"preview"}`} target="_blank" rel="noreferrer"
                style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 16px",
                  borderRadius:10, textDecoration:"none", flexShrink:0,
                  background:`linear-gradient(135deg,${gold},${goldLight})`,
                  boxShadow:`0 4px 14px rgba(196,164,90,0.35)`,
                  color:"#0F172A", fontSize:"0.78rem", fontWeight:700 }}>
                👁 Lihat Undangan
              </a>
              <button onClick={()=>setHideBalance(!hideBalance)}
                style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 14px",
                  borderRadius:10, border:`1px solid rgba(196,164,90,0.2)`,
                  background:"rgba(196,164,90,0.08)", cursor:"pointer",
                  color:"rgba(196,164,90,0.8)", fontSize:"0.78rem", fontWeight:600 }}>
                {hideBalance ? "👁 Tampilkan" : "🙈 Sembunyikan"}
              </button>
            </div>
          </div>
        </div>

        {/* ── AYAT AL-QURAN ────────────────────────────── */}
        <div style={{ ...cardStyle, marginBottom:16,
          background:"linear-gradient(135deg,rgba(196,164,90,0.08),rgba(196,164,90,0.02))",
          border:`1px solid rgba(196,164,90,0.2)`, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:-20, right:-20, width:80, height:80,
            borderRadius:"50%", background:`radial-gradient(circle,rgba(196,164,90,0.08),transparent)` }} />
          <p style={{ color:gold, fontSize:"0.58rem", letterSpacing:"0.22em",
            textTransform:"uppercase", textAlign:"center", marginBottom:10 }}>Q.S. Ar-Rum : 21</p>
          <p style={{ fontFamily:"'Amiri',serif", direction:"rtl", fontSize:"1rem",
            color:"white", lineHeight:2.2, textAlign:"center", marginBottom:12 }}>
            وَمِنْ اٰيٰتِهٖٓ اَنْ خَلَقَ لَكُمْ مِّنْ اَنْفُسِكُمْ اَزْوَاجًا لِّتَسْكُنُوْٓا اِلَيْهَا وَجَعَلَ بَيْنَكُمْ مَّوَدَّةً وَّرَحْمَةً
          </p>
          <div style={{ height:1, background:`linear-gradient(90deg,transparent,rgba(196,164,90,0.3),transparent)`,
            margin:"10px 0" }} />
          <p style={{ color:"rgba(255,255,255,0.45)", fontSize:"0.75rem", lineHeight:1.8,
            textAlign:"center", fontStyle:"italic" }}>
            "Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang."
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign:"center", padding:"48px 0", color:"rgba(255,255,255,0.3)" }}>
            <div style={{ width:32, height:32, borderRadius:"50%", border:`2px solid ${gold}`,
              borderTopColor:"transparent", animation:"spin 0.8s linear infinite", margin:"0 auto 12px" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            Memuat data...
          </div>
        ) : (
          <>
            {/* ── STAT CARDS ───────────────────────────── */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
              <StatCard label="Total Budget" value={fmt(totalBudget,false)} color={gold} hide={hideBalance} />
              <StatCard label="Terpakai"     value={fmt(totalSpent,false)}  color="#60A5FA" hide={hideBalance} />
              <StatCard label="Sisa Dana"    value={fmt(totalBudget-totalSpent,false)} color="#4ADE80" hide={hideBalance} />
              <StatCard label="Total Tamu"   value={totalGuests} sub={`${hadir} hadir`} color="#F472B6" hide={false} />
            </div>

            {/* ── MONITORING DANA ──────────────────────── */}
            <div style={{ ...cardStyle, marginBottom:14 }}>
              <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.6rem",
                letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:12 }}>
                Monitoring Dana
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:12 }}>
                <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer",
                  padding:"12px 14px", borderRadius:12,
                  background:showSudahDipakai?"rgba(239,68,68,0.06)":"rgba(255,255,255,0.02)",
                  border:showSudahDipakai?"1px solid rgba(239,68,68,0.2)":"1px solid rgba(255,255,255,0.06)" }}>
                  <input type="checkbox" checked={showSudahDipakai}
                    onChange={()=>setShowSudahDipakai(!showSudahDipakai)}
                    style={{ accentColor:"#EF4444", width:16, height:16 }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ color:"#FCA5A5", fontSize:"0.78rem", fontWeight:600, margin:0 }}>Sudah Dipakai</p>
                    <p style={{ color:"#EF4444", fontSize:"0.72rem", margin:0, fontWeight:700 }}>
                      {hideBalance ? "Rp ••••••" : fmt(totalSudahDipakai,false)}
                    </p>
                  </div>
                </label>
                <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer",
                  padding:"12px 14px", borderRadius:12,
                  background:showBankBSI?"rgba(74,222,128,0.06)":"rgba(255,255,255,0.02)",
                  border:showBankBSI?"1px solid rgba(74,222,128,0.2)":"1px solid rgba(255,255,255,0.06)" }}>
                  <input type="checkbox" checked={showBankBSI}
                    onChange={()=>setShowBankBSI(!showBankBSI)}
                    style={{ accentColor:"#4ADE80", width:16, height:16 }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ color:"#86EFAC", fontSize:"0.78rem", fontWeight:600, margin:0 }}>Dana di Bank BSI</p>
                    <p style={{ color:"#4ADE80", fontSize:"0.72rem", margin:0, fontWeight:700 }}>
                      {hideBalance ? "Rp ••••••" : fmt(totalBankBSI,false)}
                    </p>
                  </div>
                </label>
              </div>

              {totalSpent > 0 && (
                <div style={{ height:8, background:"rgba(255,255,255,0.06)",
                  borderRadius:99, overflow:"hidden", display:"flex", marginBottom:12 }}>
                  {showSudahDipakai && totalSudahDipakai>0 && (
                    <div style={{ width:`${(totalSudahDipakai/totalSpent)*100}%`,
                      background:"linear-gradient(90deg,#EF4444,#F87171)",
                      height:"100%", minWidth:2, transition:"width 0.6s" }} />
                  )}
                  {showBankBSI && totalBankBSI>0 && (
                    <div style={{ width:`${(totalBankBSI/totalSpent)*100}%`,
                      background:"linear-gradient(90deg,#16A34A,#4ADE80)",
                      height:"100%", minWidth:2, transition:"width 0.6s" }} />
                  )}
                </div>
              )}

              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                paddingTop:10, borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display:"flex", gap:12 }}>
                  {showSudahDipakai && <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:"#EF4444" }} />
                    <span style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.35)" }}>Dipakai</span>
                  </div>}
                  {showBankBSI && <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:"#4ADE80" }} />
                    <span style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.35)" }}>Bank BSI</span>
                  </div>}
                </div>
                <div style={{ textAlign:"right" }}>
                  <p style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.25)", margin:0 }}>Total</p>
                  <p style={{ fontSize:"1rem", fontWeight:700, color:gold, margin:0 }}>
                    {hideBalance ? "Rp ••••••" : fmt(monitoringTotal,false)}
                  </p>
                </div>
              </div>
            </div>

            {/* ── PROGRESS ─────────────────────────────── */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
              <div style={cardStyle}>
                <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.6rem",
                  letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:8 }}>Planning</p>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:"0.72rem", color:"rgba(255,255,255,0.4)" }}>{planningDone} selesai</span>
                  <span style={{ fontSize:"0.72rem", color:gold, fontWeight:700 }}>{progressPlanning}%</span>
                </div>
                <div style={{ height:6, background:"rgba(255,255,255,0.06)", borderRadius:99, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${progressPlanning}%`, borderRadius:99,
                    background:`linear-gradient(90deg,${gold},${goldLight})`, transition:"width 0.8s" }} />
                </div>
                <p style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.2)", marginTop:6 }}>
                  {planningTotal} total tugas
                </p>
              </div>
              <div style={cardStyle}>
                <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.6rem",
                  letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:8 }}>Budget</p>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:"0.72rem", color:"rgba(255,255,255,0.4)" }}>Realisasi</span>
                  <span style={{ fontSize:"0.72rem", fontWeight:700,
                    color:persen>90?"#EF4444":persen>70?"#FBBF24":gold }}>{persen}%</span>
                </div>
                <div style={{ height:6, background:"rgba(255,255,255,0.06)", borderRadius:99, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${Math.min(persen,100)}%`, borderRadius:99,
                    background:persen>90?"linear-gradient(90deg,#EF4444,#F87171)":
                      persen>70?"linear-gradient(90deg,#FBBF24,#FCD34D)":
                      `linear-gradient(90deg,${gold},${goldLight})`,
                    transition:"width 0.8s" }} />
                </div>
                <p style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.2)", marginTop:6 }}>
                  {hideBalance ? "•••" : fmt(totalSpent,false)}
                </p>
              </div>
            </div>

            {/* ── KATEGORI TABLE ───────────────────────── */}
            {categoryStats.length > 0 && (
              <div style={{ ...cardStyle }}>
                <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.6rem",
                  letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:14 }}>
                  Budget per Kategori
                </p>

                {/* Bar chart sederhana */}
                <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:16 }}>
                  {categoryStats.map(c => {
                    const col = getColor(c.cat);
                    const pct = c.budget>0 ? Math.min((c.spent/c.budget)*100,100) : 0;
                    return (
                      <div key={c.cat}>
                        <div style={{ display:"flex", justifyContent:"space-between",
                          alignItems:"center", marginBottom:5 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                            <div style={{ width:8, height:8, borderRadius:2, background:col.bar, flexShrink:0 }} />
                            <span style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.65)" }}>{c.cat}</span>
                          </div>
                          <span style={{ fontSize:"0.72rem", fontWeight:700,
                            color:c.realisasi>100?"#EF4444":c.realisasi>80?"#FBBF24":col.bar }}>
                            {c.realisasi}%
                          </span>
                        </div>
                        <div style={{ height:5, background:"rgba(255,255,255,0.05)",
                          borderRadius:99, overflow:"hidden" }}>
                          <div style={{ height:"100%", width:`${pct}%`, borderRadius:99,
                            background:c.realisasi>100?"linear-gradient(90deg,#EF4444,#F87171)":
                              c.realisasi>80?"linear-gradient(90deg,#FBBF24,#FCD34D)":
                              `linear-gradient(90deg,${col.bar},${col.bar}99)`,
                            transition:"width 0.8s" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Tabel ringkasan */}
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", fontSize:"0.7rem", borderCollapse:"collapse", minWidth:400 }}>
                    <thead>
                      <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                        {["Kategori","Budget","Dipakai","BSI","Sisa","%"].map(h => (
                          <th key={h} style={{ textAlign:h==="Kategori"?"left":"right",
                            padding:"6px 8px", color:"rgba(255,255,255,0.25)",
                            fontWeight:500, letterSpacing:"0.1em", textTransform:"uppercase",
                            fontSize:"0.6rem" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {categoryStats.map(c => (
                        <tr key={c.cat} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                          <td style={{ padding:"8px 8px", color:"rgba(255,255,255,0.65)" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                              <div style={{ width:6, height:6, borderRadius:2,
                                background:getColor(c.cat).bar, flexShrink:0 }} />
                              <span style={{ overflow:"hidden", textOverflow:"ellipsis",
                                whiteSpace:"nowrap", maxWidth:80 }}>{c.cat}</span>
                            </div>
                          </td>
                          <td style={{ textAlign:"right", padding:"8px 8px",
                            color:"rgba(255,255,255,0.4)" }}>
                            {hideBalance?"•••":fmt(c.budget,false).replace("Rp ","")}
                          </td>
                          <td style={{ textAlign:"right", padding:"8px 8px",
                            color:c.sudahDipakai>0?"#FCA5A5":"rgba(255,255,255,0.2)" }}>
                            {hideBalance?"•••":fmt(c.sudahDipakai,false).replace("Rp ","")}
                          </td>
                          <td style={{ textAlign:"right", padding:"8px 8px",
                            color:c.bankBSI>0?"#86EFAC":"rgba(255,255,255,0.2)" }}>
                            {hideBalance?"•••":fmt(c.bankBSI,false).replace("Rp ","")}
                          </td>
                          <td style={{ textAlign:"right", padding:"8px 8px",
                            color:c.budget-c.spent<0?"#EF4444":"#4ADE80" }}>
                            {hideBalance?"•••":fmt(c.budget-c.spent,false).replace("Rp ","")}
                          </td>
                          <td style={{ textAlign:"right", padding:"8px 8px", fontWeight:700,
                            color:c.realisasi>100?"#EF4444":c.realisasi>80?"#FBBF24":gold }}>
                            {c.realisasi}%
                          </td>
                        </tr>
                      ))}
                      <tr style={{ borderTop:`1px solid rgba(196,164,90,0.2)` }}>
                        <td style={{ padding:"8px 8px", color:gold, fontWeight:700 }}>Total</td>
                        <td style={{ textAlign:"right", padding:"8px 8px", color:gold, fontWeight:700 }}>
                          {hideBalance?"•••":fmt(grandBudget,false).replace("Rp ","")}
                        </td>
                        <td style={{ textAlign:"right", padding:"8px 8px", color:"#FCA5A5", fontWeight:700 }}>
                          {hideBalance?"•••":fmt(grandSudahDipakai,false).replace("Rp ","")}
                        </td>
                        <td style={{ textAlign:"right", padding:"8px 8px", color:"#86EFAC", fontWeight:700 }}>
                          {hideBalance?"•••":fmt(grandBankBSI,false).replace("Rp ","")}
                        </td>
                        <td style={{ textAlign:"right", padding:"8px 8px",
                          color:grandBudget-grandSpent<0?"#EF4444":"#4ADE80", fontWeight:700 }}>
                          {hideBalance?"•••":fmt(grandBudget-grandSpent,false).replace("Rp ","")}
                        </td>
                        <td style={{ textAlign:"right", padding:"8px 8px", fontWeight:700,
                          color:persen>100?"#EF4444":persen>80?"#FBBF24":gold }}>
                          {persen}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Legend */}
                <div style={{ display:"flex", gap:12, marginTop:12, flexWrap:"wrap" }}>
                  {[["#FCA5A5","Sudah Dipakai"],["#86EFAC","Bank BSI"],[gold,"Total"]].map(([c,l])=>(
                    <div key={l} style={{ display:"flex", alignItems:"center", gap:5 }}>
                      <div style={{ width:8, height:8, borderRadius:2, background:c }} />
                      <span style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.3)" }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

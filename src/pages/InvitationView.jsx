import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";

const INVITATION_MUSIC = "https://myakgpkcqschdyfunlso.supabase.co/storage/v1/object/public/wedding-music/Ada%20Untukmu.mp3";
const BONEKA_URL = "https://myakgpkcqschdyfunlso.supabase.co/storage/v1/object/public/wedding-photos/boneka1.png";

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&display=swap');
@keyframes driftCloud {
  from { transform: translateX(-350px); }
  to   { transform: translateX(110vw); }
}
@keyframes fadeDown {
  from { opacity:0; transform:translateY(-16px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes bounceY {
  0%,100% { transform:translateY(0); }
  50%      { transform:translateY(-7px); }
}
@keyframes musicPulse {
  0%,100% { height:4px; }
  50%      { height:18px; }
}
@keyframes glowPulse {
  0%,100% { opacity:0.4; transform:scale(1); }
  50%      { opacity:1;   transform:scale(1.18); }
}
@keyframes sparkle {
  0%   { opacity:0; transform:scale(0) rotate(0deg); }
  50%  { opacity:1; transform:scale(1) rotate(180deg); }
  100% { opacity:0; transform:scale(0) rotate(360deg); }
}
@keyframes overlayIn {
  from { opacity:0; }
  to   { opacity:1; }
}
@keyframes bonekaIn {
  0%   { opacity:0; transform:scale(0.4) translateY(40px); }
  40%  { opacity:1; transform:scale(1.08) translateY(-8px); }
  60%  { transform:scale(0.97) translateY(0); }
  100% { opacity:1; transform:scale(1) translateY(0); }
}
@keyframes bonekaFloat {
  0%,100% { transform:translateY(0) scale(1); }
  50%      { transform:translateY(-10px) scale(1.03); }
}
@keyframes bonekaOut {
  0%   { opacity:1; transform:scale(1); }
  100% { opacity:0; transform:scale(1.3); }
}
@keyframes textReveal {
  0%   { opacity:0; transform:translateY(24px); }
  30%  { opacity:1; transform:translateY(0); }
  80%  { opacity:1; transform:translateY(0); }
  100% { opacity:0; transform:translateY(-16px); }
}
@keyframes burstStar {
  0%   { opacity:1; transform:scale(0) translate(0,0); }
  100% { opacity:0; transform:scale(1.5) translate(var(--tx),var(--ty)); }
}
@keyframes ringFloat {
  0%,100% { transform:translateY(0) rotate(-15deg); }
  50%      { transform:translateY(-10px) rotate(-15deg); }
}
@keyframes ringFloat2 {
  0%,100% { transform:translateY(0) rotate(15deg); }
  50%      { transform:translateY(-8px) rotate(15deg); }
}
@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{ animation:none!important; }
}
`;

// ✨ Animasi Boneka + Cincin + Cahaya
function RingAnimation({ visible, groom, bride }) {
  if (!visible) return null;
  const stars = [
    { top:"10%", left:"15%", delay:"0s",    tx:"-40px", ty:"-30px" },
    { top:"15%", left:"80%", delay:"0.2s",  tx:"35px",  ty:"-40px" },
    { top:"75%", left:"10%", delay:"0.4s",  tx:"-30px", ty:"30px"  },
    { top:"80%", left:"85%", delay:"0.3s",  tx:"40px",  ty:"35px"  },
    { top:"45%", left:"3%",  delay:"0.5s",  tx:"-45px", ty:"0px"   },
    { top:"50%", left:"93%", delay:"0.15s", tx:"45px",  ty:"0px"   },
    { top:"5%",  left:"50%", delay:"0.25s", tx:"0px",   ty:"-50px" },
    { top:"90%", left:"50%", delay:"0.35s", tx:"0px",   ty:"50px"  },
    { top:"30%", left:"5%",  delay:"0.1s",  tx:"-35px", ty:"-20px" },
    { top:"65%", left:"90%", delay:"0.45s", tx:"35px",  ty:"20px"  },
  ];

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:200,
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"linear-gradient(160deg,#0C4A6E 0%,#0284C7 55%,#38BDF8 100%)",
      animation:"overlayIn 0.35s ease both",
    }}>
      {/* Cahaya latar besar */}
      <div style={{
        position:"absolute", width:350, height:350, borderRadius:"50%",
        background:"radial-gradient(circle,rgba(186,230,253,0.25) 0%,transparent 70%)",
        animation:"glowPulse 1.4s ease-in-out infinite",
      }} />

      {/* Lingkaran emas */}
      <div style={{
        position:"absolute", width:260, height:260, borderRadius:"50%",
        border:"1.5px solid rgba(196,164,90,0.4)",
        animation:"glowPulse 2s ease-in-out infinite",
      }} />
      <div style={{
        position:"absolute", width:300, height:300, borderRadius:"50%",
        border:"1px solid rgba(186,230,253,0.2)",
        animation:"glowPulse 2.4s 0.3s ease-in-out infinite",
      }} />

      {/* Bintang burst */}
      {stars.map((s, i) => (
        <div key={i} style={{
          position:"absolute", top:s.top, left:s.left,
          fontSize:"1rem", color:"#C4A45A",
          "--tx":s.tx, "--ty":s.ty,
          animation:`burstStar 2s ${s.delay} ease-out both`,
        }}>✦</div>
      ))}

      {/* Partikel cahaya */}
      {[...Array(16)].map((_, i) => (
        <div key={i} style={{
          position:"absolute",
          width: 3+(i%3)*2, height: 3+(i%3)*2,
          borderRadius:"50%",
          background: i%2===0 ? "rgba(196,164,90,0.85)" : "rgba(186,230,253,0.85)",
          top:`${8+(i*5)%82}%`, left:`${4+(i*11)%88}%`,
          animation:`sparkle ${1+i*0.12}s ${i*0.08}s ease-in-out infinite`,
        }} />
      ))}

      {/* Cincin kiri */}
      <div style={{
        position:"absolute", top:"12%", left:"8%",
        fontSize:"2.2rem",
        filter:"drop-shadow(0 0 16px rgba(196,164,90,0.8))",
        animation:"ringFloat 2s ease-in-out infinite",
      }}>💍</div>

      {/* Cincin kanan */}
      <div style={{
        position:"absolute", top:"12%", right:"8%",
        fontSize:"2.2rem",
        filter:"drop-shadow(0 0 16px rgba(196,164,90,0.8))",
        animation:"ringFloat2 2s 0.3s ease-in-out infinite",
      }}>💍</div>

      {/* Cincin bawah kiri */}
      <div style={{
        position:"absolute", bottom:"14%", left:"10%",
        fontSize:"1.6rem",
        filter:"drop-shadow(0 0 12px rgba(196,164,90,0.6))",
        animation:"ringFloat 2.4s 0.5s ease-in-out infinite",
      }}>💍</div>

      {/* Cincin bawah kanan */}
      <div style={{
        position:"absolute", bottom:"14%", right:"10%",
        fontSize:"1.6rem",
        filter:"drop-shadow(0 0 12px rgba(196,164,90,0.6))",
        animation:"ringFloat2 2.2s 0.2s ease-in-out infinite",
      }}>💍</div>

      {/* ✅ Foto Boneka */}
      <div style={{
        position:"relative", zIndex:10,
        animation:"bonekaIn 0.8s ease both, bonekaFloat 2s 0.8s ease-in-out infinite",
        filter:"drop-shadow(0 12px 40px rgba(12,74,110,0.5))",
        marginBottom:16,
      }}>
        <img
          src={BONEKA_URL}
          alt="Boneka Pasangan"
          style={{
            width:180, height:180,
            objectFit:"contain",
            borderRadius:"50%",
            border:"4px solid rgba(196,164,90,0.5)",
            boxShadow:"0 0 40px rgba(196,164,90,0.4), 0 0 80px rgba(186,230,253,0.3)",
          }}
        />
        {/* Cahaya di bawah boneka */}
        <div style={{
          position:"absolute", bottom:-12, left:"50%", transform:"translateX(-50%)",
          width:100, height:20, borderRadius:"50%",
          background:"rgba(196,164,90,0.25)",
          filter:"blur(8px)",
        }} />
      </div>

      {/* Teks nama */}
      <div style={{
        textAlign:"center",
        animation:"textReveal 2.8s 0.4s ease both",
        zIndex:10,
      }}>
        <p style={{
          fontFamily:"'Cormorant Garamond',serif",
          fontSize:"1.9rem", color:"white", fontWeight:600,
          letterSpacing:2, textShadow:"0 0 30px rgba(186,230,253,0.8)",
        }}>
          {groom?.split(" ")[0] || "Ridwan"} &amp; {bride?.split(" ")[0] || "Nurlaila"}
        </p>
        <p style={{
          color:"#C4A45A", fontSize:"0.68rem",
          letterSpacing:"0.3em", textTransform:"uppercase", marginTop:8,
        }}>✦ Membuka Undangan ✦</p>
      </div>
    </div>
  );
}

function FloatingClouds({ opacity = 0.55 }) {
  const clouds = [
    { w:200, h:52, top:"7%",  dur:"38s", delay:"0s"   },
    { w:140, h:38, top:"18%", dur:"50s", delay:"-15s"  },
    { w:260, h:64, top:"4%",  dur:"46s", delay:"-28s"  },
    { w:180, h:46, top:"27%", dur:"55s", delay:"-8s"   },
    { w:120, h:34, top:"35%", dur:"42s", delay:"-22s"  },
  ];
  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none", zIndex:0 }} aria-hidden>
      {clouds.map((c, i) => (
        <div key={i} style={{
          position:"absolute", left:0, top:c.top,
          width:c.w, height:c.h, background:"white", borderRadius:50,
          opacity: opacity*(0.6+i*0.06), filter:"blur(7px)",
          animation:`driftCloud ${c.dur} linear ${c.delay} infinite`,
        }} />
      ))}
    </div>
  );
}

function GoldDivider({ dots = 1, my = 20 }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, margin:`${my}px 0` }}>
      <div style={{ flex:1, height:1, background:"linear-gradient(90deg,transparent,#C4A45A,transparent)" }} />
      {Array.from({ length: dots }).map((_, i) => (
        <div key={i} style={{ width:7, height:7, background:"#C4A45A", transform:"rotate(45deg)", flexShrink:0 }} />
      ))}
      <div style={{ flex:1, height:1, background:"linear-gradient(90deg,transparent,#C4A45A,transparent)" }} />
    </div>
  );
}

function QuranCard() {
  return (
    <div style={{
      background:"linear-gradient(135deg,rgba(186,230,253,0.28),rgba(240,249,255,0.55))",
      border:"1px solid rgba(196,164,90,0.22)", borderRadius:18,
      padding:"24px 18px", textAlign:"center",
    }}>
      <p style={{ color:"#C4A45A", fontSize:"0.58rem", letterSpacing:"0.18em", textTransform:"uppercase", marginBottom:10 }}>
        Q.S. Ar-Rum : 21
      </p>
      <p style={{ fontFamily:"'Amiri',serif", direction:"rtl", fontSize:"1.2rem", color:"#0C4A6E", lineHeight:2.0, marginBottom:10 }}>
        وَمِنْ اٰيٰتِهٖٓ اَنْ خَلَقَ لَكُمْ مِّنْ اَنْفُسِكُمْ اَزْوَاجًا لِّتَسْكُنُوْٓا اِلَيْهَا وَجَعَلَ بَيْنَكُمْ مَّوَدَّةً وَّرَحْمَةً
      </p>
      <GoldDivider />
      <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"0.78rem", color:"#475569", lineHeight:1.75 }}>
        "Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang."
      </p>
    </div>
  );
}

function FloatingMusic() {
  const audioRef          = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [volume, setVolume]   = useState(0.6);
  const [showVol, setShowVol] = useState(false);

  useEffect(() => {
    const tryPlay = () => {
      if (audioRef.current && !started) {
        audioRef.current.volume = volume;
        audioRef.current.play().then(() => { setPlaying(true); setStarted(true); }).catch(() => {});
      }
    };
    document.addEventListener("touchstart", tryPlay, { once: true });
    document.addEventListener("click", tryPlay, { once: true });
    return () => {
      document.removeEventListener("touchstart", tryPlay);
      document.removeEventListener("click", tryPlay);
    };
  }, [started]);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play().then(() => setPlaying(true)).catch(() => {}); }
    setStarted(true);
  };

  const handleVolume = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) audioRef.current.volume = val;
  };

  const handleEnded = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  return (
    <div style={{ position:"fixed", bottom:80, right:16, zIndex:50, display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8 }}>
      <audio ref={audioRef} src={INVITATION_MUSIC} preload="auto" onEnded={handleEnded} />
      {showVol && (
        <div style={{
          background:"rgba(255,255,255,0.95)", borderRadius:16, padding:"12px 10px",
          border:"1px solid #BAE6FD", boxShadow:"0 8px 32px rgba(12,74,110,0.15)",
          display:"flex", flexDirection:"column", alignItems:"center", gap:4
        }}>
          <span style={{ fontSize:"0.65rem", color:"#94A3B8" }}>🔊</span>
          <input type="range" min={0} max={1} step={0.01} value={volume} onChange={handleVolume}
            style={{ writingMode:"vertical-lr", direction:"rtl", height:72, accentColor:"#0284C7" }} />
          <span style={{ fontSize:"0.65rem", color:"#94A3B8" }}>🔈</span>
        </div>
      )}
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={(e) => { e.stopPropagation(); setShowVol(!showVol); }}
          style={{ width:40, height:40, borderRadius:"50%", background:"rgba(255,255,255,0.95)",
            border:"1px solid #BAE6FD", boxShadow:"0 4px 16px rgba(12,74,110,0.12)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1rem", cursor:"pointer" }}>🎚</button>
        <button onClick={togglePlay}
          style={{ width:48, height:48, borderRadius:"50%", background:"linear-gradient(135deg,#0284C7,#38BDF8)",
            boxShadow:"0 4px 20px rgba(2,132,199,0.4)", display:"flex", alignItems:"center",
            justifyContent:"center", fontSize:"1.1rem", color:"white", cursor:"pointer", border:"none" }}>
          {playing ? "⏸" : "▶"}
        </button>
      </div>
      {playing && (
        <div style={{ display:"flex", gap:3, justifyContent:"center", height:20, alignItems:"flex-end" }}>
          {[1,2,3,4].map((i) => (
            <div key={i} style={{
              width:3, borderRadius:2, background:"#0284C7",
              animation:`musicPulse ${0.4+i*0.1}s ease-in-out infinite alternate`,
            }} />
          ))}
        </div>
      )}
    </div>
  );
}

function useCountdown(targetDate) {
  const [time, setTime] = useState({ days:0, hours:0, minutes:0, seconds:0 });
  useEffect(() => {
    if (!targetDate) return;
    const tick = () => {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) { setTime({ days:0, hours:0, minutes:0, seconds:0 }); return; }
      setTime({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000)  / 60000),
        seconds: Math.floor((diff % 60000)    / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return time;
}

export default function InvitationView() {
  const { slug } = useParams();
  const [settings, setSettings] = useState({
    groom:"...", bride:"...",
    groom_father:"", groom_mother:"",
    bride_father:"", bride_mother:"",
    photo_url:"",
    wedding_date:"", wedding_time:"", wedding_location:"",
  });
  const [opened, setOpened]               = useState(false);
  const [animating, setAnimating]         = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [rsvpName, setRsvpName]           = useState("");
  const [rsvpMsg, setRsvpMsg]             = useState("");
  const [rsvpAttend, setRsvpAttend]       = useState("Hadir");
  const [wishes, setWishes]               = useState([]);
  const [wishSubmitted, setWishSubmitted] = useState(false);
  const [copied, setCopied]               = useState("");

  const countdown = useCountdown(settings.wedding_date);
  const guestName = slug?.replace(/-/g," ")?.replace(/\b\w/g,l=>l.toUpperCase()) || "Tamu Undangan";

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = STYLES;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const [sRes, wRes] = await Promise.all([
        supabase.from("settings").select("*").eq("id",1).single(),
        supabase.from("rsvp").select("*").order("id",{ ascending:false }),
      ]);
      if (!sRes.error && sRes.data) setSettings(sRes.data);
      if (!wRes.error && wRes.data) setWishes(wRes.data);
    };
    fetchData();
  }, []);

  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString("id-ID",{ weekday:"long", year:"numeric", month:"long", day:"numeric" })
    : "Segera";

  const handleBukaUndangan = () => {
    setAnimating(true);
    setTimeout(() => { setOpened(true); setAnimating(false); }, 3000);
  };

  const submitRsvp = async () => {
    if (!rsvpName) return;
    const newWish = { id:Date.now(), name:rsvpName, message:rsvpMsg, attendance:rsvpAttend };
    const { error } = await supabase.from("rsvp").insert(newWish);
    if (!error) {
      setWishes([newWish,...wishes]);
      setRsvpName(""); setRsvpMsg(""); setRsvpAttend("Hadir");
      setWishSubmitted(true);
      setTimeout(()=>setWishSubmitted(false), 3000);
    }
  };

  const copyText = (text, key) => {
    const run = async () => {
      try { await navigator.clipboard.writeText(text); }
      catch {
        const el = document.createElement("textarea");
        el.value = text; el.style.cssText = "position:fixed;opacity:0;top:0;left:0";
        document.body.appendChild(el); el.focus(); el.select();
        document.execCommand("copy"); document.body.removeChild(el);
      }
      setCopied(key); setTimeout(()=>setCopied(""), 2000);
    };
    run();
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior:"smooth" });
    setActiveSection(id);
  };

  const C = {
    deepBlue:"#0C4A6E", midBlue:"#0284C7",
    skyBlue:"#38BDF8",  lightBlue:"#BAE6FD",
    cloudBlue:"#F0F9FF", gold:"#C4A45A",
  };
  const gradMain  = `linear-gradient(160deg,${C.deepBlue} 0%,${C.midBlue} 60%,${C.skyBlue} 100%)`;
  const gradLight = `linear-gradient(135deg,${C.skyBlue} 0%,${C.midBlue} 100%)`;
  const serif  = { fontFamily:"'Cormorant Garamond',serif" };
  const arabic = { fontFamily:"'Amiri',serif", direction:"rtl" };
  const glass  = {
    background:"rgba(255,255,255,0.75)",
    backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)",
    border:"1px solid rgba(255,255,255,0.9)",
    borderRadius:24, boxShadow:"0 8px 32px rgba(12,74,110,0.09)",
  };

  if (!opened) {
    return (
      <>
        <RingAnimation visible={animating} groom={settings.groom} bride={settings.bride} />
        <div className="min-h-screen flex flex-col items-center justify-between py-12 px-6 text-center relative overflow-hidden"
          style={{ background:gradMain, fontFamily:"'Inter',sans-serif" }}>
          <FloatingClouds opacity={0.45} />
          <div style={{ position:"relative", zIndex:1, animation:"fadeDown 1s ease both" }}>
            <p style={{ ...arabic, fontSize:"1.55rem", color:C.lightBlue, lineHeight:1.7, marginBottom:4 }}>
              بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
            </p>
            <p className="text-sky-200 text-xs uppercase tracking-[0.3em] mt-1">Undangan Pernikahan</p>
            <div className="w-16 h-px bg-sky-400 mx-auto opacity-50 mt-3" />
          </div>
          <div className="relative z-10" style={{ animation:"fadeDown 1s 0.15s ease both" }}>
            {/* Foto boneka di cover */}
            <div style={{ marginBottom:16 }}>
              <img src={BONEKA_URL} alt="Boneka"
                style={{
                  width:140, height:140, objectFit:"contain",
                  borderRadius:"50%", margin:"0 auto",
                  border:"3px solid rgba(196,164,90,0.4)",
                  boxShadow:"0 0 30px rgba(196,164,90,0.3)",
                  display:"block",
                }} />
            </div>
            <h1 style={{ ...serif }} className="text-5xl font-semibold text-white mb-1 leading-tight drop-shadow-lg">
              {settings.groom?.split(" ")[0] || "..."}
            </h1>
            <p style={{ ...serif, color:C.gold }} className="text-3xl my-1">&amp;</p>
            <h1 style={{ ...serif }} className="text-5xl font-semibold text-white mb-5 leading-tight drop-shadow-lg">
              {settings.bride?.split(" ")[0] || "..."}
            </h1>
            <div style={{ display:"flex", alignItems:"center", gap:10, margin:"8px auto", maxWidth:200 }}>
              <div style={{ flex:1, height:1, background:"linear-gradient(90deg,transparent,#C4A45A,transparent)" }} />
              <span style={{ color:C.gold }}>💍</span>
              <div style={{ flex:1, height:1, background:"linear-gradient(90deg,transparent,#C4A45A,transparent)" }} />
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl px-8 py-4 border border-white border-opacity-20 mb-7">
              <p className="text-sky-200 text-xs uppercase tracking-widest mb-1">Kepada Yth.</p>
              <p style={{ ...serif }} className="text-white text-2xl font-medium capitalize">{guestName}</p>
              <p className="text-sky-300 text-xs mt-1">Mohon maaf bila ada kesalahan penulisan nama</p>
            </div>
            <button onClick={handleBukaUndangan} disabled={animating}
              className="px-10 py-4 rounded-full text-sky-900 font-semibold text-sm tracking-wide transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl disabled:opacity-70"
              style={{ background:"linear-gradient(90deg,#BAE6FD,#FFFFFF)" }}>
              {animating ? "✨ Membuka..." : "✉ Buka Undangan"}
            </button>
          </div>
          <div style={{ position:"relative", zIndex:1 }}>
            <p className="text-sky-300 text-sm">{formatDate(settings.wedding_date)}</p>
            {settings.wedding_location && <p className="text-sky-400 text-xs mt-1">{settings.wedding_location}</p>}
          </div>
        </div>
      </>
    );
  }

  return (
    <div style={{ fontFamily:"'Inter',sans-serif", background:C.cloudBlue }} className="pb-20">
      <FloatingMusic />

      <section id="hero" className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative overflow-hidden"
        style={{ background:gradMain }}>
        <FloatingClouds opacity={0.4} />
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage:"radial-gradient(circle,white 1px,transparent 1px)", backgroundSize:"30px 30px" }} />
        <div style={{ position:"relative", zIndex:1, animation:"fadeDown 0.9s ease both" }}>
          <p style={{ ...arabic, fontSize:"1.8rem", color:C.lightBlue, lineHeight:1.8, marginBottom:4 }}>
            بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
          </p>
          <GoldDivider dots={3} my={14} />
          <p className="text-sky-200 text-xs uppercase tracking-[0.3em] mb-6">The Wedding Of</p>
          <h1 style={{ ...serif }} className="text-7xl font-semibold text-white drop-shadow-lg">
            {settings.groom?.split(" ")[0]}
          </h1>
          <p style={{ ...serif, color:C.gold }} className="text-4xl my-3">&amp;</p>
          <h1 style={{ ...serif }} className="text-7xl font-semibold text-white drop-shadow-lg">
            {settings.bride?.split(" ")[0]}
          </h1>
          <p className="text-sky-200 text-sm mt-5">{formatDate(settings.wedding_date)}</p>
          <div className="grid grid-cols-4 gap-3 mt-8">
            {[
              { val:countdown.days,    label:"Hari" },
              { val:countdown.hours,   label:"Jam" },
              { val:countdown.minutes, label:"Menit" },
              { val:countdown.seconds, label:"Detik" },
            ].map(({ val, label }) => (
              <div key={label} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center border border-white border-opacity-20 backdrop-blur-sm"
                  style={{ background:"rgba(255,255,255,0.12)" }}>
                  <span className="text-2xl font-bold text-white">{String(val).padStart(2,"0")}</span>
                </div>
                <span className="text-sky-300 text-xs mt-1">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-8 text-sky-300 text-xs" style={{ animation:"bounceY 2s ease-in-out infinite" }}>↓</div>
      </section>

      <section className="py-16 px-8 text-center bg-white">
        <div style={{ maxWidth:460, margin:"0 auto" }}>
          <QuranCard />
          <div style={{ marginTop:28 }}>
            <h2 style={{ ...serif }} className="text-3xl font-semibold text-sky-900 mb-4">Assalamu'alaikum Wr. Wb.</h2>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
              Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara(i) untuk menghadiri acara pernikahan putra-putri kami.
            </p>
          </div>
        </div>
      </section>

      <section id="mempelai" className="py-16 px-6 relative overflow-hidden" style={{ background:C.cloudBlue }}>
        <div className="text-center mb-10">
          <p style={{ color:C.gold, fontSize:"0.6rem", letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:6 }}>Mempelai</p>
          <h2 style={{ ...serif }} className="text-3xl font-semibold text-sky-900">Kedua Mempelai</h2>
          <GoldDivider my={14} />
        </div>
        <div style={{ ...glass, maxWidth:384, margin:"0 auto 12px", padding:"32px 24px", textAlign:"center" }}>
          {settings.photo_url ? (
            <img src={settings.photo_url} alt="Foto" className="w-24 h-24 object-cover rounded-full mx-auto mb-4 border-4 border-sky-100 shadow" />
          ) : (
            <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-5xl"
              style={{ background:`linear-gradient(135deg,${C.lightBlue},${C.skyBlue})` }}>👰</div>
          )}
          <h3 style={{ ...serif }} className="text-2xl font-semibold text-sky-900 mb-1">{settings.bride}</h3>
          <p style={{ color:C.gold, fontSize:"0.6rem", letterSpacing:"0.16em", textTransform:"uppercase", marginBottom:10 }}>Mempelai Wanita</p>
          {(settings.bride_father || settings.bride_mother) && (
            <>
              <div className="h-px bg-sky-100 my-3" />
              <p className="text-slate-500 text-sm">Putri dari</p>
              <p className="text-slate-700 text-sm font-medium mt-1">
                {settings.bride_father && `Bpk. ${settings.bride_father}`}
                {settings.bride_father && settings.bride_mother && " & "}
                {settings.bride_mother && `Ibu ${settings.bride_mother}`}
              </p>
            </>
          )}
        </div>
        <div className="text-center my-2">
          <p style={{ ...serif, color:C.gold }} className="text-4xl">&amp;</p>
        </div>
        <div style={{ ...glass, maxWidth:384, margin:"0 auto", padding:"32px 24px", textAlign:"center" }}>
          <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-5xl"
            style={{ background:`linear-gradient(135deg,${C.lightBlue},${C.skyBlue})` }}>🤵</div>
          <h3 style={{ ...serif }} className="text-2xl font-semibold text-sky-900 mb-1">{settings.groom}</h3>
          <p style={{ color:C.gold, fontSize:"0.6rem", letterSpacing:"0.16em", textTransform:"uppercase", marginBottom:10 }}>Mempelai Pria</p>
          {(settings.groom_father || settings.groom_mother) && (
            <>
              <div className="h-px bg-sky-100 my-3" />
              <p className="text-slate-500 text-sm">Putra dari</p>
              <p className="text-slate-700 text-sm font-medium mt-1">
                {settings.groom_father && `Bpk. ${settings.groom_father}`}
                {settings.groom_father && settings.groom_mother && " & "}
                {settings.groom_mother && `Ibu ${settings.groom_mother}`}
              </p>
            </>
          )}
        </div>
      </section>

      <section id="acara" className="py-16 px-6 bg-white">
        <div className="text-center mb-10">
          <p style={{ color:C.gold, fontSize:"0.6rem", letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:6 }}>Tanggal & Waktu</p>
          <h2 style={{ ...serif }} className="text-3xl font-semibold text-sky-900">Acara Pernikahan</h2>
          <GoldDivider my={14} />
        </div>
        <div className="max-w-sm mx-auto space-y-4">
          {["Akad Nikah","Resepsi"].map((label, idx) => (
            <div key={label} className="rounded-3xl overflow-hidden shadow-sm border border-sky-100">
              <div className="py-3 px-6 text-center text-white text-sm font-semibold tracking-widest uppercase" style={{ background:gradLight }}>
                {label}
              </div>
              <div className="bg-white px-6 py-6 text-center">
                {settings.wedding_date ? (
                  <>
                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">
                      {new Date(settings.wedding_date).toLocaleDateString("id-ID",{ weekday:"long" })}
                    </p>
                    <p style={{ ...serif }} className="text-5xl font-semibold text-sky-900">
                      {new Date(settings.wedding_date).getDate()}
                    </p>
                    <p style={{ ...serif }} className="text-xl text-sky-700">
                      {new Date(settings.wedding_date).toLocaleDateString("id-ID",{ month:"long", year:"numeric" })}
                    </p>
                  </>
                ) : (
                  <p className="text-slate-400 text-sm">Tanggal belum diatur</p>
                )}
                <div className="h-px bg-sky-100 my-4" />
                <p className="text-sky-600 font-medium text-sm">
                  {settings.wedding_time ? (idx===0 ? settings.wedding_time : settings.wedding_time+" — Selesai") : "Waktu belum diatur"}
                </p>
                <p className="text-slate-500 text-sm mt-1">{settings.wedding_location || "Lokasi belum diatur"}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="lokasi" className="py-16 px-6" style={{ background:C.cloudBlue }}>
        <div className="text-center mb-8">
          <p style={{ color:C.gold, fontSize:"0.6rem", letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:6 }}>Lokasi</p>
          <h2 style={{ ...serif }} className="text-3xl font-semibold text-sky-900">Tempat Acara</h2>
          <GoldDivider my={14} />
        </div>
        <div className="max-w-sm mx-auto">
          <div style={{ ...glass, overflow:"hidden" }}>
            <div className="w-full h-52 overflow-hidden">
              <iframe title="Lokasi Acara" width="100%" height="100%" loading="lazy" style={{ border:0 }}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(settings.wedding_location||"Bandung Jawa Barat")}&t=m&z=14&output=embed&iwloc=near`} />
            </div>
            <div className="p-6 text-center">
              <p className="font-semibold text-sky-900 mb-1">{settings.wedding_location||"Lokasi belum diatur"}</p>
              <a href={`https://maps.google.com/?q=${encodeURIComponent(settings.wedding_location||"Bandung")}`}
                target="_blank" rel="noreferrer"
                className="inline-block mt-3 px-6 py-2.5 rounded-full text-white text-sm font-medium transition hover:opacity-90"
                style={{ background:gradLight }}>
                📍 Buka Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-white">
        <div className="text-center mb-8">
          <p style={{ color:C.gold, fontSize:"0.6rem", letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:6 }}>Hadiah</p>
          <h2 style={{ ...serif }} className="text-3xl font-semibold text-sky-900">Wedding Gift</h2>
          <GoldDivider my={14} />
          <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">Doa restu Anda adalah karunia terindah.</p>
        </div>
        <div className="max-w-sm mx-auto space-y-4">
          {[
            { bank:"BRI", no:"1234567890123", an:settings.groom, key:"bri", bg:"#0284C7" },
            { bank:"BCA", no:"9876543210987", an:settings.bride, key:"bca", bg:"#0C4A6E" },
          ].map((r) => (
            <div key={r.key} className="rounded-2xl p-5 border border-sky-100 shadow-sm" style={{ background:C.cloudBlue }}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-white text-xs font-bold px-3 py-1 rounded-lg" style={{ background:r.bg }}>{r.bank}</div>
                <span className="text-slate-400 text-xs">A/n {r.an}</span>
              </div>
              <p className="text-sky-900 font-mono font-bold text-lg tracking-widest">{r.no}</p>
              <button onClick={()=>copyText(r.no, r.key)}
                className="mt-3 w-full py-2 rounded-xl text-sky-700 text-xs font-medium border border-sky-200 hover:bg-sky-50 transition">
                {copied===r.key ? "✓ Tersalin!" : "Salin Nomor Rekening"}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section id="ucapan" className="py-16 px-6" style={{ background:C.cloudBlue }}>
        <div className="text-center mb-8">
          <p style={{ color:C.gold, fontSize:"0.6rem", letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:6 }}>Konfirmasi</p>
          <h2 style={{ ...serif }} className="text-3xl font-semibold text-sky-900">Ucapan & RSVP</h2>
          <GoldDivider my={14} />
        </div>
        <div className="max-w-sm mx-auto grid grid-cols-3 gap-3 mb-6">
          {[
            { label:"Hadir", count:wishes.filter(w=>w.attendance==="Hadir").length,       color:"#0284C7" },
            { label:"Tidak", count:wishes.filter(w=>w.attendance==="Tidak Hadir").length, color:"#94A3B8" },
            { label:"Ragu",  count:wishes.filter(w=>w.attendance==="Masih Ragu").length,  color:"#0EA5E9" },
          ].map((s) => (
            <div key={s.label} style={{ ...glass, padding:"16px 12px", textAlign:"center" }}>
              <p className="text-2xl font-bold" style={{ color:s.color }}>{s.count}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
        <div style={{ ...glass, maxWidth:384, margin:"0 auto 20px", padding:"24px 20px" }}>
          <input className="w-full border border-slate-200 p-3 rounded-xl text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
            placeholder="Nama Anda" value={rsvpName} onChange={(e)=>setRsvpName(e.target.value)} />
          <select className="w-full border border-slate-200 p-3 rounded-xl text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
            value={rsvpAttend} onChange={(e)=>setRsvpAttend(e.target.value)}>
            <option>Hadir</option>
            <option>Tidak Hadir</option>
            <option>Masih Ragu</option>
          </select>
          <textarea className="w-full border border-slate-200 p-3 rounded-xl text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
            placeholder="Ucapan & doa untuk mempelai..." rows={3} value={rsvpMsg} onChange={(e)=>setRsvpMsg(e.target.value)} />
          <button onClick={submitRsvp} className="w-full py-3 rounded-xl text-white text-sm font-semibold transition hover:opacity-90" style={{ background:gradLight }}>
            Kirim Ucapan
          </button>
          {wishSubmitted && <p className="text-center text-sky-600 text-sm mt-3">✓ Terima kasih atas ucapannya!</p>}
        </div>
        <div className="max-w-sm mx-auto space-y-3">
          {wishes.map((w) => (
            <div key={w.id} style={{ ...glass, padding:"14px 16px" }}>
              <div className="flex justify-between items-center mb-1">
                <p className="font-semibold text-sky-900 text-sm">{w.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${w.attendance==="Hadir"?"bg-sky-100 text-sky-600":w.attendance==="Tidak Hadir"?"bg-slate-100 text-slate-500":"bg-yellow-50 text-yellow-600"}`}>
                  {w.attendance}
                </span>
              </div>
              {w.message && <p className="text-slate-500 text-xs italic mt-1">"{w.message}"</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-8 text-center relative overflow-hidden" style={{ background:gradMain }}>
        <FloatingClouds opacity={0.3} />
        <div style={{ position:"relative", zIndex:1 }}>
          <p style={{ ...arabic, fontSize:"1.6rem", color:C.lightBlue, lineHeight:1.9, marginBottom:4 }}>
            وَالسَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللّٰهِ وَبَرَكَاتُهُ
          </p>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", color:"#38BDF8", fontSize:"0.72rem", marginBottom:20 }}>
            Wassalamu'alaikum Warahmatullahi Wabarakatuh
          </p>
          <GoldDivider dots={3} my={16} />
          <p style={{ fontFamily:"'Cormorant Garamond',serif" }} className="text-white text-xl leading-relaxed italic max-w-sm mx-auto">
            "Semoga Allah menghimpun yang terserak dari keduanya, memberkati mereka berdua, dan meningkatkan kualitas keturunannya sebagai pembuka pintu rahmat."
          </p>
          <GoldDivider my={20} />
          <p style={{ ...serif }} className="text-white text-3xl font-semibold mb-1">
            {settings.groom?.split(" ")[0]} &amp; {settings.bride?.split(" ")[0]}
          </p>
          <p style={{ color:C.gold }} className="text-xs tracking-widest mt-1">✦ Turut berbahagia segenap keluarga besar ✦</p>
          <p className="text-sky-400 text-xs mt-6">Wassalamu'alaikum Wr. Wb.</p>
        </div>
      </section>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-sky-100 shadow-xl"
        style={{ background:"rgba(255,255,255,0.95)", backdropFilter:"blur(12px)" }}>
        <div className="flex justify-around items-center py-2 max-w-sm mx-auto">
          {[
            { id:"hero",     icon:"🏠", label:"Home" },
            { id:"mempelai", icon:"💑", label:"Mempelai" },
            { id:"acara",    icon:"📅", label:"Acara" },
            { id:"lokasi",   icon:"📍", label:"Lokasi" },
            { id:"ucapan",   icon:"💌", label:"Ucapan" },
          ].map((nav) => (
            <button key={nav.id} onClick={()=>scrollTo(nav.id)}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all"
              style={{ color:activeSection===nav.id?"#0284C7":"#94A3B8" }}>
              <span className="text-lg">{nav.icon}</span>
              <span className="text-xs font-medium">{nav.label}</span>
              {activeSection===nav.id && <div className="w-1 h-1 rounded-full mt-0.5" style={{ background:"#0284C7" }} />}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

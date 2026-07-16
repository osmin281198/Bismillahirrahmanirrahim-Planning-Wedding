import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";

const INVITATION_MUSIC = "https://myakgpkcqschdyfunlso.supabase.co/storage/v1/object/public/wedding-music/Ada%20Untukmu.mp3";
const BONEKA_URL = "https://myakgpkcqschdyfunlso.supabase.co/storage/v1/object/public/wedding-photos/boneka.png";

// ── Warna Tema Floral ─────────────────────────────────────
const C = {
  green1:  "#2D5016",
  green2:  "#4A7C59",
  green3:  "#7BAE7F",
  green4:  "#C8E6C9",
  cream:   "#FAF7F0",
  cream2:  "#F5EDD9",
  gold:    "#C4A45A",
  gold2:   "#E8CC8A",
  brown:   "#8B6914",
  white:   "#FFFFFF",
  text:    "#2D3A1E",
  textMid: "#4A5E35",
};

const gradMain   = `linear-gradient(160deg, ${C.green1} 0%, ${C.green2} 50%, ${C.green3} 100%)`;
const gradLight  = `linear-gradient(135deg, ${C.green2} 0%, ${C.green3} 100%)`;
const gradCream  = `linear-gradient(160deg, ${C.cream} 0%, ${C.cream2} 100%)`;
const gradGold   = `linear-gradient(135deg, ${C.gold} 0%, ${C.gold2} 100%)`;

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Playfair+Display:wght@400;500;600&display=swap');

@keyframes leafSway {
  0%,100% { transform: rotate(-3deg) translateY(0); }
  50%      { transform: rotate(3deg) translateY(-5px); }
}
@keyframes leafSway2 {
  0%,100% { transform: rotate(3deg) translateY(0); }
  50%      { transform: rotate(-3deg) translateY(-4px); }
}
@keyframes petalFall {
  0%   { opacity:0; transform: translateY(-20px) rotate(0deg) translateX(0); }
  10%  { opacity:1; }
  90%  { opacity:0.6; }
  100% { opacity:0; transform: translateY(100vh) rotate(720deg) translateX(60px); }
}
@keyframes fadeUp {
  from { opacity:0; transform:translateY(20px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes fadeDown {
  from { opacity:0; transform:translateY(-16px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes bounceY {
  0%,100% { transform:translateY(0); }
  50%      { transform:translateY(-8px); }
}
@keyframes musicBar {
  0%,100% { height:4px; }
  50%      { height:16px; }
}
@keyframes glowPulse {
  0%,100% { opacity:0.5; transform:scale(1); }
  50%      { opacity:1; transform:scale(1.1); }
}
@keyframes bonekaIn {
  0%   { opacity:0; transform:scale(0.5) translateY(30px); }
  60%  { opacity:1; transform:scale(1.05) translateY(-5px); }
  100% { opacity:1; transform:scale(1) translateY(0); }
}
@keyframes bonekaFloat {
  0%,100% { transform:translateY(0); }
  50%      { transform:translateY(-8px); }
}
@keyframes overlayIn {
  from { opacity:0; }
  to   { opacity:1; }
}
@keyframes textReveal {
  0%   { opacity:0; transform:translateY(20px); }
  30%  { opacity:1; transform:translateY(0); }
  80%  { opacity:1; }
  100% { opacity:0; transform:translateY(-15px); }
}
@keyframes burstPetal {
  0%   { opacity:1; transform:scale(0) translate(0,0) rotate(0deg); }
  100% { opacity:0; transform:scale(1.5) translate(var(--tx),var(--ty)) rotate(180deg); }
}
@keyframes ringFloat {
  0%,100% { transform:translateY(0) rotate(-15deg); }
  50%      { transform:translateY(-10px) rotate(-15deg); }
}
@keyframes ringFloat2 {
  0%,100% { transform:translateY(0) rotate(15deg); }
  50%      { transform:translateY(-8px) rotate(15deg); }
}
@keyframes sectionIn {
  from { opacity:0; transform:translateY(30px); }
  to   { opacity:1; transform:translateY(0); }
}

@media (prefers-reduced-motion:reduce) {
  *,*::before,*::after { animation:none!important; transition:none!important; }
}
`;

const FlowerSVG = ({ size=60, color=C.green3, opacity=0.6 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ opacity }}>
    {[0,45,90,135,180,225,270,315].map((angle, i) => (
      <ellipse key={i} cx={50} cy={25} rx={8} ry={14}
        fill={color} opacity={0.7}
        transform={`rotate(${angle} 50 50)`} />
    ))}
    <circle cx={50} cy={50} r={12} fill={C.gold} opacity={0.9} />
    <circle cx={50} cy={50} r={7} fill={C.gold2} />
  </svg>
);

const LeafSVG = ({ size=40, color=C.green2, flip=false }) => (
  <svg width={size} height={size*1.5} viewBox="0 0 40 60"
    style={{ transform: flip ? "scaleX(-1)" : "none" }}>
    <path d="M20 55 C20 55 2 35 5 15 C8 0 20 2 20 2 C20 2 32 0 35 15 C38 35 20 55 20 55Z"
      fill={color} opacity={0.8} />
    <path d="M20 55 L20 5" stroke={C.green1} strokeWidth={1.5} opacity={0.5} />
    <path d="M20 20 C14 18 10 22 8 28" stroke={C.green1} strokeWidth={1} opacity={0.4} fill="none" />
    <path d="M20 20 C26 18 30 22 32 28" stroke={C.green1} strokeWidth={1} opacity={0.4} fill="none" />
  </svg>
);

const FallingPetals = () => {
  const petals = [
    { left:"10%", delay:"0s",   dur:"6s",  color:C.green3 },
    { left:"25%", delay:"1.5s", dur:"7s",  color:C.gold },
    { left:"40%", delay:"0.8s", dur:"5.5s",color:C.green4 },
    { left:"60%", delay:"2s",   dur:"8s",  color:C.green3 },
    { left:"75%", delay:"0.3s", dur:"6.5s",color:C.gold2 },
    { left:"88%", delay:"1.2s", dur:"7.5s",color:C.green3 },
    { left:"15%", delay:"3s",   dur:"6s",  color:C.gold },
    { left:"55%", delay:"2.5s", dur:"5s",  color:C.green4 },
  ];
  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none", zIndex:1 }}>
      {petals.map((p, i) => (
        <div key={i} style={{
          position:"absolute", top:"-20px", left:p.left,
          animation:`petalFall ${p.dur} ${p.delay} ease-in infinite`,
        }}>
          <svg width={12} height={16} viewBox="0 0 12 16">
            <ellipse cx={6} cy={8} rx={5} ry={7} fill={p.color} opacity={0.7} />
          </svg>
        </div>
      ))}
    </div>
  );
};

const FloralHeader = ({ light=false }) => (
  <div style={{ position:"relative", width:"100%", height:80, marginBottom:-20 }}>
    <div style={{ position:"absolute", left:0, bottom:0,
      animation:"leafSway 4s ease-in-out infinite" }}>
      <LeafSVG size={35} color={light ? C.green3 : C.green4} />
    </div>
    <div style={{ position:"absolute", left:30, bottom:10,
      animation:"leafSway2 5s ease-in-out infinite" }}>
      <LeafSVG size={25} color={light ? C.green2 : C.green3} />
    </div>
    <div style={{ position:"absolute", left:"50%", transform:"translateX(-50%)", top:0 }}>
      <FlowerSVG size={50} color={light ? C.green2 : C.green3} opacity={0.8} />
    </div>
    <div style={{ position:"absolute", right:30, bottom:10,
      animation:"leafSway 5s 1s ease-in-out infinite" }}>
      <LeafSVG size={25} color={light ? C.green2 : C.green3} flip />
    </div>
    <div style={{ position:"absolute", right:0, bottom:0,
      animation:"leafSway2 4s ease-in-out infinite" }}>
      <LeafSVG size={35} color={light ? C.green3 : C.green4} flip />
    </div>
  </div>
);

const FloralFooter = ({ light=false }) => (
  <div style={{ position:"relative", width:"100%", height:80, marginTop:-20 }}>
    <div style={{ position:"absolute", left:0, top:0, transform:"scaleY(-1)",
      animation:"leafSway2 4.5s ease-in-out infinite" }}>
      <LeafSVG size={35} color={light ? C.green3 : C.green4} />
    </div>
    <div style={{ position:"absolute", left:"50%", transform:"translateX(-50%) scaleY(-1)", top:0 }}>
      <FlowerSVG size={45} color={light ? C.green2 : C.green3} opacity={0.7} />
    </div>
    <div style={{ position:"absolute", right:0, top:0, transform:"scaleY(-1)",
      animation:"leafSway 4.5s ease-in-out infinite" }}>
      <LeafSVG size={35} color={light ? C.green3 : C.green4} flip />
    </div>
  </div>
);

const GoldDivider = ({ my=20 }) => (
  <div style={{ display:"flex", alignItems:"center", gap:10, margin:`${my}px 0` }}>
    <div style={{ flex:1, height:1, background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }} />
    <FlowerSVG size={20} color={C.gold} opacity={1} />
    <div style={{ flex:1, height:1, background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }} />
  </div>
);

const QuranCard = () => (
  <div style={{
    background:`linear-gradient(135deg,rgba(196,164,90,0.08),rgba(196,164,90,0.03))`,
    border:`1px solid rgba(196,164,90,0.25)`, borderRadius:20,
    padding:"24px 20px", textAlign:"center",
    position:"relative", overflow:"hidden",
  }}>
    <div style={{ position:"absolute", top:-10, left:-10, opacity:0.08 }}>
      <FlowerSVG size={80} color={C.green2} opacity={1} />
    </div>
    <div style={{ position:"absolute", bottom:-10, right:-10, opacity:0.08 }}>
      <FlowerSVG size={80} color={C.green2} opacity={1} />
    </div>
    <p style={{ color:C.gold, fontSize:"0.58rem", letterSpacing:"0.2em",
      textTransform:"uppercase", marginBottom:12, position:"relative" }}>Q.S. Ar-Rum : 21</p>
    <p style={{ fontFamily:"'Amiri',serif", direction:"rtl", fontSize:"1.2rem",
      color:C.green1, lineHeight:2.2, marginBottom:12, position:"relative" }}>
      وَمِنْ اٰيٰتِهٖٓ اَنْ خَلَقَ لَكُمْ مِّنْ اَنْفُسِكُمْ اَزْوَاجًا لِّتَسْكُنُوْٓا اِلَيْهَا وَجَعَلَ بَيْنَكُمْ مَّوَدَّةً وَّرَحْمَةً
    </p>
    <GoldDivider my={8} />
    <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic",
      fontSize:"0.82rem", color:C.textMid, lineHeight:1.8, position:"relative" }}>
      "Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang."
    </p>
  </div>
);

function FloatingMusic() {
  const audioRef              = useRef(null);
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
    document.addEventListener("touchstart", tryPlay, { once:true });
    document.addEventListener("click", tryPlay, { once:true });
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

  const handleEnded = () => {
    if (audioRef.current) { audioRef.current.currentTime=0; audioRef.current.play().then(()=>setPlaying(true)).catch(()=>{}); }
  };

  return (
    <div style={{ position:"fixed", bottom:80, right:14, zIndex:50,
      display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8 }}>
      <audio ref={audioRef} src={INVITATION_MUSIC} preload="auto" onEnded={handleEnded} />
      {showVol && (
        <div style={{ background:C.cream, borderRadius:14, padding:"10px 8px",
          border:`1px solid rgba(196,164,90,0.3)`, boxShadow:"0 8px 24px rgba(0,0,0,0.15)",
          display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
          <span style={{ fontSize:"0.6rem", color:C.green2 }}>🔊</span>
          <input type="range" min={0} max={1} step={0.01} value={volume}
            onChange={e => { setVolume(parseFloat(e.target.value)); if(audioRef.current) audioRef.current.volume=parseFloat(e.target.value); }}
            style={{ writingMode:"vertical-lr", direction:"rtl", height:60, accentColor:C.green2 }} />
          <span style={{ fontSize:"0.6rem", color:C.green2 }}>🔈</span>
        </div>
      )}
      <div style={{ display:"flex", gap:8, alignItems:"flex-end" }}>
        {playing && (
          <div style={{ display:"flex", gap:2, alignItems:"flex-end", height:20 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ width:3, borderRadius:2, background:C.green2,
                animation:`musicBar ${0.4+i*0.1}s ease-in-out infinite alternate` }} />
            ))}
          </div>
        )}
        <button onClick={e=>{e.stopPropagation();setShowVol(!showVol)}}
          style={{ width:36, height:36, borderRadius:"50%", background:C.cream,
            border:`1px solid rgba(196,164,90,0.3)`, boxShadow:"0 4px 12px rgba(0,0,0,0.1)",
            display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>🎚</button>
        <button onClick={togglePlay}
          style={{ width:46, height:46, borderRadius:"50%", background:gradGold,
            boxShadow:`0 4px 16px rgba(196,164,90,0.4)`, border:"none",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"1.1rem", color:"white", cursor:"pointer" }}>
          {playing ? "⏸" : "▶"}
        </button>
      </div>
    </div>
  );
}

function OpeningAnimation({ visible, groom, bride }) {
  if (!visible) return null;
  const petals = [
    { top:"8%",  left:"12%", delay:"0s",    tx:"-40px", ty:"-30px" },
    { top:"12%", left:"82%", delay:"0.2s",  tx:"35px",  ty:"-40px" },
    { top:"78%", left:"8%",  delay:"0.4s",  tx:"-30px", ty:"30px"  },
    { top:"82%", left:"88%", delay:"0.3s",  tx:"40px",  ty:"35px"  },
    { top:"40%", left:"2%",  delay:"0.5s",  tx:"-45px", ty:"0px"   },
    { top:"45%", left:"94%", delay:"0.15s", tx:"45px",  ty:"0px"   },
    { top:"3%",  left:"50%", delay:"0.25s", tx:"0px",   ty:"-50px" },
    { top:"92%", left:"50%", delay:"0.35s", tx:"0px",   ty:"50px"  },
  ];
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:200,
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:`linear-gradient(160deg, ${C.green1} 0%, ${C.green2} 60%, ${C.green3} 100%)`,
      animation:"overlayIn 0.4s ease both", overflow:"hidden",
    }}>
      {petals.map((p,i) => (
        <div key={i} style={{ position:"absolute", top:p.top, left:p.left,
          "--tx":p.tx, "--ty":p.ty, animation:`burstPetal 2s ${p.delay} ease-out both` }}>
          <svg width={14} height={18} viewBox="0 0 14 18">
            <ellipse cx={7} cy={9} rx={6} ry={8} fill={C.gold} opacity={0.8} />
          </svg>
        </div>
      ))}
      <div style={{ position:"absolute", top:0, left:0, opacity:0.3, animation:"leafSway 3s ease-in-out infinite" }}>
        <FlowerSVG size={100} color={C.green4} opacity={1} />
      </div>
      <div style={{ position:"absolute", top:0, right:0, opacity:0.3, animation:"leafSway2 3s ease-in-out infinite" }}>
        <FlowerSVG size={100} color={C.green4} opacity={1} />
      </div>
      <div style={{ position:"absolute", bottom:0, left:0, opacity:0.2, transform:"rotate(180deg)" }}>
        <FlowerSVG size={120} color={C.green4} opacity={1} />
      </div>
      <div style={{ position:"absolute", bottom:0, right:0, opacity:0.2, transform:"rotate(180deg)" }}>
        <FlowerSVG size={120} color={C.green4} opacity={1} />
      </div>
      <div style={{ position:"absolute", top:"8%", left:"5%", fontSize:"1.8rem",
        filter:`drop-shadow(0 0 12px ${C.gold})`,
        animation:"ringFloat 2s ease-in-out infinite" }}>💍</div>
      <div style={{ position:"absolute", top:"8%", right:"5%", fontSize:"1.8rem",
        filter:`drop-shadow(0 0 12px ${C.gold})`,
        animation:"ringFloat2 2s 0.3s ease-in-out infinite" }}>💍</div>
      <div style={{ position:"absolute", width:280, height:280, borderRadius:"50%",
        background:`radial-gradient(circle,rgba(196,164,90,0.2) 0%,transparent 70%)`,
        animation:"glowPulse 1.5s ease-in-out infinite" }} />
      <div style={{ position:"relative", zIndex:10, marginBottom:20,
        animation:"bonekaIn 0.8s ease both, bonekaFloat 2s 0.8s ease-in-out infinite",
        filter:`drop-shadow(0 12px 30px rgba(0,0,0,0.4))` }}>
        <img src={BONEKA_URL} alt="Boneka"
          style={{ width:200, height:"auto", objectFit:"contain", borderRadius:20,
            border:`3px solid rgba(196,164,90,0.5)`,
            boxShadow:`0 0 30px rgba(196,164,90,0.3)`, display:"block" }}
          onError={e => e.target.style.display="none"} />
      </div>
      <div style={{ textAlign:"center", zIndex:10,
        animation:"textReveal 2.8s 0.5s ease both" }}>
        <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"0.65rem",
          color:C.gold2, letterSpacing:"0.35em", textTransform:"uppercase", marginBottom:8 }}>
          ✿ The Wedding Of ✿
        </p>
        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2rem",
          color:"white", fontWeight:600, letterSpacing:2,
          textShadow:`0 0 30px rgba(196,164,90,0.5)` }}>
          {groom?.split(" ")[0] || "Ridwan"} &amp; {bride?.split(" ")[0] || "Nurlaila"}
        </p>
        <p style={{ color:C.gold, fontSize:"0.68rem", letterSpacing:"0.3em",
          textTransform:"uppercase", marginTop:8 }}>✦ Membuka Undangan ✦</p>
      </div>
      {[...Array(12)].map((_,i) => (
        <div key={i} style={{ position:"absolute",
          width:4+(i%3)*2, height:4+(i%3)*2, borderRadius:"50%",
          background: i%2===0 ? C.gold : C.green4,
          top:`${10+(i*7)%80}%`, left:`${5+(i*13)%85}%`,
          animation:`glowPulse ${1+i*0.15}s ${i*0.1}s ease-in-out infinite` }} />
      ))}
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
        days:    Math.floor(diff/86400000),
        hours:   Math.floor((diff%86400000)/3600000),
        minutes: Math.floor((diff%3600000)/60000),
        seconds: Math.floor((diff%60000)/1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return time;
}

function useInView(ref) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setVisible(true);
    }, { threshold:0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return visible;
}

function Section({ children, style={} }) {
  const ref = useRef();
  const visible = useInView(ref);
  return (
    <div ref={ref} style={{
      ...style,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(30px)",
      transition: "opacity 0.8s ease, transform 0.8s ease",
    }}>
      {children}
    </div>
  );
}

export default function InvitationView() {
  const { slug } = useParams();
  const [settings, setSettings] = useState({
    groom:"", bride:"", groom_father:"", groom_mother:"",
    bride_father:"", bride_mother:"", photo_url:"",
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
  const [gallery, setGallery]             = useState([]);
  const [lightbox, setLightbox]           = useState(null);

  const countdown = useCountdown(settings.wedding_date);
  const guestName = slug?.replace(/-/g," ")?.replace(/\b\w/g,l=>l.toUpperCase()) || "Tamu Undangan";

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = STYLES;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  useEffect(() => {
    
  const notesRes = supabase
  .from("notes")
  .select("photo_url,content,author,type")
  .neq("photo_url", "")
  .eq("in_gallery", true)          // ⬅️ tambahkan ini
  .order("created_at", { ascending: false });

    Promise.all([
      supabase.from("settings").select("*").eq("id",1).single(),
      supabase.from("rsvp").select("*").order("id",{ascending:false}),
    ]).then(async ([sRes, wRes]) => {
      if (!sRes.error && sRes.data) setSettings(sRes.data);
      if (!wRes.error && wRes.data) setWishes(wRes.data);
      const nRes = await notesRes;
      if (!nRes.error && nRes.data) setGallery(nRes.data);
    });
  }, []);

  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString("id-ID",{weekday:"long",year:"numeric",month:"long",day:"numeric"})
    : "Segera";

  const handleBuka = () => {
    setAnimating(true);
    setTimeout(() => { setOpened(true); setAnimating(false); }, 3000);
  };

  const submitRsvp = async () => {
    if (!rsvpName) return;
    const w = { id:Date.now(), name:rsvpName, message:rsvpMsg, attendance:rsvpAttend };
    const { error } = await supabase.from("rsvp").insert(w);
    if (!error) {
      setWishes([w,...wishes]);
      setRsvpName(""); setRsvpMsg(""); setRsvpAttend("Hadir");
      setWishSubmitted(true);
      setTimeout(()=>setWishSubmitted(false), 3000);
    }
  };

  const copyText = async (text, key) => {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const el = document.createElement("textarea");
      el.value=text; el.style.cssText="position:fixed;opacity:0";
      document.body.appendChild(el); el.focus(); el.select();
      document.execCommand("copy"); document.body.removeChild(el);
    }
    setCopied(key); setTimeout(()=>setCopied(""),2000);
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({behavior:"smooth"});
    setActiveSection(id);
  };

  const serif   = { fontFamily:"'Cormorant Garamond',serif" };
  const display = { fontFamily:"'Playfair Display',serif" };
  const arabic  = { fontFamily:"'Amiri',serif", direction:"rtl" };

  const inputStyle = {
    width:"100%", padding:"13px 16px", borderRadius:12, fontSize:"0.88rem",
    background:"rgba(255,255,255,0.7)", border:`1px solid rgba(74,124,89,0.2)`,
    color:C.text, outline:"none", boxSizing:"border-box",
    fontFamily:"'Inter',sans-serif",
  };

  const glassCard = {
    background:"rgba(255,255,255,0.85)",
    backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)",
    border:`1px solid rgba(196,164,90,0.2)`,
    borderRadius:20, boxShadow:"0 8px 32px rgba(45,80,22,0.1)",
  };

  if (!opened) {
    return (
      <>
        <OpeningAnimation visible={animating} groom={settings.groom} bride={settings.bride} />
        <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"space-between",
          padding:"40px 24px", textAlign:"center",
          background:gradMain, position:"relative", overflow:"hidden",
          fontFamily:"'Inter',sans-serif" }}>

          <FallingPetals />

          <div style={{ position:"relative", zIndex:2, width:"100%", animation:"fadeDown 1s ease both" }}>
            <p style={{ ...arabic, fontSize:"1.6rem", color:C.green4, lineHeight:1.8 }}>
              بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
            </p>
            <p style={{ color:C.green4, fontSize:"0.6rem", letterSpacing:"0.3em",
              textTransform:"uppercase", marginTop:4, opacity:0.8 }}>Undangan Pernikahan</p>
            <div style={{ width:60, height:1, margin:"10px auto",
              background:`linear-gradient(90deg,transparent,${C.gold},transparent)` }} />
            <FloralHeader />
          </div>

          <div style={{ position:"relative", zIndex:2, animation:"fadeDown 1s 0.2s ease both" }}>
            <div style={{ marginBottom:16, display:"flex", justifyContent:"center" }}>
              <div style={{ position:"relative", display:"inline-block" }}>
                <div style={{ position:"absolute", inset:-3, borderRadius:22,
                  background:gradGold, opacity:0.6 }} />
                <img src={BONEKA_URL} alt="Boneka"
                  style={{ position:"relative", width:"65vw", maxWidth:230, height:"auto",
                    objectFit:"contain", borderRadius:20, display:"block",
                    boxShadow:`0 12px 40px rgba(45,80,22,0.4)` }}
                  onError={e=>e.target.style.display="none"} />
              </div>
            </div>

            <h1 style={{ ...display, fontSize:"3rem", fontWeight:600,
              color:"white", lineHeight:1.1, textShadow:`0 2px 20px rgba(0,0,0,0.3)` }}>
              {settings.groom?.split(" ")[0] || "Ridwan"}
            </h1>
            <p style={{ ...display, fontSize:"1.8rem", color:C.gold, margin:"4px 0" }}>&amp;</p>
            <h1 style={{ ...display, fontSize:"3rem", fontWeight:600,
              color:"white", lineHeight:1.1, textShadow:`0 2px 20px rgba(0,0,0,0.3)`,
              marginBottom:20 }}>
              {settings.bride?.split(" ")[0] || "Nurlaila"}
            </h1>

            <div style={{ ...glassCard, padding:"16px 24px", marginBottom:20, maxWidth:320, margin:"0 auto 20px" }}>
              <p style={{ color:C.textMid, fontSize:"0.65rem", letterSpacing:"0.2em",
                textTransform:"uppercase", marginBottom:6 }}>Kepada Yth.</p>
              <p style={{ ...serif, fontSize:"1.3rem", color:C.green1,
                fontWeight:600, textTransform:"capitalize" }}>{guestName}</p>
              <p style={{ color:C.textMid, fontSize:"0.7rem", marginTop:4, opacity:0.7 }}>
                Mohon maaf bila ada kesalahan penulisan nama
              </p>
            </div>

            <button onClick={handleBuka} disabled={animating}
              style={{ padding:"14px 36px", borderRadius:99, border:"none",
                background:gradGold, color:C.green1, fontWeight:700,
                fontSize:"0.9rem", letterSpacing:"0.05em", cursor:"pointer",
                boxShadow:`0 8px 24px rgba(196,164,90,0.4)`,
                transition:"all 0.2s", opacity:animating?0.7:1 }}>
              {animating ? "✿ Membuka..." : "✉ Buka Undangan"}
            </button>
          </div>

          <div style={{ position:"relative", zIndex:2, width:"100%" }}>
            <FloralFooter />
            <p style={{ color:C.green4, fontSize:"0.82rem", opacity:0.8, marginTop:8 }}>
              {formatDate(settings.wedding_date)}
            </p>
            {settings.wedding_location && (
              <p style={{ color:C.green4, fontSize:"0.7rem", opacity:0.6, marginTop:2 }}>
                📍 {settings.wedding_location}
              </p>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <div style={{ fontFamily:"'Inter',sans-serif", background:C.cream, overflowX:"hidden" }}
      className="pb-20">
      <FloatingMusic />

      <section id="hero" style={{
        minHeight:"100vh", display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center", textAlign:"center",
        padding:"40px 24px", background:gradMain, position:"relative", overflow:"hidden",
      }}>
        <FallingPetals />
        <div style={{ position:"absolute", inset:0, opacity:0.04,
          backgroundImage:"radial-gradient(circle,white 1px,transparent 1px)",
          backgroundSize:"24px 24px" }} />

        <div style={{ position:"relative", zIndex:2, animation:"fadeDown 0.9s ease both" }}>
          <p style={{ ...arabic, fontSize:"1.8rem", color:C.green4, lineHeight:1.9, marginBottom:8 }}>
            بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
          </p>
          <GoldDivider my={12} />
          <p style={{ color:C.green4, fontSize:"0.6rem", letterSpacing:"0.35em",
            textTransform:"uppercase", marginBottom:12, opacity:0.9 }}>The Wedding Of</p>
          <h1 style={{ ...display, fontSize:"4.5rem", fontWeight:600, color:"white",
            lineHeight:1, textShadow:`0 4px 20px rgba(0,0,0,0.3)` }}>
            {settings.groom?.split(" ")[0]}
          </h1>
          <p style={{ ...display, fontSize:"2.5rem", color:C.gold, margin:"6px 0" }}>&amp;</p>
          <h1 style={{ ...display, fontSize:"4.5rem", fontWeight:600, color:"white",
            lineHeight:1, textShadow:`0 4px 20px rgba(0,0,0,0.3)`, marginBottom:20 }}>
            {settings.bride?.split(" ")[0]}
          </h1>

          <p style={{ color:C.green4, fontSize:"0.85rem", opacity:0.85, marginBottom:24 }}>
            {formatDate(settings.wedding_date)}
          </p>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, maxWidth:320, margin:"0 auto" }}>
            {[
              { val:countdown.days,    label:"Hari" },
              { val:countdown.hours,   label:"Jam" },
              { val:countdown.minutes, label:"Menit" },
              { val:countdown.seconds, label:"Detik" },
            ].map(({val,label}) => (
              <div key={label} style={{ textAlign:"center" }}>
                <div style={{ ...glassCard, padding:"12px 8px", marginBottom:6,
                  background:"rgba(255,255,255,0.15)" }}>
                  <p style={{ fontSize:"1.8rem", fontWeight:700, color:"white",
                    fontFamily:"'Playfair Display',serif", margin:0 }}>
                    {String(val).padStart(2,"0")}
                  </p>
                </div>
                <p style={{ color:C.green4, fontSize:"0.62rem", letterSpacing:"0.1em",
                  textTransform:"uppercase", opacity:0.8 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position:"absolute", bottom:20, zIndex:2,
          animation:"bounceY 2s ease-in-out infinite", color:C.green4, fontSize:"0.8rem" }}>
          ↓ scroll
        </div>
      </section>

      <section style={{ padding:"0 24px 40px", background:C.cream }}>
        <FloralHeader light />
        <Section>
          <QuranCard />
          <div style={{ textAlign:"center", marginTop:24, padding:"0 8px" }}>
            <h2 style={{ ...serif, fontSize:"1.8rem", fontWeight:600, color:C.green1, marginBottom:12 }}>
              Assalamu'alaikum Wr. Wb.
            </h2>
            <p style={{ color:C.textMid, fontSize:"0.88rem", lineHeight:1.9, maxWidth:340, margin:"0 auto" }}>
              Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara(i) untuk menghadiri acara pernikahan putra-putri kami.
            </p>
          </div>
        </Section>
        <FloralFooter light />
      </section>

      <section id="mempelai" style={{ padding:"20px 20px 40px",
        background:`linear-gradient(180deg,${C.cream2} 0%,${C.cream} 100%)` }}>
        <Section>
          <div style={{ textAlign:"center", marginBottom:24 }}>
            <p style={{ color:C.gold, fontSize:"0.6rem", letterSpacing:"0.25em",
              textTransform:"uppercase", marginBottom:6 }}>Mempelai</p>
            <h2 style={{ ...serif, fontSize:"2rem", fontWeight:600, color:C.green1 }}>
              Kedua Mempelai
            </h2>
            <GoldDivider my={12} />
          </div>

          <div style={{ ...glassCard, padding:"28px 20px", textAlign:"center", marginBottom:12 }}>
            <div style={{ width:80, height:80, borderRadius:"50%", margin:"0 auto 14px",
              background:gradLight, display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:"2.5rem",
              boxShadow:`0 8px 20px rgba(74,124,89,0.3)` }}>
              {settings.photo_url ? (
                <img src={settings.photo_url} alt="Foto"
                  style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:"50%" }} />
              ) : "👰"}
            </div>
            <h3 style={{ ...serif, fontSize:"1.5rem", fontWeight:600, color:C.green1, marginBottom:4 }}>
              {settings.bride}
            </h3>
            <p style={{ color:C.gold, fontSize:"0.6rem", letterSpacing:"0.2em",
              textTransform:"uppercase", marginBottom:12 }}>Mempelai Wanita</p>
            {(settings.bride_father||settings.bride_mother) && (
              <>
                <div style={{ height:1, background:`rgba(196,164,90,0.2)`, margin:"12px 0" }} />
                <p style={{ color:C.textMid, fontSize:"0.8rem" }}>Putri dari</p>
                <p style={{ color:C.text, fontSize:"0.88rem", fontWeight:600, marginTop:4 }}>
                  {settings.bride_father && `Bpk. ${settings.bride_father}`}
                  {settings.bride_father && settings.bride_mother && " & "}
                  {settings.bride_mother && `Ibu ${settings.bride_mother}`}
                </p>
              </>
            )}
          </div>

          <div style={{ textAlign:"center", margin:"8px 0" }}>
            <FlowerSVG size={32} color={C.gold} opacity={0.8} />
          </div>

          <div style={{ ...glassCard, padding:"28px 20px", textAlign:"center" }}>
            <div style={{ width:80, height:80, borderRadius:"50%", margin:"0 auto 14px",
              background:gradLight, display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:"2.5rem",
              boxShadow:`0 8px 20px rgba(74,124,89,0.3)` }}>🤵</div>
            <h3 style={{ ...serif, fontSize:"1.5rem", fontWeight:600, color:C.green1, marginBottom:4 }}>
              {settings.groom}
            </h3>
            <p style={{ color:C.gold, fontSize:"0.6rem", letterSpacing:"0.2em",
              textTransform:"uppercase", marginBottom:12 }}>Mempelai Pria</p>
            {(settings.groom_father||settings.groom_mother) && (
              <>
                <div style={{ height:1, background:`rgba(196,164,90,0.2)`, margin:"12px 0" }} />
                <p style={{ color:C.textMid, fontSize:"0.8rem" }}>Putra dari</p>
                <p style={{ color:C.text, fontSize:"0.88rem", fontWeight:600, marginTop:4 }}>
                  {settings.groom_father && `Bpk. ${settings.groom_father}`}
                  {settings.groom_father && settings.groom_mother && " & "}
                  {settings.groom_mother && `Ibu ${settings.groom_mother}`}
                </p>
              </>
            )}
          </div>
        </Section>
      </section>

      <section id="acara" style={{ padding:"20px 20px 40px", background:C.cream }}>
        <div style={{ position:"relative" }}>
          <FloralHeader light />
        </div>
        <Section>
          <div style={{ textAlign:"center", marginBottom:24 }}>
            <p style={{ color:C.gold, fontSize:"0.6rem", letterSpacing:"0.25em",
              textTransform:"uppercase", marginBottom:6 }}>Tanggal & Waktu</p>
            <h2 style={{ ...serif, fontSize:"2rem", fontWeight:600, color:C.green1 }}>
              Acara Pernikahan
            </h2>
            <GoldDivider my={12} />
          </div>

          {["Akad Nikah","Resepsi"].map((label,idx) => (
            <div key={label} style={{ ...glassCard, marginBottom:14, overflow:"hidden" }}>
              <div style={{ padding:"12px 20px", textAlign:"center",
                background:gradLight, borderRadius:"20px 20px 0 0" }}>
                <p style={{ color:"white", fontSize:"0.75rem", fontWeight:700,
                  letterSpacing:"0.25em", textTransform:"uppercase" }}>{label}</p>
              </div>
              <div style={{ padding:"20px", textAlign:"center" }}>
                {settings.wedding_date ? (
                  <>
                    <p style={{ color:C.textMid, fontSize:"0.72rem", letterSpacing:"0.1em",
                      textTransform:"uppercase", marginBottom:6 }}>
                      {new Date(settings.wedding_date).toLocaleDateString("id-ID",{weekday:"long"})}
                    </p>
                    <p style={{ ...display, fontSize:"3.5rem", fontWeight:600,
                      color:C.green1, lineHeight:1 }}>
                      {new Date(settings.wedding_date).getDate()}
                    </p>
                    <p style={{ ...serif, fontSize:"1.2rem", color:C.green2 }}>
                      {new Date(settings.wedding_date).toLocaleDateString("id-ID",{month:"long",year:"numeric"})}
                    </p>
                  </>
                ) : <p style={{ color:C.textMid }}>Tanggal belum diatur</p>}
                <div style={{ height:1, background:`rgba(196,164,90,0.2)`, margin:"14px 0" }} />
                <p style={{ color:C.green2, fontWeight:600, fontSize:"0.88rem" }}>
                  {settings.wedding_time
                    ? (idx===0 ? settings.wedding_time : settings.wedding_time+" — Selesai")
                    : "Waktu belum diatur"}
                </p>
                <p style={{ color:C.textMid, fontSize:"0.82rem", marginTop:4 }}>
                  {settings.wedding_location || "Lokasi belum diatur"}
                </p>
              </div>
            </div>
          ))}
        </Section>
        <FloralFooter light />
      </section>

      <section id="lokasi" style={{ padding:"20px 20px 40px",
        background:`linear-gradient(180deg,${C.cream2} 0%,${C.cream} 100%)` }}>
        <Section>
          <div style={{ textAlign:"center", marginBottom:20 }}>
            <p style={{ color:C.gold, fontSize:"0.6rem", letterSpacing:"0.25em",
              textTransform:"uppercase", marginBottom:6 }}>Lokasi</p>
            <h2 style={{ ...serif, fontSize:"2rem", fontWeight:600, color:C.green1 }}>
              Tempat Acara
            </h2>
            <GoldDivider my={12} />
          </div>
          <div style={{ ...glassCard, overflow:"hidden" }}>
            <div style={{ width:"100%", height:200, overflow:"hidden" }}>
              <iframe title="Lokasi" width="100%" height="100%" loading="lazy" style={{ border:0 }}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(settings.wedding_location||"Bandung")}&t=m&z=14&output=embed&iwloc=near`} />
            </div>
            <div style={{ padding:"20px", textAlign:"center" }}>
              <p style={{ fontWeight:600, color:C.green1, fontSize:"0.9rem", marginBottom:12 }}>
                {settings.wedding_location || "Lokasi belum diatur"}
              </p>
              <a href={`https://maps.google.com/?q=${encodeURIComponent(settings.wedding_location||"Bandung")}`}
                target="_blank" rel="noreferrer"
                style={{ display:"inline-block", padding:"10px 24px", borderRadius:99,
                  background:gradGold, color:C.green1, fontSize:"0.82rem", fontWeight:700,
                  textDecoration:"none", boxShadow:`0 4px 14px rgba(196,164,90,0.3)` }}>
                📍 Buka Google Maps
              </a>
            </div>
          </div>
        </Section>
      </section>

      {gallery.length > 0 && (
        <section style={{ padding:"20px 20px 40px", background:C.cream }}>
          <FloralHeader light />
          <Section>
            <div style={{ textAlign:"center", marginBottom:20 }}>
              <p style={{ color:C.gold, fontSize:"0.6rem", letterSpacing:"0.25em",
                textTransform:"uppercase", marginBottom:6 }}>Galeri</p>
              <h2 style={{ ...serif, fontSize:"2rem", fontWeight:600, color:C.green1 }}>
                Momen Berharga
              </h2>
              <GoldDivider my={12} />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {gallery.map((g, i) => (
                <div key={i} onClick={() => setLightbox(g)}
                  style={{ cursor:"pointer", borderRadius:14, overflow:"hidden",
                    position:"relative", aspectRatio:"1",
                    boxShadow:"0 4px 16px rgba(45,80,22,0.2)" }}>
                  <img src={g.photo_url} alt={g.author||"Foto"}
                    style={{ width:"100%", height:"100%", objectFit:"cover",
                      display:"block", transition:"transform 0.3s" }} />
                  <div style={{ position:"absolute", inset:0,
                    background:"linear-gradient(to top,rgba(45,80,22,0.7) 0%,transparent 50%)" }} />
                  {g.author && (
                    <p style={{ position:"absolute", bottom:8, left:10, right:10,
                      color:"white", fontSize:"0.65rem", fontWeight:600, margin:0,
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {g.author}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Section>
          <FloralFooter light />
        </section>
      )}

      {lightbox && (
        <div onClick={() => setLightbox(null)}
          style={{ position:"fixed", inset:0, zIndex:100,
            background:"rgba(0,0,0,0.92)", backdropFilter:"blur(8px)",
            display:"flex", flexDirection:"column", alignItems:"center",
            justifyContent:"center", padding:20 }}>
          <img src={lightbox.photo_url} alt={lightbox.author||"Foto"}
            style={{ maxWidth:"100%", maxHeight:"70vh", objectFit:"contain",
              borderRadius:16, boxShadow:"0 20px 60px rgba(0,0,0,0.5)" }} />
          {lightbox.content && (
            <div style={{ marginTop:16, textAlign:"center", maxWidth:340 }}>
              <p style={{ color:"rgba(255,255,255,0.8)", fontSize:"0.85rem",
                fontStyle:"italic", lineHeight:1.7 }}>"{lightbox.content}"</p>
              {lightbox.author && (
                <p style={{ color:"#C4A45A", fontSize:"0.75rem",
                  fontWeight:600, marginTop:6 }}>— {lightbox.author}</p>
              )}
            </div>
          )}
          <button onClick={() => setLightbox(null)}
            style={{ marginTop:20, padding:"10px 24px", borderRadius:99,
              background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)",
              color:"white", fontSize:"0.82rem", cursor:"pointer" }}>
            ✕ Tutup
          </button>
        </div>
      )}

      <section style={{ padding:"20px 20px 40px", background:C.cream }}>
        <FloralHeader light />
        <Section>
          <div style={{ textAlign:"center", marginBottom:20 }}>
            <p style={{ color:C.gold, fontSize:"0.6rem", letterSpacing:"0.25em",
              textTransform:"uppercase", marginBottom:6 }}>Hadiah</p>
            <h2 style={{ ...serif, fontSize:"2rem", fontWeight:600, color:C.green1 }}>
              Wedding Gift
            </h2>
            <GoldDivider my={12} />
            <p style={{ color:C.textMid, fontSize:"0.82rem" }}>Doa restu Anda adalah karunia terindah.</p>
          </div>
          {[
            { bank:"BRI", no:"1234567890123", an:settings.groom, color:C.green2 },
            { bank:"BCA", no:"9876543210987", an:settings.bride, color:C.green1 },
          ].map(r => (
            <div key={r.bank} style={{ ...glassCard, padding:"18px 20px", marginBottom:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <span style={{ padding:"4px 12px", borderRadius:99, background:r.color,
                  color:"white", fontSize:"0.75rem", fontWeight:700 }}>{r.bank}</span>
                <span style={{ color:C.textMid, fontSize:"0.75rem" }}>A/n {r.an}</span>
              </div>
              <p style={{ fontFamily:"monospace", fontWeight:700, fontSize:"1.1rem",
                color:C.green1, letterSpacing:2, marginBottom:10 }}>{r.no}</p>
              <button onClick={()=>copyText(r.no,r.bank)}
                style={{ width:"100%", padding:"10px", borderRadius:10,
                  background:`rgba(74,124,89,0.08)`, border:`1px solid rgba(74,124,89,0.2)`,
                  color:C.green2, fontSize:"0.8rem", fontWeight:600, cursor:"pointer" }}>
                {copied===r.bank ? "✓ Tersalin!" : "Salin Nomor Rekening"}
              </button>
            </div>
          ))}
        </Section>
        <FloralFooter light />
      </section>

      <section id="ucapan" style={{ padding:"20px 20px 40px",
        background:`linear-gradient(180deg,${C.cream2} 0%,${C.cream} 100%)` }}>
        <Section>
          <div style={{ textAlign:"center", marginBottom:20 }}>
            <p style={{ color:C.gold, fontSize:"0.6rem", letterSpacing:"0.25em",
              textTransform:"uppercase", marginBottom:6 }}>Konfirmasi</p>
            <h2 style={{ ...serif, fontSize:"2rem", fontWeight:600, color:C.green1 }}>
              Ucapan & RSVP
            </h2>
            <GoldDivider my={12} />
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,minmax(0,1fr))",
            gap:10, marginBottom:20 }}>
            {[
              { label:"Hadir",  count:wishes.filter(w=>w.attendance==="Hadir").length,       color:C.green2 },
              { label:"Tidak",  count:wishes.filter(w=>w.attendance==="Tidak Hadir").length, color:"#E57373" },
              { label:"Ragu",   count:wishes.filter(w=>w.attendance==="Masih Ragu").length,  color:C.gold },
            ].map(s => (
              <div key={s.label} style={{ ...glassCard, padding:"14px 10px", textAlign:"center" }}>
                <p style={{ fontSize:"1.5rem", fontWeight:700, color:s.color, margin:0 }}>{s.count}</p>
                <p style={{ fontSize:"0.68rem", color:C.textMid, marginTop:3 }}>{s.label}</p>
              </div>
            ))}
          </div>

          <div style={{ ...glassCard, padding:"20px", marginBottom:16 }}>
            <input style={{ ...inputStyle, marginBottom:10 }}
              placeholder="Nama Anda" value={rsvpName} onChange={e=>setRsvpName(e.target.value)} />
            <select style={{ ...inputStyle, marginBottom:10 }}
              value={rsvpAttend} onChange={e=>setRsvpAttend(e.target.value)}>
              <option>Hadir</option>
              <option>Tidak Hadir</option>
              <option>Masih Ragu</option>
            </select>
            <textarea style={{ ...inputStyle, marginBottom:10, resize:"none" }}
              placeholder="Ucapan & doa untuk mempelai..." rows={3}
              value={rsvpMsg} onChange={e=>setRsvpMsg(e.target.value)} />
            <button onClick={submitRsvp}
              style={{ width:"100%", padding:"13px", borderRadius:12, border:"none",
                background:gradGold, color:C.green1, fontWeight:700,
                fontSize:"0.9rem", cursor:"pointer",
                boxShadow:`0 6px 16px rgba(196,164,90,0.3)` }}>
              Kirim Ucapan
            </button>
            {wishSubmitted && (
              <p style={{ textAlign:"center", color:C.green2, fontSize:"0.85rem", marginTop:10 }}>
                ✿ Terima kasih atas ucapannya!
              </p>
            )}
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {wishes.map(w => (
              <div key={w.id} style={{ ...glassCard, padding:"14px 16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <p style={{ fontWeight:600, color:C.green1, fontSize:"0.88rem" }}>{w.name}</p>
                  <span style={{
                    fontSize:"0.68rem", padding:"3px 10px", borderRadius:99, fontWeight:600,
                    background: w.attendance==="Hadir" ? `rgba(74,124,89,0.12)`
                      : w.attendance==="Tidak Hadir" ? "rgba(229,115,115,0.12)" : "rgba(196,164,90,0.12)",
                    color: w.attendance==="Hadir" ? C.green2
                      : w.attendance==="Tidak Hadir" ? "#E57373" : C.gold,
                    border: `1px solid ${w.attendance==="Hadir" ? "rgba(74,124,89,0.2)"
                      : w.attendance==="Tidak Hadir" ? "rgba(229,115,115,0.2)" : "rgba(196,164,90,0.2)"}`,
                  }}>{w.attendance}</span>
                </div>
                {w.message && (
                  <p style={{ color:C.textMid, fontSize:"0.82rem", fontStyle:"italic",
                    lineHeight:1.6 }}>"{w.message}"</p>
                )}
              </div>
            ))}
          </div>
        </Section>
      </section>

      <section style={{ padding:"0 20px 80px", background:C.cream }}>
        <FloralHeader light />
        <Section>
          <div style={{ textAlign:"center", padding:"20px 0" }}>
            <p style={{ ...arabic, fontSize:"1.5rem", color:C.green2, lineHeight:1.9, marginBottom:8 }}>
              وَالسَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللّٰهِ وَبَرَكَاتُهُ
            </p>
            <p style={{ ...serif, fontStyle:"italic", color:C.textMid,
              fontSize:"0.75rem", marginBottom:20 }}>
              Wassalamu'alaikum Warahmatullahi Wabarakatuh
            </p>
            <GoldDivider />
            <p style={{ ...serif, fontStyle:"italic", color:C.textMid,
              fontSize:"0.88rem", lineHeight:1.8, maxWidth:320, margin:"16px auto" }}>
              "Semoga Allah menghimpun yang terserak dari keduanya, memberkati mereka berdua, dan meningkatkan kualitas keturunannya sebagai pembuka pintu rahmat."
            </p>
            <GoldDivider />
            <div style={{ margin:"16px 0", display:"flex", justifyContent:"center" }}>
              <FlowerSVG size={40} color={C.green2} opacity={0.8} />
            </div>
            <p style={{ ...display, fontSize:"1.8rem", fontWeight:600, color:C.green1 }}>
              {settings.groom?.split(" ")[0]} &amp; {settings.bride?.split(" ")[0]}
            </p>
            <p style={{ color:C.gold, fontSize:"0.7rem", letterSpacing:"0.2em",
              marginTop:8 }}>✦ Turut berbahagia segenap keluarga besar ✦</p>
          </div>
        </Section>
        <FloralFooter light />
      </section>

      <nav style={{
        position:"fixed", bottom:0, left:0, right:0, zIndex:50,
        background:"rgba(250,247,240,0.95)", backdropFilter:"blur(12px)",
        borderTop:`1px solid rgba(196,164,90,0.2)`,
        boxShadow:"0 -4px 24px rgba(45,80,22,0.1)",
      }}>
        <div style={{ display:"flex", justifyContent:"space-around",
          alignItems:"center", padding:"10px 0", maxWidth:480, margin:"0 auto" }}>
          {[
            { id:"hero",     icon:"🏠", label:"Home" },
            { id:"mempelai", icon:"💑", label:"Mempelai" },
            { id:"acara",    icon:"🌿", label:"Acara" },
            { id:"lokasi",   icon:"📍", label:"Lokasi" },
            { id:"ucapan",   icon:"💌", label:"Ucapan" },
          ].map(nav => (
            <button key={nav.id} onClick={()=>scrollTo(nav.id)}
              style={{ display:"flex", flexDirection:"column", alignItems:"center",
                gap:2, padding:"6px 10px", borderRadius:12, border:"none",
                background: activeSection===nav.id ? `rgba(74,124,89,0.12)` : "transparent",
                color: activeSection===nav.id ? C.green2 : C.textMid,
                cursor:"pointer", transition:"all 0.2s" }}>
              <span style={{ fontSize:"1.1rem" }}>{nav.icon}</span>
              <span style={{ fontSize:"0.62rem", fontWeight: activeSection===nav.id ? 700 : 400 }}>
                {nav.label}
              </span>
              {activeSection===nav.id && (
                <div style={{ width:4, height:4, borderRadius:"50%", background:C.green2 }} />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}// GALLERY CHECK

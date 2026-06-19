import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

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
@keyframes fadeUp {
  from { opacity:0; transform:translateY(20px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes bounceY {
  0%,100% { transform:translateY(0); }
  50%      { transform:translateY(-7px); }
}
@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{ animation:none!important; }
}
`;

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
          width:c.w, height:c.h,
          background:"white", borderRadius:50,
          opacity: opacity * (0.6 + i * 0.06),
          filter:"blur(7px)",
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
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const el = document.createElement("textarea");
        el.value = text;
        el.style.cssText = "position:fixed;opacity:0;top:0;left:0";
        document.body.appendChild(el);
        el.focus(); el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setCopied(key);
      setTimeout(()=>setCopied(""), 2000);
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
    borderRadius:24,
    boxShadow:"0 8px 32px rgba(12,74,110,0.09)",
  };

  if (!opened) {
    return (
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
          <h1 style={{ ...serif }} className="text-6xl font-semibold text-white mb-2 leading-tight drop-shadow-lg">
            {settings.groom?.split(" ")[0] || "..."}
          </h1>
          <p style={{ ...serif, color:C.gold }} className="text-3xl my-2">&amp;</p>
          <h1 style={{ ...serif }} className="text-6xl font-semibold text-white mb-6 leading-tight drop-shadow-lg">
            {settings.bride?.split(" ")[0] || "..."}
          </h1>
          <div style={{ display:"flex", alignItems:"center", gap:10, margin:"10px auto", maxWidth:220 }}>
            <div style={{ flex:1, height:1, background:"linear-gradient(90deg,transparent,#C4A45A,transparent)" }} />
            <span style={{ color:C.gold }}>💍</span>
            <div style={{ flex:1, height:1, background:"linear-gradient(90deg,transparent,#C4A45A,transparent)" }} />
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl px-8 py-4 border border-white border-opacity-20 mb-8">
            <p className="text-sky-200 text-xs uppercase tracking-widest mb-1">Kepada Yth.</p>
            <p style={{ ...serif }} className="text-white text-2xl font-medium capitalize">{guestName}</p>
            <p className="text-sky-300 text-xs mt-1">Mohon maaf bila ada kesalahan penulisan nama</p>
          </div>
          <button onClick={()=>setOpened(true)}
            className="px-10 py-4 rounded-full text-sky-900 font-semibold text-sm tracking-wide transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl"
            style={{ background:"linear-gradient(90deg,#BAE6FD,#FFFFFF)" }}>
            ✉ Buka Undangan
          </button>
        </div>
        <div style={{ position:"relative", zIndex:1 }}>
          <p className="text-sky-300 text-sm">{formatDate(settings.wedding_date)}</p>
          {settings.wedding_location && <p className="text-sky-400 text-xs mt-1">{settings.wedding_location}</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily:"'Inter',sans-serif", background:C.cloudBlue }} className="pb-20">

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
        <div className="absolute bottom-8 text-sky-300 text-xs"
          style={{ animation:"bounceY 2s ease-in-out infinite" }}>↓</div>
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
// URL: https://myakgpkcqschdyfunlso.supabase.co/storage/v1/object/public/wedding-music/Ada%20Untukmu.mp3

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function useCountdown(targetDate) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    if (!targetDate) return;
    const tick = () => {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) { setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setTime({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
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
    groom: "...", bride: "...",
    groom_father: "", groom_mother: "",
    bride_father: "", bride_mother: "",
    photo_url: "",
    wedding_date: "", wedding_time: "", wedding_location: "",
  });
  const [opened, setOpened]   = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [rsvpName, setRsvpName]   = useState("");
  const [rsvpMsg, setRsvpMsg]     = useState("");
  const [rsvpAttend, setRsvpAttend] = useState("Hadir");
  const [wishes, setWishes]       = useState([]);
  const [wishSubmitted, setWishSubmitted] = useState(false);
  const [copied, setCopied]       = useState("");

  const countdown = useCountdown(settings.wedding_date);

  const guestName = slug?.replace(/-/g, " ")?.replace(/\b\w/g, (l) => l.toUpperCase()) || "Tamu Undangan";

  useEffect(() => {
    const fetchData = async () => {
      const [settingsRes, wishesRes] = await Promise.all([
        supabase.from("settings").select("*").eq("id", 1).single(),
        supabase.from("rsvp").select("*").order("id", { ascending: false }),
      ]);
      if (!settingsRes.error && settingsRes.data) setSettings(settingsRes.data);
      if (!wishesRes.error && wishesRes.data) setWishes(wishesRes.data);
    };
    fetchData();
  }, []);

  // ✅ Format tanggal dari Settings
  const formatDate = (dateStr) => {
    if (!dateStr) return "Segera";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long", year: "numeric", month: "long", day: "numeric"
    });
  };

  const submitRsvp = async () => {
    if (!rsvpName) return;
    const newWish = { id: Date.now(), name: rsvpName, message: rsvpMsg, attendance: rsvpAttend };
    const { error } = await supabase.from("rsvp").insert(newWish);
    if (!error) {
      setWishes([newWish, ...wishes]);
      setRsvpName(""); setRsvpMsg(""); setRsvpAttend("Hadir");
      setWishSubmitted(true);
      setTimeout(() => setWishSubmitted(false), 3000);
    }
  };

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setActiveSection(id);
  };

  const C = { deepBlue: "#0C4A6E", midBlue: "#0284C7", skyBlue: "#38BDF8", lightBlue: "#BAE6FD", cloudBlue: "#F0F9FF" };
  const gradMain  = `linear-gradient(160deg, ${C.deepBlue} 0%, ${C.midBlue} 60%, ${C.skyBlue} 100%)`;
  const gradLight = `linear-gradient(135deg, ${C.skyBlue} 0%, ${C.midBlue} 100%)`;

  // ── COVER ──────────────────────────────────────────────────
  if (!opened) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-between py-12 px-6 text-center relative overflow-hidden"
        style={{ background: gradMain, fontFamily: "'Inter', sans-serif" }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute rounded-full opacity-10 animate-pulse"
              style={{ background: C.lightBlue, width: Math.random()*80+20+"px", height: Math.random()*80+20+"px", top: Math.random()*100+"%", left: Math.random()*100+"%", animationDelay: Math.random()*3+"s", animationDuration: Math.random()*4+3+"s" }} />
          ))}
        </div>
        <div>
          <p className="text-sky-200 text-xs uppercase tracking-[0.3em] mb-1">Undangan Pernikahan</p>
          <div className="w-16 h-px bg-sky-400 mx-auto opacity-50 mt-2" />
        </div>
        <div className="relative z-10">
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-6xl font-semibold text-white mb-2 leading-tight drop-shadow-lg">
            {settings.groom?.split(" ")[0] || "..."}
          </h1>
          <p style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-sky-300 text-3xl my-2">&amp;</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-6xl font-semibold text-white mb-6 leading-tight drop-shadow-lg">
            {settings.bride?.split(" ")[0] || "..."}
          </h1>
          <div className="flex items-center justify-center gap-3 my-6">
            <div className="w-12 h-px bg-sky-400 opacity-60" />
            <span className="text-sky-300 text-lg">💍</span>
            <div className="w-12 h-px bg-sky-400 opacity-60" />
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl px-8 py-4 border border-white border-opacity-20 mb-8">
            <p className="text-sky-200 text-xs uppercase tracking-widest mb-1">Kepada Yth.</p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-white text-2xl font-medium capitalize">{guestName}</p>
            <p className="text-sky-300 text-xs mt-1">Mohon maaf bila ada kesalahan penulisan nama</p>
          </div>
          <button onClick={() => setOpened(true)}
            className="px-10 py-4 rounded-full text-sky-900 font-semibold text-sm tracking-wide transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl"
            style={{ background: "linear-gradient(90deg, #BAE6FD, #FFFFFF)" }}>
            ✉ Buka Undangan
          </button>
        </div>
        <div>
          {/* ✅ Tanggal dari Settings */}
          <p className="text-sky-300 text-sm">{formatDate(settings.wedding_date)}</p>
          {settings.wedding_location && <p className="text-sky-400 text-xs mt-1">{settings.wedding_location}</p>}
        </div>
      </div>
    );
  }

  // ── MAIN INVITATION ────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: C.cloudBlue }} className="pb-20">

      {/* Hero */}
      <section id="hero" className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative overflow-hidden"
        style={{ background: gradMain }}>
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
        <p className="text-sky-200 text-xs uppercase tracking-[0.3em] mb-6 relative z-10">The Wedding Of</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-7xl font-semibold text-white relative z-10 drop-shadow-lg">
          {settings.groom?.split(" ")[0]}
        </h1>
        <p style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-sky-300 text-4xl my-3 relative z-10">&amp;</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-7xl font-semibold text-white relative z-10 drop-shadow-lg">
          {settings.bride?.split(" ")[0]}
        </h1>
        {/* ✅ Tanggal dari Settings */}
        <p className="text-sky-200 text-sm mt-6 relative z-10">{formatDate(settings.wedding_date)}</p>

        {/* Countdown */}
        <div className="grid grid-cols-4 gap-3 mt-10 relative z-10">
          {[
            { val: countdown.days,    label: "Hari" },
            { val: countdown.hours,   label: "Jam" },
            { val: countdown.minutes, label: "Menit" },
            { val: countdown.seconds, label: "Detik" },
          ].map(({ val, label }) => (
            <div key={label} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center border border-white border-opacity-20 backdrop-blur-sm"
                style={{ background: "rgba(255,255,255,0.12)" }}>
                <span className="text-2xl font-bold text-white">{String(val).padStart(2, "0")}</span>
              </div>
              <span className="text-sky-300 text-xs mt-1">{label}</span>
            </div>
          ))}
        </div>
        <div className="absolute bottom-8 flex flex-col items-center gap-2 text-sky-300 text-xs animate-bounce"><span>↓</span></div>
      </section>

      {/* Opening */}
      <section className="py-16 px-8 text-center bg-white">
        <p className="text-sky-500 text-xs uppercase tracking-widest mb-4">Bismillahirrahmanirrahim</p>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl font-semibold text-sky-900 mb-6">Assalamu'alaikum Wr. Wb.</h2>
        <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
          Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara(i) untuk menghadiri acara pernikahan putra-putri kami.
        </p>
      </section>

      {/* Mempelai */}
      <section id="mempelai" className="py-16 px-6" style={{ background: C.cloudBlue }}>
        <div className="text-center mb-10">
          <p className="text-sky-500 text-xs uppercase tracking-widest mb-2">Mempelai</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl font-semibold text-sky-900">Kedua Mempelai</h2>
        </div>

        {/* Wanita */}
        <div className="max-w-sm mx-auto bg-white rounded-3xl p-8 shadow-sm border border-sky-100 text-center mb-6">
          {settings.photo_url ? (
            <img src={settings.photo_url} alt="Foto" className="w-24 h-24 object-cover rounded-full mx-auto mb-4 border-4 border-sky-100 shadow" />
          ) : (
            <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-5xl"
              style={{ background: `linear-gradient(135deg, ${C.lightBlue}, ${C.skyBlue})` }}>👰</div>
          )}
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-2xl font-semibold text-sky-900 mb-1">{settings.bride}</h3>
          <p className="text-sky-500 text-xs uppercase tracking-widest mb-3">Mempelai Wanita</p>
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
          <p style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-4xl text-sky-400">&amp;</p>
        </div>

        {/* Pria */}
        <div className="max-w-sm mx-auto bg-white rounded-3xl p-8 shadow-sm border border-sky-100 text-center">
          <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-5xl"
            style={{ background: `linear-gradient(135deg, ${C.lightBlue}, ${C.skyBlue})` }}>🤵</div>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-2xl font-semibold text-sky-900 mb-1">{settings.groom}</h3>
          <p className="text-sky-500 text-xs uppercase tracking-widest mb-3">Mempelai Pria</p>
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

      {/* Acara */}
      <section id="acara" className="py-16 px-6 bg-white">
        <div className="text-center mb-10">
          <p className="text-sky-500 text-xs uppercase tracking-widest mb-2">Tanggal & Waktu</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl font-semibold text-sky-900">Acara Pernikahan</h2>
        </div>
        <div className="max-w-sm mx-auto space-y-4">
          {["Akad Nikah", "Resepsi"].map((label, idx) => (
            <div key={label} className="rounded-3xl overflow-hidden shadow-sm border border-sky-100">
              <div className="py-3 px-6 text-center text-white text-sm font-semibold tracking-widest uppercase" style={{ background: gradLight }}>
                {label}
              </div>
              <div className="bg-white px-6 py-6 text-center">
                {/* ✅ Tanggal dari Settings */}
                {settings.wedding_date ? (
                  <>
                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">
                      {new Date(settings.wedding_date).toLocaleDateString("id-ID", { weekday: "long" })}
                    </p>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-5xl font-semibold text-sky-900">
                      {new Date(settings.wedding_date).getDate()}
                    </p>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-xl text-sky-700">
                      {new Date(settings.wedding_date).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                    </p>
                  </>
                ) : (
                  <p className="text-slate-400 text-sm">Tanggal belum diatur</p>
                )}
                <div className="h-px bg-sky-100 my-4" />
                <p className="text-sky-600 font-medium text-sm">
                  {settings.wedding_time ? (idx === 0 ? settings.wedding_time : settings.wedding_time + " — Selesai") : "Waktu belum diatur"}
                </p>
                <p className="text-slate-500 text-sm mt-1">{settings.wedding_location || "Lokasi belum diatur"}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lokasi */}
      <section id="lokasi" className="py-16 px-6" style={{ background: C.cloudBlue }}>
        <div className="text-center mb-8">
          <p className="text-sky-500 text-xs uppercase tracking-widest mb-2">Lokasi</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl font-semibold text-sky-900">Tempat Acara</h2>
        </div>
        <div className="max-w-sm mx-auto">
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-sky-100">
            <div className="w-full h-52 overflow-hidden">
              <iframe title="Lokasi Acara" width="100%" height="100%" loading="lazy" style={{ border: 0 }}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(settings.wedding_location || "Bandung Jawa Barat")}&t=m&z=14&output=embed&iwloc=near`} />
            </div>
            <div className="p-6 text-center">
              <p className="font-semibold text-sky-900 mb-1">{settings.wedding_location || "Lokasi belum diatur"}</p>
              <a href={`https://maps.google.com/?q=${encodeURIComponent(settings.wedding_location || "Bandung")}`}
                target="_blank" rel="noreferrer"
                className="inline-block mt-3 px-6 py-2.5 rounded-full text-white text-sm font-medium transition hover:opacity-90"
                style={{ background: gradLight }}>
                📍 Buka Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Wedding Gift */}
      <section className="py-16 px-6 bg-white">
        <div className="text-center mb-8">
          <p className="text-sky-500 text-xs uppercase tracking-widest mb-2">Hadiah</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl font-semibold text-sky-900">Wedding Gift</h2>
          <p className="text-slate-400 text-sm mt-3 max-w-xs mx-auto">Doa restu Anda adalah karunia terindah.</p>
        </div>
        <div className="max-w-sm mx-auto space-y-4">
          {[
            { bank: "BRI", no: "1234567890123", an: settings.groom, key: "bri", bg: "#0284C7" },
            { bank: "BCA", no: "9876543210987", an: settings.bride, key: "bca", bg: "#0C4A6E" },
          ].map((r) => (
            <div key={r.key} className="rounded-2xl p-5 border border-sky-100 shadow-sm" style={{ background: C.cloudBlue }}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-white text-xs font-bold px-3 py-1 rounded-lg" style={{ background: r.bg }}>{r.bank}</div>
                <span className="text-slate-400 text-xs">A/n {r.an}</span>
              </div>
              <p className="text-sky-900 font-mono font-bold text-lg tracking-widest">{r.no}</p>
              <button onClick={() => copyText(r.no, r.key)}
                className="mt-3 w-full py-2 rounded-xl text-sky-700 text-xs font-medium border border-sky-200 hover:bg-sky-50 transition">
                {copied === r.key ? "✓ Tersalin!" : "Salin Nomor Rekening"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* RSVP & Ucapan */}
      <section id="ucapan" className="py-16 px-6" style={{ background: C.cloudBlue }}>
        <div className="text-center mb-8">
          <p className="text-sky-500 text-xs uppercase tracking-widest mb-2">Konfirmasi</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl font-semibold text-sky-900">Ucapan & RSVP</h2>
        </div>
        <div className="max-w-sm mx-auto grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Hadir",  count: wishes.filter(w => w.attendance === "Hadir").length,        color: "#0284C7" },
            { label: "Tidak",  count: wishes.filter(w => w.attendance === "Tidak Hadir").length,  color: "#94A3B8" },
            { label: "Ragu",   count: wishes.filter(w => w.attendance === "Masih Ragu").length,   color: "#0EA5E9" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 text-center shadow-sm border border-sky-100">
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.count}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="max-w-sm mx-auto bg-white rounded-3xl p-6 shadow-sm border border-sky-100 mb-6">
          <input className="w-full border border-slate-200 p-3 rounded-xl text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
            placeholder="Nama Anda" value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} />
          <select className="w-full border border-slate-200 p-3 rounded-xl text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
            value={rsvpAttend} onChange={(e) => setRsvpAttend(e.target.value)}>
            <option>Hadir</option>
            <option>Tidak Hadir</option>
            <option>Masih Ragu</option>
          </select>
          <textarea className="w-full border border-slate-200 p-3 rounded-xl text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
            placeholder="Ucapan & doa untuk mempelai..." rows={3} value={rsvpMsg} onChange={(e) => setRsvpMsg(e.target.value)} />
          <button onClick={submitRsvp} className="w-full py-3 rounded-xl text-white text-sm font-semibold transition hover:opacity-90" style={{ background: gradLight }}>
            Kirim Ucapan
          </button>
          {wishSubmitted && <p className="text-center text-sky-600 text-sm mt-3">✓ Terima kasih atas ucapannya!</p>}
        </div>
        <div className="max-w-sm mx-auto space-y-3">
          {wishes.map((w) => (
            <div key={w.id} className="bg-white rounded-2xl p-4 shadow-sm border border-sky-100">
              <div className="flex justify-between items-center mb-1">
                <p className="font-semibold text-sky-900 text-sm">{w.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${w.attendance === "Hadir" ? "bg-sky-100 text-sky-600" : w.attendance === "Tidak Hadir" ? "bg-slate-100 text-slate-500" : "bg-yellow-50 text-yellow-600"}`}>
                  {w.attendance}
                </span>
              </div>
              {w.message && <p className="text-slate-500 text-xs italic mt-1">"{w.message}"</p>}
            </div>
          ))}
        </div>
      </section>

      {/* Penutup */}
      <section className="py-20 px-8 text-center" style={{ background: gradMain }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-white text-xl leading-relaxed italic max-w-sm mx-auto">
          "Semoga Allah menghimpun yang terserak dari keduanya, memberkati mereka berdua, dan meningkatkan kualitas keturunannya sebagai pembuka pintu rahmat."
        </p>
        <div className="h-px bg-sky-700 max-w-xs mx-auto my-10" />
        <p style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-white text-3xl font-semibold mb-1">
          {settings.groom?.split(" ")[0]} &amp; {settings.bride?.split(" ")[0]}
        </p>
        <p className="text-sky-300 text-xs tracking-widest">✦ Turut berbahagia segenap keluarga besar ✦</p>
        <p className="text-sky-400 text-xs mt-8">Wassalamu'alaikum Wr. Wb.</p>
      </section>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-sky-100 shadow-xl"
        style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)" }}>
        <div className="flex justify-around items-center py-2 max-w-sm mx-auto">
          {[
            { id: "hero",     icon: "🏠", label: "Home" },
            { id: "mempelai", icon: "💑", label: "Mempelai" },
            { id: "acara",    icon: "📅", label: "Acara" },
            { id: "lokasi",   icon: "📍", label: "Lokasi" },
            { id: "ucapan",   icon: "💌", label: "Ucapan" },
          ].map((nav) => (
            <button key={nav.id} onClick={() => scrollTo(nav.id)}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all"
              style={{ color: activeSection === nav.id ? "#0284C7" : "#94A3B8" }}>
              <span className="text-lg">{nav.icon}</span>
              <span className="text-xs font-medium">{nav.label}</span>
              {activeSection === nav.id && <div className="w-1 h-1 rounded-full mt-0.5" style={{ background: "#0284C7" }} />}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

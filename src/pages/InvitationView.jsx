import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";

// ── Countdown hook ───────────────────────────────────────────
function useCountdown(targetDate) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
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

// ── Section refs for bottom nav ──────────────────────────────
const SECTIONS = ["cover", "mempelai", "acara", "lokasi", "ucapan"];

export default function InvitationView() {
  const { slug } = useParams();
  const [groom, setGroom]       = useState("Ridwan Nurjaman");
  const [bride, setBride]       = useState("Nurlaila Handayani");
  const [opened, setOpened]     = useState(false);
  const [activeSection, setActiveSection] = useState("cover");
  const [copied, setCopied]     = useState("");

  // RSVP form
  const [rsvpName, setRsvpName]         = useState("");
  const [rsvpMsg, setRsvpMsg]           = useState("");
  const [rsvpAttend, setRsvpAttend]     = useState("Hadir");
  const [wishes, setWishes]             = useState([]);
  const [wishSubmitted, setWishSubmitted] = useState(false);

  const countdown = useCountdown("2026-12-20T09:00:00");

  const guestName = slug
    ?.replace(/-/g, " ")
    ?.replace(/\b\w/g, (l) => l.toUpperCase()) || "Tamu Undangan";

  // Fetch settings & wishes
  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase.from("settings").select("groom, bride").eq("id", 1).single();
      if (!error && data) { setGroom(data.groom); setBride(data.bride); }
    };
    const fetchWishes = async () => {
      const { data, error } = await supabase.from("rsvp").select("*").order("id", { ascending: false });
      if (!error && data) setWishes(data);
    };
    fetchSettings();
    fetchWishes();
  }, []);

  // Submit RSVP
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

  // Copy to clipboard
  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  // Scroll to section
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setActiveSection(id);
  };

  // Colors
  const C = {
    deepBlue:  "#0C4A6E",
    midBlue:   "#0284C7",
    skyBlue:   "#38BDF8",
    lightBlue: "#BAE6FD",
    cloudBlue: "#F0F9FF",
    white:     "#FFFFFF",
  };

  const gradMain  = `linear-gradient(160deg, ${C.deepBlue} 0%, ${C.midBlue} 60%, ${C.skyBlue} 100%)`;
  const gradLight = `linear-gradient(135deg, ${C.skyBlue} 0%, ${C.midBlue} 100%)`;

  // ── COVER ───────────────────────────────────────────────────
  if (!opened) {
    return (
      <div id="cover" className="min-h-screen flex flex-col items-center justify-between py-12 px-6 text-center relative overflow-hidden"
        style={{ background: gradMain, fontFamily: "'Inter', sans-serif" }}>

        {/* Animated dots background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute rounded-full opacity-10 animate-pulse"
              style={{
                background: C.lightBlue,
                width: Math.random() * 80 + 20 + "px",
                height: Math.random() * 80 + 20 + "px",
                top: Math.random() * 100 + "%",
                left: Math.random() * 100 + "%",
                animationDelay: Math.random() * 3 + "s",
                animationDuration: Math.random() * 4 + 3 + "s",
              }} />
          ))}
        </div>

        {/* Top */}
        <div>
          <p className="text-sky-200 text-xs uppercase tracking-[0.3em] mb-1">Undangan Pernikahan</p>
          <div className="w-16 h-px bg-sky-400 mx-auto opacity-50 mt-2" />
        </div>

        {/* Names */}
        <div className="relative z-10">
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="text-6xl font-semibold text-white mb-2 leading-tight drop-shadow-lg">
            {groom.split(" ")[0]}
          </h1>
          <p style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="text-sky-300 text-3xl my-2">&amp;</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="text-6xl font-semibold text-white mb-6 leading-tight drop-shadow-lg">
            {bride.split(" ")[0]}
          </h1>

          {/* Ornament divider */}
          <div className="flex items-center justify-center gap-3 my-6">
            <div className="w-12 h-px bg-sky-400 opacity-60" />
            <span className="text-sky-300 text-lg">💍</span>
            <div className="w-12 h-px bg-sky-400 opacity-60" />
          </div>

          {/* Guest */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl px-8 py-4 border border-white border-opacity-20 mb-8">
            <p className="text-sky-200 text-xs uppercase tracking-widest mb-1">Kepada Yth.</p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif" }}
              className="text-white text-2xl font-medium capitalize">{guestName}</p>
            <p className="text-sky-300 text-xs mt-1">Mohon maaf bila ada kesalahan penulisan nama</p>
          </div>

          {/* Open button */}
          <button onClick={() => setOpened(true)}
            className="px-10 py-4 rounded-full text-sky-900 font-semibold text-sm tracking-wide transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl"
            style={{ background: "linear-gradient(90deg, #BAE6FD, #FFFFFF)" }}>
            ✉ Buka Undangan
          </button>
        </div>

        {/* Date */}
        <div>
          <p className="text-sky-300 text-sm">Sabtu, 20 Desember 2026</p>
          <p className="text-sky-400 text-xs mt-1">Bandung, Jawa Barat</p>
        </div>
      </div>
    );
  }

  // ── MAIN INVITATION ─────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: C.cloudBlue }} className="pb-20">

      {/* ── 1. HERO ── */}
      <section id="hero" className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative overflow-hidden"
        style={{ background: gradMain }}>
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: "30px 30px" }} />

        <p className="text-sky-200 text-xs uppercase tracking-[0.3em] mb-6 relative z-10">The Wedding Of</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif" }}
          className="text-7xl font-semibold text-white relative z-10 drop-shadow-lg">
          {groom.split(" ")[0]}
        </h1>
        <p style={{ fontFamily: "'Cormorant Garamond', serif" }}
          className="text-sky-300 text-4xl my-3 relative z-10">&amp;</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif" }}
          className="text-7xl font-semibold text-white relative z-10 drop-shadow-lg">
          {bride.split(" ")[0]}
        </h1>

        <p className="text-sky-200 text-sm mt-6 relative z-10">Sabtu, 20 Desember 2026</p>

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

        {/* Scroll hint */}
        <div className="absolute bottom-8 flex flex-col items-center gap-2 text-sky-300 text-xs animate-bounce">
          <span>↓</span>
        </div>
      </section>

      {/* ── 2. OPENING ── */}
      <section className="py-16 px-8 text-center bg-white">
        <p className="text-sky-500 text-xs uppercase tracking-widest mb-4">Bismillahirrahmanirrahim</p>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }}
          className="text-3xl font-semibold text-sky-900 mb-6">
          Assalamu'alaikum Wr. Wb.
        </h2>
        <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
          Dengan memohon rahmat dan ridho Allah SWT, kami mengundang
          Bapak/Ibu/Saudara(i) untuk menghadiri acara pernikahan putra-putri kami.
        </p>
      </section>

      {/* ── 3. MEMPELAI ── */}
      <section id="mempelai" className="py-16 px-6" style={{ background: C.cloudBlue }}>
        <div className="text-center mb-10">
          <p className="text-sky-500 text-xs uppercase tracking-widest mb-2">Mempelai</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="text-3xl font-semibold text-sky-900">Kedua Mempelai</h2>
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="w-10 h-px" style={{ background: C.skyBlue }} />
            <span className="text-sky-400">✦</span>
            <div className="w-10 h-px" style={{ background: C.skyBlue }} />
          </div>
        </div>

        {/* Wanita */}
        <div className="max-w-sm mx-auto bg-white rounded-3xl p-8 shadow-sm border border-sky-100 text-center mb-6">
          <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-5xl"
            style={{ background: `linear-gradient(135deg, ${C.lightBlue}, ${C.skyBlue})` }}>
            👰
          </div>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="text-2xl font-semibold text-sky-900 mb-1">{bride}</h3>
          <p className="text-sky-500 text-xs uppercase tracking-widest mb-3">Mempelai Wanita</p>
          <div className="h-px bg-sky-100 my-3" />
          <p className="text-slate-500 text-sm">Putri dari</p>
          <p className="text-slate-700 text-sm font-medium mt-1">Bpk. [Nama Ayah] &amp; Ibu [Nama Ibu]</p>
        </div>

        {/* Divider & */}
        <div className="text-center my-2">
          <p style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="text-4xl text-sky-400">&amp;</p>
        </div>

        {/* Pria */}
        <div className="max-w-sm mx-auto bg-white rounded-3xl p-8 shadow-sm border border-sky-100 text-center">
          <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-5xl"
            style={{ background: `linear-gradient(135deg, ${C.lightBlue}, ${C.skyBlue})` }}>
            🤵
          </div>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="text-2xl font-semibold text-sky-900 mb-1">{groom}</h3>
          <p className="text-sky-500 text-xs uppercase tracking-widest mb-3">Mempelai Pria</p>
          <div className="h-px bg-sky-100 my-3" />
          <p className="text-slate-500 text-sm">Putra dari</p>
          <p className="text-slate-700 text-sm font-medium mt-1">Bpk. [Nama Ayah] &amp; Ibu [Nama Ibu]</p>
        </div>
      </section>

      {/* ── 4. ACARA ── */}
      <section id="acara" className="py-16 px-6 bg-white">
        <div className="text-center mb-10">
          <p className="text-sky-500 text-xs uppercase tracking-widest mb-2">Tanggal & Waktu</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="text-3xl font-semibold text-sky-900">Acara Pernikahan</h2>
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="w-10 h-px" style={{ background: C.skyBlue }} />
            <span className="text-sky-400">✦</span>
            <div className="w-10 h-px" style={{ background: C.skyBlue }} />
          </div>
        </div>

        <div className="max-w-sm mx-auto space-y-4">
          {/* Akad */}
          <div className="rounded-3xl overflow-hidden shadow-sm border border-sky-100">
            <div className="py-3 px-6 text-center text-white text-sm font-semibold tracking-widest uppercase"
              style={{ background: gradLight }}>
              Akad Nikah
            </div>
            <div className="bg-white px-6 py-6 text-center">
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">Sabtu</p>
              <p style={{ fontFamily: "'Cormorant Garamond', serif" }}
                className="text-5xl font-semibold text-sky-900">20</p>
              <p style={{ fontFamily: "'Cormorant Garamond', serif" }}
                className="text-xl text-sky-700">Desember 2026</p>
              <div className="h-px bg-sky-100 my-4" />
              <p className="text-sky-600 font-medium text-sm">08.00 WIB</p>
              <p className="text-slate-500 text-sm mt-1">Bandung, Jawa Barat</p>
            </div>
          </div>

          {/* Resepsi */}
          <div className="rounded-3xl overflow-hidden shadow-sm border border-sky-100">
            <div className="py-3 px-6 text-center text-white text-sm font-semibold tracking-widest uppercase"
              style={{ background: gradLight }}>
              Resepsi
            </div>
            <div className="bg-white px-6 py-6 text-center">
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">Sabtu</p>
              <p style={{ fontFamily: "'Cormorant Garamond', serif" }}
                className="text-5xl font-semibold text-sky-900">20</p>
              <p style={{ fontFamily: "'Cormorant Garamond', serif" }}
                className="text-xl text-sky-700">Desember 2026</p>
              <div className="h-px bg-sky-100 my-4" />
              <p className="text-sky-600 font-medium text-sm">09.00 WIB — Selesai</p>
              <p className="text-slate-500 text-sm mt-1">Bandung, Jawa Barat</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. LOKASI ── */}
      <section id="lokasi" className="py-16 px-6" style={{ background: C.cloudBlue }}>
        <div className="text-center mb-8">
          <p className="text-sky-500 text-xs uppercase tracking-widest mb-2">Lokasi</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="text-3xl font-semibold text-sky-900">Tempat Acara</h2>
        </div>

        <div className="max-w-sm mx-auto">
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-sky-100">
            {/* Map embed */}
            <div className="w-full h-52 overflow-hidden">
              <iframe
                title="Lokasi Acara"
                width="100%"
                height="100%"
                loading="lazy"
                style={{ border: 0 }}
                src="https://maps.google.com/maps?q=Bandung+Jawa+Barat&t=m&z=14&output=embed&iwloc=near"
              />
            </div>
            <div className="p-6 text-center">
              <p className="font-semibold text-sky-900 mb-1">Bandung, Jawa Barat</p>
              <p className="text-slate-500 text-sm mb-4">Jl. [Nama Jalan], Bandung</p>
              <a href="https://maps.google.com/?q=Bandung+Jawa+Barat" target="_blank" rel="noreferrer"
                className="inline-block px-6 py-2.5 rounded-full text-white text-sm font-medium transition hover:opacity-90"
                style={{ background: gradLight }}>
                📍 Buka Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. WEDDING GIFT ── */}
      <section className="py-16 px-6 bg-white">
        <div className="text-center mb-8">
          <p className="text-sky-500 text-xs uppercase tracking-widest mb-2">Hadiah</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="text-3xl font-semibold text-sky-900">Wedding Gift</h2>
          <p className="text-slate-400 text-sm mt-3 max-w-xs mx-auto">
            Doa restu Anda adalah karunia terindah. Namun jika ingin memberi tanda kasih:
          </p>
        </div>

        <div className="max-w-sm mx-auto space-y-4">
          {/* BRI */}
          <div className="rounded-2xl p-5 border border-sky-100 shadow-sm" style={{ background: C.cloudBlue }}>
            <div className="flex items-center justify-between mb-3">
              <div className="bg-sky-600 text-white text-xs font-bold px-3 py-1 rounded-lg">BRI</div>
              <span className="text-slate-400 text-xs">A/n {groom}</span>
            </div>
            <p className="text-sky-900 font-mono font-bold text-lg tracking-widest">1234 5678 9012</p>
            <button onClick={() => copyText("1234567890123", "bri")}
              className="mt-3 w-full py-2 rounded-xl text-sky-700 text-xs font-medium border border-sky-200 hover:bg-sky-50 transition">
              {copied === "bri" ? "✓ Tersalin!" : "Salin Nomor Rekening"}
            </button>
          </div>

          {/* BCA */}
          <div className="rounded-2xl p-5 border border-sky-100 shadow-sm" style={{ background: C.cloudBlue }}>
            <div className="flex items-center justify-between mb-3">
              <div className="bg-sky-800 text-white text-xs font-bold px-3 py-1 rounded-lg">BCA</div>
              <span className="text-slate-400 text-xs">A/n {bride}</span>
            </div>
            <p className="text-sky-900 font-mono font-bold text-lg tracking-widest">9876 5432 1098</p>
            <button onClick={() => copyText("9876543210987", "bca")}
              className="mt-3 w-full py-2 rounded-xl text-sky-700 text-xs font-medium border border-sky-200 hover:bg-sky-50 transition">
              {copied === "bca" ? "✓ Tersalin!" : "Salin Nomor Rekening"}
            </button>
          </div>

          {/* Konfirmasi WA */}
          <a href={`https://wa.me/6281234567890?text=Halo, saya ingin konfirmasi pengiriman hadiah pernikahan ${groom} & ${bride}`}
            target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-white text-sm font-medium transition hover:opacity-90"
            style={{ background: "linear-gradient(90deg, #16A34A, #22C55E)" }}>
            <span>📱</span> Konfirmasi via WhatsApp
          </a>
        </div>
      </section>

      {/* ── 7. UCAPAN & RSVP ── */}
      <section id="ucapan" className="py-16 px-6" style={{ background: C.cloudBlue }}>
        <div className="text-center mb-8">
          <p className="text-sky-500 text-xs uppercase tracking-widest mb-2">Konfirmasi</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="text-3xl font-semibold text-sky-900">Ucapan & RSVP</h2>
        </div>

        {/* Stats */}
        <div className="max-w-sm mx-auto grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Hadir", count: wishes.filter(w => w.attendance === "Hadir").length, color: "#0284C7" },
            { label: "Tidak", count: wishes.filter(w => w.attendance === "Tidak Hadir").length, color: "#94A3B8" },
            { label: "Ragu", count: wishes.filter(w => w.attendance === "Masih Ragu").length, color: "#0EA5E9" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 text-center shadow-sm border border-sky-100">
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.count}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="max-w-sm mx-auto bg-white rounded-3xl p-6 shadow-sm border border-sky-100 mb-6">
          <input
            className="w-full border border-slate-200 p-3 rounded-xl text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
            placeholder="Nama Anda"
            value={rsvpName}
            onChange={(e) => setRsvpName(e.target.value)}
          />
          <select
            className="w-full border border-slate-200 p-3 rounded-xl text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
            value={rsvpAttend}
            onChange={(e) => setRsvpAttend(e.target.value)}
          >
            <option>Hadir</option>
            <option>Tidak Hadir</option>
            <option>Masih Ragu</option>
          </select>
          <textarea
            className="w-full border border-slate-200 p-3 rounded-xl text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
            placeholder="Ucapan & doa untuk mempelai..."
            rows={3}
            value={rsvpMsg}
            onChange={(e) => setRsvpMsg(e.target.value)}
          />
          <button onClick={submitRsvp}
            className="w-full py-3 rounded-xl text-white text-sm font-semibold transition hover:opacity-90"
            style={{ background: gradLight }}>
            Kirim Ucapan
          </button>
          {wishSubmitted && (
            <p className="text-center text-sky-600 text-sm mt-3">✓ Terima kasih atas ucapannya!</p>
          )}
        </div>

        {/* Wish list */}
        <div className="max-w-sm mx-auto space-y-3">
          {wishes.map((w) => (
            <div key={w.id} className="bg-white rounded-2xl p-4 shadow-sm border border-sky-100">
              <div className="flex justify-between items-center mb-1">
                <p className="font-semibold text-sky-900 text-sm">{w.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  w.attendance === "Hadir" ? "bg-sky-100 text-sky-600"
                  : w.attendance === "Tidak Hadir" ? "bg-slate-100 text-slate-500"
                  : "bg-yellow-50 text-yellow-600"
                }`}>{w.attendance}</span>
              </div>
              {w.message && (
                <p className="text-slate-500 text-xs italic mt-1">"{w.message}"</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── 8. QUOTES PENUTUP ── */}
      <section className="py-20 px-8 text-center" style={{ background: gradMain }}>
        <div className="relative">
          <p className="text-sky-300 text-5xl opacity-30 absolute -top-4 left-0">"</p>
          <p style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="text-white text-xl leading-relaxed italic max-w-sm mx-auto relative z-10 pt-4">
            Semoga Allah menghimpun yang terserak dari keduanya, memberkati mereka berdua,
            dan meningkatkan kualitas keturunannya sebagai pembuka pintu rahmat.
          </p>
          <p className="text-sky-300 text-5xl opacity-30 absolute -bottom-6 right-0">"</p>
        </div>

        <div className="h-px bg-sky-700 max-w-xs mx-auto my-10" />

        <p className="text-sky-200 text-sm leading-relaxed max-w-xs mx-auto mb-6">
          Merupakan suatu kehormatan apabila Bapak/Ibu/Saudara(i) berkenan hadir
          dan memberikan doa restu kepada kedua mempelai.
        </p>

        <p style={{ fontFamily: "'Cormorant Garamond', serif" }}
          className="text-white text-3xl font-semibold mb-1">
          {groom.split(" ")[0]} &amp; {bride.split(" ")[0]}
        </p>
        <p className="text-sky-300 text-xs tracking-widest">✦ Turut berbahagia segenap keluarga besar ✦</p>
        <p className="text-sky-400 text-xs mt-8">Wassalamu'alaikum Wr. Wb.</p>
      </section>

      {/* ── BOTTOM NAV ── */}
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
              style={{ color: activeSection === nav.id ? C.midBlue : "#94A3B8" }}>
              <span className="text-lg">{nav.icon}</span>
              <span className="text-xs font-medium">{nav.label}</span>
              {activeSection === nav.id && (
                <div className="w-1 h-1 rounded-full mt-0.5" style={{ background: C.midBlue }} />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
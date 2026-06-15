import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [groom, setGroom]       = useState("");
  const [bride, setBride]       = useState("");

  useEffect(() => {
    supabase.from("settings").select("groom, bride, photo_url").eq("id", 1).single()
      .then(({ data }) => {
        if (data) { setGroom(data.groom || ""); setBride(data.bride || ""); setPhotoUrl(data.photo_url || ""); }
      });
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    localStorage.setItem("role", email === "pengantin@gmail.com" ? "pengantin" : "keluarga");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Foto — atas di mobile, kiri di desktop */}
      <div className="md:w-1/2 flex flex-col items-center justify-center py-10 md:py-16 px-8 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0C4A6E 0%, #0284C7 60%, #38BDF8 100%)", minHeight: "280px" }}>
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

        <div className="relative z-10 mb-5">
          {photoUrl ? (
            <div className="relative">
              <img src={photoUrl} alt="Foto Pasangan"
                className="w-36 h-36 md:w-56 md:h-56 object-cover rounded-2xl md:rounded-3xl shadow-2xl border-4"
                style={{ borderColor: "rgba(255,255,255,0.2)" }} />
              <div className="absolute inset-0 rounded-2xl md:rounded-3xl"
                style={{ boxShadow: "0 0 60px rgba(56,189,248,0.4)" }} />
            </div>
          ) : (
            <div className="w-36 h-36 md:w-56 md:h-56 rounded-2xl md:rounded-3xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.1)", border: "2px dashed rgba(255,255,255,0.3)" }}>
              <span className="text-5xl md:text-6xl">💑</span>
            </div>
          )}
        </div>

        <div className="relative z-10 text-center">
          <p className="text-sky-300 text-xs uppercase tracking-[0.3em] mb-2">The Wedding Of</p>
          {groom && bride ? (
            <>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif" }}
                className="text-3xl md:text-4xl font-semibold text-white">{groom.split(" ")[0]}</h1>
              <p style={{ fontFamily: "'Cormorant Garamond', serif" }}
                className="text-sky-300 text-xl md:text-2xl my-1">&amp;</p>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif" }}
                className="text-3xl md:text-4xl font-semibold text-white">{bride.split(" ")[0]}</h1>
            </>
          ) : (
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif" }}
              className="text-3xl md:text-4xl font-semibold text-white">Wedding Planner</h1>
          )}
          <p className="text-sky-300 text-sm mt-2">Sabtu, 20 Desember 2026</p>
        </div>
      </div>

      {/* Form login */}
      <div className="md:w-1/2 flex items-center justify-center px-6 md:px-8 py-10 md:py-16 bg-white">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <p className="text-sky-500 text-xs uppercase tracking-widest mb-2">Selamat Datang</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }}
              className="text-3xl font-semibold text-sky-900">Masuk ke Dashboard</h2>
            <p className="text-slate-400 text-sm mt-2">Kelola pernikahan impian Anda</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 uppercase tracking-widest mb-2">Email</label>
              <input type="email" placeholder="email@contoh.com" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-200 p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 transition" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 uppercase tracking-widest mb-2">Password</label>
              <input type="password" placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-200 p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 transition" />
            </div>
            <button type="submit"
              className="w-full py-3 rounded-xl text-white font-semibold text-sm tracking-wide transition hover:opacity-90 active:scale-95"
              style={{ background: "linear-gradient(90deg, #0284C7, #38BDF8)" }}>
              Masuk
            </button>
          </form>
          <p className="text-slate-300 text-xs text-center mt-8">© 2026 Wedding Planner</p>
        </div>
      </div>
    </div>
  );
}

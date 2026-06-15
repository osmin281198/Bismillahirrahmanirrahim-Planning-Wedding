import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Sidebar from "../components/Sidebar";

export default function Wishes() {
  const [name, setName]           = useState("");
  const [message, setMessage]     = useState("");
  const [attendance, setAttendance] = useState("Hadir");
  const [data, setData]           = useState([]);
  const [loading, setLoading]     = useState(false);

  useEffect(() => { fetchRsvp(); }, []);

  const fetchRsvp = async () => {
    setLoading(true);
    const { data: rows, error } = await supabase.from("rsvp").select("*").order("id", { ascending: false });
    if (!error) setData(rows);
    setLoading(false);
  };

  const addWish = async () => {
    if (!name) return;
    const newWish = { id: Date.now(), name, message, attendance };
    const { error } = await supabase.from("rsvp").insert(newWish);
    if (!error) { setData([newWish, ...data]); setName(""); setMessage(""); setAttendance("Hadir"); }
  };

  const hadir      = data.filter((d) => d.attendance === "Hadir").length;
  const tidakHadir = data.filter((d) => d.attendance === "Tidak Hadir").length;

  return (
    <div className="flex min-h-screen" style={{ background: "#F0F9FF", fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />
      <main className="flex-1 pt-16 md:pt-0 p-4 md:p-8 overflow-x-hidden">
        <div className="mb-6">
          <p className="text-sky-500 text-xs uppercase tracking-widest mb-1">Konfirmasi</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="text-3xl md:text-4xl font-semibold text-sky-900">RSVP & Ucapan</h1>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-sky-100 text-center">
            <p className="text-2xl md:text-3xl font-bold text-sky-600">{hadir}</p>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Hadir</p>
          </div>
          <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-sky-100 text-center">
            <p className="text-2xl md:text-3xl font-bold text-slate-400">{tidakHadir}</p>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Tidak Hadir</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-sky-100 mb-5">
          <input className="border border-slate-200 p-3 rounded-xl w-full mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            placeholder="Nama" value={name} onChange={(e) => setName(e.target.value)} />
          <select className="border border-slate-200 p-3 rounded-xl w-full mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            value={attendance} onChange={(e) => setAttendance(e.target.value)}>
            <option>Hadir</option>
            <option>Tidak Hadir</option>
          </select>
          <textarea className="border border-slate-200 p-3 rounded-xl w-full mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            placeholder="Ucapan & doa..." rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
          <button onClick={addWish}
            className="w-full md:w-auto px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition hover:opacity-90"
            style={{ background: "linear-gradient(90deg, #0284C7, #38BDF8)" }}>Simpan</button>
        </div>

        <div className="space-y-3">
          {loading ? (
            <p className="text-center text-slate-400 py-6">Memuat...</p>
          ) : data.length === 0 ? (
            <p className="text-center text-slate-400 py-6">Belum ada RSVP masuk.</p>
          ) : (
            data.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-sky-100">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-sky-900 text-sm">{item.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-2 ${
                    item.attendance === "Hadir" ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-500"
                  }`}>{item.attendance}</span>
                </div>
                {item.message && <p className="text-slate-500 text-xs italic mt-1">"{item.message}"</p>}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Sidebar from "../components/Sidebar";

const CATEGORIES = [
  "Venue", "Catering", "Dekorasi", "Fotografer",
  "Busana & Seserahan", "Undangan", "Rukun Nikah",
  "Transportasi", "KUA", "Lainnya"
];

const STATUS_DANA = ["Sudah Dipakai", "Dana di Bank BSI"];

export default function Rab() {
  const [item, setItem]             = useState("");
  const [category, setCategory]     = useState("");
  const [budget, setBudget]         = useState("");
  const [spent, setSpent]           = useState("");
  const [statusDana, setStatusDana] = useState("Sudah Dipakai");
  const [data, setData]             = useState([]);
  const [loading, setLoading]       = useState(false);
  const [filterCat, setFilterCat]   = useState("Semua");
  const [errMsg, setErrMsg]         = useState("");

  useEffect(() => { fetchRab(); }, []);

  const fetchRab = async () => {
    setLoading(true);
    const { data: rows, error } = await supabase.from("rab").select("*").order("id");
    if (!error) setData(rows);
    setLoading(false);
  };

  const addData = async () => {
    setErrMsg("");
    if (!item.trim()) { setErrMsg("Nama item wajib diisi."); return; }
    const isDuplicate = data.some((r) => r.item.trim().toLowerCase() === item.trim().toLowerCase());
    if (isDuplicate) { setErrMsg(`Item "${item}" sudah ada.`); return; }
    const newRow = { id: Date.now(), item: item.trim(), category, budget, spent, status_dana: statusDana };
    const { error } = await supabase.from("rab").insert(newRow);
    if (error) { setErrMsg("Gagal menyimpan: " + error.message); return; }
    setData([...data, newRow]);
    setItem(""); setCategory(""); setBudget(""); setSpent(""); setStatusDana("Sudah Dipakai");
  };

  const updateRow = async (id, field, value) => {
    const { error } = await supabase.from("rab").update({ [field]: value }).eq("id", id);
    if (!error) setData(data.map((r) => r.id === id ? { ...r, [field]: value } : r));
  };

  const deleteData = async (id) => {
    const { error } = await supabase.from("rab").delete().eq("id", id);
    if (!error) setData(data.filter((x) => x.id !== id));
  };

  const totalBudget       = data.reduce((s, r) => s + (parseFloat(r.budget) || 0), 0);
  const totalSpent        = data.reduce((s, r) => s + (parseFloat(r.spent)  || 0), 0);
  const totalSudahDipakai = data.filter((r) => !r.status_dana || r.status_dana === "Sudah Dipakai").reduce((s, r) => s + (parseFloat(r.spent) || 0), 0);
  const totalBankBSI      = data.filter((r) => r.status_dana === "Dana di Bank BSI").reduce((s, r) => s + (parseFloat(r.spent) || 0), 0);

  const categoryStats = CATEGORIES.map((cat) => {
    const items = data.filter((r) => r.category === cat);
    const b = items.reduce((s, r) => s + (parseFloat(r.budget) || 0), 0);
    const s = items.reduce((s, r) => s + (parseFloat(r.spent)  || 0), 0);
    return { cat, budget: b, spent: s, persen: b > 0 ? Math.round((s / b) * 100) : 0 };
  }).filter((c) => c.budget > 0);

  const filtered = filterCat === "Semua" ? data : data.filter((r) => r.category === filterCat);
  const usedCats = ["Semua", ...new Set(data.map((r) => r.category).filter(Boolean))];

  return (
    <div className="flex min-h-screen" style={{ background: "#F0F9FF", fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />
      <main className="flex-1 pt-16 md:pt-0 p-4 md:p-8 overflow-x-hidden">
        <div className="mb-5">
          <p className="text-sky-500 text-xs uppercase tracking-widest mb-1">Keuangan</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="text-3xl md:text-4xl font-semibold text-sky-900">RAB Pernikahan</h1>
        </div>

        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4">
          {[
            { label: "Item",     val: data.length,                                 color: "#0284C7" },
            { label: "Budget",   val: `Rp ${totalBudget.toLocaleString("id-ID")}`, color: "#0284C7" },
            { label: "Terpakai", val: `Rp ${totalSpent.toLocaleString("id-ID")}`,  color: totalSpent > totalBudget ? "#EF4444" : "#0EA5E9" },
          ].map((c) => (
            <div key={c.label} className="bg-white rounded-2xl p-3 md:p-5 shadow-sm border border-sky-100">
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">{c.label}</p>
              <p className="text-xs md:text-xl font-bold truncate" style={{ color: c.color }}>{c.val}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-sky-100">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <p className="text-xs text-slate-400 uppercase tracking-widest">Sudah Dipakai</p>
            </div>
            <p className="text-base md:text-xl font-bold text-red-500">Rp {totalSudahDipakai.toLocaleString("id-ID")}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-sky-100">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              <p className="text-xs text-slate-400 uppercase tracking-widest">Dana di Bank BSI</p>
            </div>
            <p className="text-base md:text-xl font-bold text-green-600">Rp {totalBankBSI.toLocaleString("id-ID")}</p>
          </div>
        </div>

        {categoryStats.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-sky-100 mb-4">
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-4">Realisasi per Kategori</p>
            <div className="space-y-3">
              {categoryStats.map((c) => (
                <div key={c.cat}>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span className="font-medium">{c.cat}</span>
                    <span>
                      <span className={`font-semibold ${c.persen > 100 ? "text-red-500" : c.persen > 80 ? "text-amber-500" : "text-sky-600"}`}>{c.persen}%</span>
                      <span className="text-slate-400 ml-2 hidden md:inline">Rp {c.spent.toLocaleString("id-ID")} / Rp {c.budget.toLocaleString("id-ID")}</span>
                    </span>
                  </div>
                  <div className="w-full bg-sky-100 rounded-full h-2">
                    <div className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(c.persen, 100)}%`,
                        background: c.persen > 100 ? "linear-gradient(90deg,#EF4444,#F87171)"
                          : c.persen > 80 ? "linear-gradient(90deg,#F59E0B,#FCD34D)"
                          : "linear-gradient(90deg,#0284C7,#38BDF8)"
                      }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-sky-100 mb-4">
          <h2 className="font-semibold text-sky-900 mb-3 text-sm">Tambah Item</h2>
          {errMsg && (
            <div className="mb-3 bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-2.5 rounded-xl">⚠ {errMsg}</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input placeholder="Nama item" value={item}
              onChange={(e) => { setItem(e.target.value); setErrMsg(""); }}
              className="border border-slate-200 p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="border border-slate-200 p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400">
              <option value="">Pilih Kategori</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input placeholder="Budget (Rp)" type="number" value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="border border-slate-200 p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
            <input placeholder="Terpakai (Rp)" type="number" value={spent}
              onChange={(e) => setSpent(e.target.value)}
              className="border border-slate-200 p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
          </div>
          <div className="mb-3">
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">Status Dana</p>
            <div className="flex gap-4">
              {STATUS_DANA.map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="statusDana" value={s}
                    checked={statusDana === s} onChange={() => setStatusDana(s)}
                    className="accent-sky-500 w-4 h-4" />
                  <span className="text-sm text-slate-600">{s}</span>
                </label>
              ))}
            </div>
          </div>
          <button onClick={addData}
            className="w-full md:w-auto px-6 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90"
            style={{ background: "linear-gradient(90deg, #0284C7, #38BDF8)" }}>
            + Tambah
          </button>
        </div>

        <div className="flex gap-2 flex-wrap mb-3">
          {usedCats.map((c) => (
            <button key={c} onClick={() => setFilterCat(c)}
              className="text-xs px-3 py-1.5 rounded-full font-medium transition"
              style={{
                background: filterCat === c ? "linear-gradient(90deg,#0284C7,#38BDF8)" : "#E0F2FE",
                color: filterCat === c ? "white" : "#0284C7"
              }}>
              {c}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-sky-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr style={{ background: "linear-gradient(90deg, #0C4A6E, #0284C7)" }}>
                  {["Item", "Kategori", "Budget (Rp)", "Terpakai (Rp)", "%", "Status Dana", "Aksi"].map((h) => (
                    <th key={h} className="p-3 text-left text-white font-medium text-xs uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="p-6 text-center text-slate-400">Memuat...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="p-6 text-center text-slate-400">Belum ada item.</td></tr>
                ) : (
                  filtered.map((row, i) => {
                    const b = parseFloat(row.budget || 0);
                    const s = parseFloat(row.spent  || 0);
                    const p = b > 0 ? Math.round((s / b) * 100) : 0;
                    const isBSI = row.status_dana === "Dana di Bank BSI";
                    return (
                      <tr key={row.id} className={i % 2 === 0 ? "bg-white" : "bg-sky-50"}>
                        <td className="p-3 font-medium text-slate-700">{row.item}</td>
                        <td className="p-3">{row.category && <span className="bg-sky-100 text-sky-700 text-xs px-2 py-0.5 rounded-full">{row.category}</span>}</td>
                        <td className="p-3">
                          <input type="number" defaultValue={row.budget}
                            onBlur={(e) => updateRow(row.id, "budget", e.target.value)}
                            className="w-28 border border-slate-200 p-1.5 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-400" />
                        </td>
                        <td className="p-3">
                          <input type="number" defaultValue={row.spent}
                            onBlur={(e) => updateRow(row.id, "spent", e.target.value)}
                            className="w-28 border border-slate-200 p-1.5 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-400" />
                        </td>
                        <td className="p-3">
                          <span className={`text-xs font-semibold ${p > 100 ? "text-red-500" : p > 80 ? "text-amber-500" : "text-sky-600"}`}>{p}%</span>
                        </td>
                        <td className="p-3">
                          <select value={row.status_dana || "Sudah Dipakai"}
                            onChange={(e) => updateRow(row.id, "status_dana", e.target.value)}
                            className={`text-xs px-2 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-400 ${
                              isBSI ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"
                            }`}>
                            {STATUS_DANA.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="p-3">
                          <button onClick={() => deleteData(row.id)}
                            className="text-xs px-2 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100">
                            Hapus
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-400">Total: {data.length} item</p>
      </main>
    </div>
  );
}

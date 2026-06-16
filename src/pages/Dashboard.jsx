import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { supabase } from "../lib/supabase";

const CAT_COLORS = {
  "Venue":        { bar: "#0284C7", light: "#DBEAFE" },
  "Catering":     { bar: "#0EA5E9", light: "#E0F2FE" },
  "Dekorasi":     { bar: "#38BDF8", light: "#F0F9FF" },
  "Fotografer":   { bar: "#7C3AED", light: "#EDE9FE" },
  "Busana":       { bar: "#EC4899", light: "#FCE7F3" },
  "Undangan":     { bar: "#0369A1", light: "#DBEAFE" },
  "Rukun Nikah":  { bar: "#D97706", light: "#FEF3C7" },
  "Transportasi": { bar: "#059669", light: "#D1FAE5" },
  "Lainnya":      { bar: "#94A3B8", light: "#F1F5F9" },
};

const getColor = (cat) => CAT_COLORS[cat] || { bar: "#0284C7", light: "#E0F2FE" };

function StatCard({ label, value, sub, color }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-sky-100">
      <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-lg md:text-xl font-bold truncate" style={{ color }}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

function DonutChart({ stats, totalBudget }) {
  const [hovered, setHovered] = useState(null);
  if (!stats.length || totalBudget === 0) return null;

  const size = 140, cx = 70, cy = 70, radius = 52, stroke = 22;
  let cumulative = 0;
  const slices = stats.map((c) => {
    const pct = c.budget / totalBudget;
    const start = cumulative;
    cumulative += pct;
    return { ...c, pct, start, end: cumulative };
  });

  const describeArc = (startPct, endPct) => {
    const s = startPct * 2 * Math.PI - Math.PI / 2;
    const e = endPct   * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + radius * Math.cos(s), y1 = cy + radius * Math.sin(s);
    const x2 = cx + radius * Math.cos(e), y2 = cy + radius * Math.sin(e);
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${endPct - startPct > 0.5 ? 1 : 0} 1 ${x2} ${y2}`;
  };

  const active = hovered ? stats.find((s) => s.cat === hovered) : null;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          {slices.map((s) => (
            <path key={s.cat} d={describeArc(s.start, s.end)} fill="none"
              stroke={hovered === s.cat ? getColor(s.cat).bar : getColor(s.cat).bar + "CC"}
              strokeWidth={hovered === s.cat ? stroke + 4 : stroke} strokeLinecap="round"
              style={{ transition: "all 0.2s", cursor: "pointer" }}
              onMouseEnter={() => setHovered(s.cat)} onMouseLeave={() => setHovered(null)} />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {active ? (
            <>
              <p className="text-xs font-bold text-sky-900 text-center leading-tight">{active.cat}</p>
              <p className="text-sm font-bold text-sky-600">{(active.pct * 100).toFixed(1)}%</p>
            </>
          ) : (
            <>
              <p className="text-xs text-slate-400">Total</p>
              <p className="text-sm font-bold text-sky-900">{stats.length} cat</p>
            </>
          )}
        </div>
      </div>
      <div className="mt-3 space-y-1 w-full">
        {slices.map((s) => (
          <div key={s.cat}
            className="flex items-center justify-between text-xs cursor-pointer px-2 py-0.5 rounded-lg transition"
            style={{ background: hovered === s.cat ? getColor(s.cat).light : "transparent" }}
            onMouseEnter={() => setHovered(s.cat)} onMouseLeave={() => setHovered(null)}>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: getColor(s.cat).bar }} />
              <span className="text-slate-600 truncate max-w-[90px]">{s.cat}</span>
            </div>
            <span className="font-semibold text-slate-700">{(s.pct * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryChart({ stats, totalBudget }) {
  const [tooltip, setTooltip] = useState(null);
  if (!stats.length) return <div className="text-center py-8 text-slate-400 text-sm">Belum ada data</div>;
  return (
    <div>
      <div className="space-y-4">
        {stats.map((c) => {
          const spentPct = c.budget > 0 ? Math.min((c.spent / c.budget) * 100, 100) : 0;
          const col = getColor(c.cat);
          return (
            <div key={c.cat} className="relative"
              onMouseEnter={() => setTooltip(c.cat)} onMouseLeave={() => setTooltip(null)}>
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: col.bar }} />
                  <span className="text-xs font-medium text-slate-700">{c.cat}</span>
                  {c.spent > c.budget && <span className="text-xs text-red-500">⚠ Melebihi</span>}
                </div>
                <span className={`text-xs font-bold ${c.realisasi > 100 ? "text-red-500" : c.realisasi > 80 ? "text-amber-500" : "text-sky-600"}`}>
                  {c.realisasi}%
                </span>
              </div>
              <div className="relative h-6 rounded-lg overflow-hidden" style={{ background: col.light }}>
                <div className="absolute inset-0 flex items-center px-2">
                  <span className="text-xs text-slate-400 z-10 relative">Rp {c.budget.toLocaleString("id-ID")}</span>
                </div>
                <div className="absolute top-0 left-0 h-full rounded-lg flex items-center px-2 transition-all duration-700"
                  style={{
                    width: `${spentPct}%`,
                    background: c.realisasi > 100 ? "linear-gradient(90deg,#EF4444,#F87171)"
                      : c.realisasi > 80 ? "linear-gradient(90deg,#F59E0B,#FCD34D)"
                      : `linear-gradient(90deg, ${col.bar}, ${col.bar}cc)`,
                    minWidth: c.spent > 0 ? "2px" : "0",
                  }}>
                  {spentPct > 25 && <span className="text-xs text-white font-medium truncate">Rp {c.spent.toLocaleString("id-ID")}</span>}
                </div>
              </div>
              {tooltip === c.cat && (
                <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-xl shadow-xl border border-sky-100 p-3 min-w-[220px]">
                  <p className="font-semibold text-sky-900 text-sm mb-2">{c.cat}</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between"><span className="text-slate-400">Budget</span><span>Rp {c.budget.toLocaleString("id-ID")}</span></div>
                    <div className="flex justify-between"><span className="text-red-400">Sudah Dipakai</span><span className="text-red-500 font-medium">Rp {c.sudahDipakai.toLocaleString("id-ID")}</span></div>
                    <div className="flex justify-between"><span className="text-green-600">Dana Bank BSI</span><span className="text-green-600 font-medium">Rp {c.bankBSI.toLocaleString("id-ID")}</span></div>
                    <div className="flex justify-between pt-1 border-t border-slate-100">
                      <span className="text-slate-400">Sisa</span>
                      <span className={c.budget - c.spent < 0 ? "text-red-500 font-medium" : "text-green-600 font-medium"}>
                        Rp {(c.budget - c.spent).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [groom, setGroom]                     = useState("");
  const [bride, setBride]                     = useState("");
  const [photoUrl, setPhotoUrl]               = useState("");
  const [weddingDate, setWeddingDate]         = useState("");
  const [weddingTime, setWeddingTime]         = useState("");
  const [weddingLocation, setWeddingLocation] = useState("");
  const [totalBudget, setTotalBudget]         = useState(0);
  const [totalSpent, setTotalSpent]           = useState(0);
  const [totalGuests, setTotalGuests]         = useState(0);
  const [planningDone, setPlanningDone]       = useState(0);
  const [planningTotal, setPlanningTotal]     = useState(0);
  const [hadir, setHadir]                     = useState(0);
  const [categoryStats, setCategoryStats]     = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [totalSudahDipakai, setTotalSudahDipakai] = useState(0);
  const [totalBankBSI, setTotalBankBSI]           = useState(0);
  const [showSudahDipakai, setShowSudahDipakai]   = useState(true);
  const [showBankBSI, setShowBankBSI]             = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [settingsRes, rabRes, guestsRes, planningRes, rsvpRes] = await Promise.all([
      supabase.from("settings").select("groom, bride, photo_url, wedding_date, wedding_time, wedding_location").eq("id", 1).single(),
      supabase.from("rab").select("budget, spent, category, status_dana"),
      supabase.from("guests").select("id"),
      supabase.from("planning").select("done"),
      supabase.from("rsvp").select("attendance"),
    ]);

    if (!settingsRes.error && settingsRes.data) {
      const d = settingsRes.data;
      setGroom(d.groom || ""); setBride(d.bride || ""); setPhotoUrl(d.photo_url || "");
      setWeddingDate(d.wedding_date || ""); setWeddingTime(d.wedding_time || ""); setWeddingLocation(d.wedding_location || "");
    }

    if (!rabRes.error && rabRes.data) {
      const rows = rabRes.data;
      setTotalBudget(rows.reduce((s, r) => s + (parseFloat(r.budget) || 0), 0));
      setTotalSpent(rows.reduce((s, r) => s + (parseFloat(r.spent) || 0), 0));
      setTotalSudahDipakai(rows.filter((r) => !r.status_dana || r.status_dana === "Sudah Dipakai").reduce((s, r) => s + (parseFloat(r.spent) || 0), 0));
      setTotalBankBSI(rows.filter((r) => r.status_dana === "Dana di Bank BSI").reduce((s, r) => s + (parseFloat(r.spent) || 0), 0));

      // ✅ Group per kategori + pisah sudah dipakai vs bank BSI
      const catMap = {};
      rows.forEach((r) => {
        const cat = r.category || "Lainnya";
        if (!catMap[cat]) catMap[cat] = { budget: 0, spent: 0, sudahDipakai: 0, bankBSI: 0 };
        catMap[cat].budget += parseFloat(r.budget) || 0;
        catMap[cat].spent  += parseFloat(r.spent)  || 0;
        if (!r.status_dana || r.status_dana === "Sudah Dipakai") {
          catMap[cat].sudahDipakai += parseFloat(r.spent) || 0;
        } else if (r.status_dana === "Dana di Bank BSI") {
          catMap[cat].bankBSI += parseFloat(r.spent) || 0;
        }
      });
      setCategoryStats(Object.entries(catMap)
        .map(([cat, val]) => ({ cat, ...val, realisasi: val.budget > 0 ? Math.round((val.spent / val.budget) * 100) : 0 }))
        .sort((a, b) => b.budget - a.budget));
    }

    if (!guestsRes.error) setTotalGuests(guestsRes.data?.length || 0);
    if (!planningRes.error && planningRes.data) {
      setPlanningTotal(planningRes.data.length);
      setPlanningDone(planningRes.data.filter((t) => t.done).length);
    }
    if (!rsvpRes.error && rsvpRes.data) setHadir(rsvpRes.data.filter((r) => r.attendance === "Hadir").length);
    setLoading(false);
  };

  const persen           = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const progressPlanning = planningTotal > 0 ? Math.round((planningDone / planningTotal) * 100) : 0;
  const hariLagi         = weddingDate ? Math.max(0, Math.floor((new Date(weddingDate) - new Date()) / 86400000)) : 0;
  const monitoringTotal  = (showSudahDipakai ? totalSudahDipakai : 0) + (showBankBSI ? totalBankBSI : 0);

  const formatDate = (d) => {
    if (!d) return "Tanggal belum diatur";
    return new Date(d).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  };

  // Total per kolom tabel
  const grandSudahDipakai = categoryStats.reduce((s, c) => s + c.sudahDipakai, 0);
  const grandBankBSI      = categoryStats.reduce((s, c) => s + c.bankBSI, 0);
  const grandSpent        = categoryStats.reduce((s, c) => s + c.spent, 0);
  const grandBudget       = categoryStats.reduce((s, c) => s + c.budget, 0);

  return (
    <div className="flex min-h-screen" style={{ background: "#F0F9FF", fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />
      <main className="flex-1 pt-16 md:pt-0 p-4 md:p-8 overflow-x-hidden">

        {/* Hero */}
        <div className="rounded-2xl md:rounded-3xl overflow-hidden mb-5 relative"
          style={{ background: "linear-gradient(135deg, #0C4A6E 0%, #0284C7 60%, #38BDF8 100%)", minHeight: "130px" }}>
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <div className="relative z-10 flex items-center gap-4 p-5 md:p-8">
            {photoUrl ? (
              <img src={photoUrl} alt="Foto"
                className="w-14 h-14 md:w-24 md:h-24 object-cover rounded-xl md:rounded-2xl border-4 shadow-xl flex-shrink-0"
                style={{ borderColor: "rgba(255,255,255,0.3)" }} />
            ) : (
              <div className="w-14 h-14 md:w-24 md:h-24 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.15)", border: "2px dashed rgba(255,255,255,0.3)" }}>
                <span className="text-2xl md:text-4xl">💑</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sky-200 text-xs uppercase tracking-widest mb-0.5">Wedding Dashboard</p>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif" }}
                className="text-xl md:text-3xl font-semibold text-white leading-tight truncate">
                {groom && bride ? `${groom.split(" ")[0]} & ${bride.split(" ")[0]}` : "Wedding Planner"}
              </h1>
              <p className="text-sky-200 text-xs mt-1">
                {formatDate(weddingDate)}{weddingTime ? ` • ${weddingTime}` : ""}{weddingLocation ? ` • ${weddingLocation}` : ""}
              </p>
            </div>
            <div className="text-center flex-shrink-0">
              <p className="text-2xl md:text-5xl font-bold text-white">{hariLagi}</p>
              <p className="text-sky-200 text-xs uppercase tracking-widest mt-0.5">Hari Lagi</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-sky-400 py-8 justify-center">
            <div className="w-4 h-4 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
            Memuat data...
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <StatCard label="Total Budget" value={`Rp ${totalBudget.toLocaleString("id-ID")}`} color="#0284C7" />
              <StatCard label="Terpakai"     value={`Rp ${totalSpent.toLocaleString("id-ID")}`}  color="#0EA5E9" />
              <StatCard label="Sisa Dana"    value={`Rp ${(totalBudget - totalSpent).toLocaleString("id-ID")}`} color="#0C4A6E" />
              <StatCard label="Total Tamu"   value={totalGuests} sub={`${hadir} hadir`} color="#0284C7" />
            </div>

            {/* Monitoring Status Dana */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-sky-100 mb-4">
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-4">Monitoring Dana Terpakai</p>
              <div className="flex flex-col md:flex-row gap-3 mb-4">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border transition flex-1"
                  style={{ borderColor: showSudahDipakai ? "#EF4444" : "#E2E8F0", background: showSudahDipakai ? "#FEF2F2" : "#F8FAFC" }}>
                  <input type="checkbox" checked={showSudahDipakai} onChange={() => setShowSudahDipakai(!showSudahDipakai)} className="w-4 h-4 accent-red-500" />
                  <div>
                    <p className="text-sm font-medium text-red-600">Sudah Dipakai</p>
                    <p className="text-xs font-bold text-red-500">Rp {totalSudahDipakai.toLocaleString("id-ID")}</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border transition flex-1"
                  style={{ borderColor: showBankBSI ? "#16A34A" : "#E2E8F0", background: showBankBSI ? "#F0FDF4" : "#F8FAFC" }}>
                  <input type="checkbox" checked={showBankBSI} onChange={() => setShowBankBSI(!showBankBSI)} className="w-4 h-4 accent-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-700">Dana di Bank BSI</p>
                    <p className="text-xs font-bold text-green-600">Rp {totalBankBSI.toLocaleString("id-ID")}</p>
                  </div>
                </label>
              </div>
              {totalSpent > 0 && (
                <div className="mb-4">
                  <div className="w-full h-5 bg-slate-100 rounded-full overflow-hidden flex">
                    {showSudahDipakai && totalSudahDipakai > 0 && (
                      <div className="h-full flex items-center justify-center transition-all duration-700"
                        style={{ width: `${(totalSudahDipakai / totalSpent) * 100}%`, background: "linear-gradient(90deg,#EF4444,#F87171)", minWidth: "2px" }}>
                        {(totalSudahDipakai / totalSpent) > 0.15 && <span className="text-white text-xs font-medium px-1">{Math.round((totalSudahDipakai / totalSpent) * 100)}%</span>}
                      </div>
                    )}
                    {showBankBSI && totalBankBSI > 0 && (
                      <div className="h-full flex items-center justify-center transition-all duration-700"
                        style={{ width: `${(totalBankBSI / totalSpent) * 100}%`, background: "linear-gradient(90deg,#16A34A,#4ADE80)", minWidth: "2px" }}>
                        {(totalBankBSI / totalSpent) > 0.15 && <span className="text-white text-xs font-medium px-1">{Math.round((totalBankBSI / totalSpent) * 100)}%</span>}
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex gap-3">
                  {showSudahDipakai && <div className="flex items-center gap-1.5 text-xs"><div className="w-3 h-3 rounded-full bg-red-400" /><span className="text-slate-500">Dipakai</span></div>}
                  {showBankBSI && <div className="flex items-center gap-1.5 text-xs"><div className="w-3 h-3 rounded-full bg-green-500" /><span className="text-slate-500">Bank BSI</span></div>}
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Total Monitoring</p>
                  <p className="text-lg font-bold text-sky-900">Rp {monitoringTotal.toLocaleString("id-ID")}</p>
                </div>
              </div>
            </div>

            {/* Progress Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-sky-100">
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Persiapan</p>
                <h2 className="font-semibold text-sky-900 mb-3 text-sm">Progress Planning</h2>
                <div className="flex justify-between text-xs text-slate-500 mb-2"><span>{planningDone} selesai</span><span>{planningTotal} total</span></div>
                <div className="w-full bg-sky-100 rounded-full h-2.5">
                  <div className="h-2.5 rounded-full" style={{ width: `${progressPlanning}%`, background: "linear-gradient(90deg,#0284C7,#38BDF8)" }} />
                </div>
                <p className="text-right text-xs mt-1 text-sky-600 font-medium">{progressPlanning}%</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-sky-100">
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Keuangan</p>
                <h2 className="font-semibold text-sky-900 mb-3 text-sm">Total Realisasi Budget</h2>
                <div className="flex justify-between text-xs text-slate-500 mb-2">
                  <span>Rp {totalSpent.toLocaleString("id-ID")}</span><span>Rp {totalBudget.toLocaleString("id-ID")}</span>
                </div>
                <div className="w-full bg-sky-100 rounded-full h-2.5">
                  <div className="h-2.5 rounded-full" style={{ width: `${Math.min(persen,100)}%`, background: persen > 90 ? "linear-gradient(90deg,#EF4444,#F87171)" : "linear-gradient(90deg,#0284C7,#38BDF8)" }} />
                </div>
                <p className="text-right text-xs mt-1 font-medium" style={{ color: persen > 90 ? "#EF4444" : "#0284C7" }}>{persen}%</p>
              </div>
            </div>

            {/* Chart + Tabel Kategori */}
            {categoryStats.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-sky-100">
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Analisis Anggaran</p>
                <h2 className="font-semibold text-sky-900 mb-5 text-sm">Budget vs Realisasi per Kategori</h2>

                {/* Donut + Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="md:col-span-1 flex flex-col items-center">
                    <p className="text-xs text-slate-400 mb-3 uppercase tracking-widest">Proporsi Budget</p>
                    <DonutChart stats={categoryStats} totalBudget={totalBudget} />
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-slate-400 mb-3 uppercase tracking-widest">Realisasi (hover untuk detail)</p>
                    <CategoryChart stats={categoryStats} totalBudget={totalBudget} />
                  </div>
                </div>

                {/* ✅ Tabel dengan kolom terpakai dipecah 2 */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs min-w-[560px]">
                    <thead>
                      <tr>
                        <th rowSpan={2} className="text-left pb-2 font-medium text-slate-400 uppercase tracking-widest border-b border-sky-100 pr-3">Kategori</th>
                        <th rowSpan={2} className="text-right pb-2 font-medium text-slate-400 uppercase tracking-widest border-b border-sky-100 px-3">Budget</th>
                        {/* ✅ Header terpakai dipecah 2 */}
                        <th colSpan={2} className="text-center pb-1 font-medium text-slate-400 uppercase tracking-widest px-3">Terpakai</th>
                        <th rowSpan={2} className="text-right pb-2 font-medium text-slate-400 uppercase tracking-widest border-b border-sky-100 px-3">Total</th>
                        <th rowSpan={2} className="text-right pb-2 font-medium text-slate-400 uppercase tracking-widest border-b border-sky-100 px-3">Sisa</th>
                        <th rowSpan={2} className="text-right pb-2 font-medium text-slate-400 uppercase tracking-widest border-b border-sky-100 pl-3">%</th>
                      </tr>
                      <tr>
                        <th className="text-right pb-2 font-medium text-red-400 uppercase tracking-widest border-b border-sky-100 px-3">Sudah Dipakai</th>
                        <th className="text-right pb-2 font-medium text-green-600 uppercase tracking-widest border-b border-sky-100 px-3">Bank BSI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sky-50">
                      {categoryStats.map((c) => (
                        <tr key={c.cat} className="hover:bg-sky-50 transition">
                          <td className="py-2 font-medium text-slate-700 pr-3">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: getColor(c.cat).bar }} />
                              {c.cat}
                            </div>
                          </td>
                          <td className="py-2 text-right text-slate-500 px-3">Rp {c.budget.toLocaleString("id-ID")}</td>
                          {/* ✅ Kolom Sudah Dipakai */}
                          <td className="py-2 text-right px-3">
                            <span className={c.sudahDipakai > 0 ? "text-red-500 font-medium" : "text-slate-300"}>
                              Rp {c.sudahDipakai.toLocaleString("id-ID")}
                            </span>
                          </td>
                          {/* ✅ Kolom Bank BSI */}
                          <td className="py-2 text-right px-3">
                            <span className={c.bankBSI > 0 ? "text-green-600 font-medium" : "text-slate-300"}>
                              Rp {c.bankBSI.toLocaleString("id-ID")}
                            </span>
                          </td>
                          <td className="py-2 text-right text-sky-600 font-medium px-3">Rp {c.spent.toLocaleString("id-ID")}</td>
                          <td className={`py-2 text-right font-medium px-3 ${c.budget - c.spent < 0 ? "text-red-500" : "text-green-600"}`}>
                            Rp {(c.budget - c.spent).toLocaleString("id-ID")}
                          </td>
                          <td className={`py-2 text-right font-bold pl-3 ${c.realisasi > 100 ? "text-red-500" : c.realisasi > 80 ? "text-amber-500" : "text-sky-600"}`}>
                            {c.realisasi}%
                          </td>
                        </tr>
                      ))}

                      {/* ✅ Baris total */}
                      <tr className="font-semibold text-sky-900 border-t-2 border-sky-200 bg-sky-50">
                        <td className="pt-3 pb-2 pr-3">Total</td>
                        <td className="pt-3 pb-2 text-right px-3">Rp {grandBudget.toLocaleString("id-ID")}</td>
                        <td className="pt-3 pb-2 text-right px-3 text-red-500">Rp {grandSudahDipakai.toLocaleString("id-ID")}</td>
                        <td className="pt-3 pb-2 text-right px-3 text-green-600">Rp {grandBankBSI.toLocaleString("id-ID")}</td>
                        <td className="pt-3 pb-2 text-right px-3 text-sky-600">Rp {grandSpent.toLocaleString("id-ID")}</td>
                        <td className={`pt-3 pb-2 text-right px-3 ${grandBudget - grandSpent < 0 ? "text-red-500" : "text-green-600"}`}>
                          Rp {(grandBudget - grandSpent).toLocaleString("id-ID")}
                        </td>
                        <td className={`pt-3 pb-2 text-right pl-3 ${persen > 100 ? "text-red-500" : persen > 80 ? "text-amber-500" : "text-sky-600"}`}>
                          {persen}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Legend warna */}
                <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-sky-50 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-red-400" />Sudah Dipakai</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-green-500" />Dana di Bank BSI</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-sky-500" />Total Terpakai</div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

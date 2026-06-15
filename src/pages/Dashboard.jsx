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
  "Hiburan":      { bar: "#D97706", light: "#FEF3C7" },
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

// Bar chart komponen
function CategoryChart({ stats, totalBudget }) {
  const [tooltip, setTooltip] = useState(null);

  if (!stats.length) return (
    <div className="text-center py-8 text-slate-400 text-sm">Belum ada data anggaran per kategori</div>
  );

  return (
    <div>
      {/* Grouped Bar Chart */}
      <div className="space-y-4">
        {stats.map((c) => {
          const budgetPct  = totalBudget > 0 ? (c.budget / totalBudget) * 100 : 0;
          const spentPct   = c.budget > 0 ? Math.min((c.spent / c.budget) * 100, 100) : 0;
          const overBudget = c.spent > c.budget;
          const col        = getColor(c.cat);

          return (
            <div key={c.cat} className="relative"
              onMouseEnter={() => setTooltip(c.cat)}
              onMouseLeave={() => setTooltip(null)}>

              {/* Label row */}
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: col.bar }} />
                  <span className="text-xs font-medium text-slate-700">{c.cat}</span>
                  {overBudget && <span className="text-xs text-red-500 font-semibold">⚠ Melebihi</span>}
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-400 hidden md:inline">
                    {budgetPct.toFixed(1)}% dari total
                  </span>
                  <span className={`font-bold w-12 text-right ${
                    c.realisasi > 100 ? "text-red-500"
                    : c.realisasi > 80 ? "text-amber-500"
                    : "text-sky-600"
                  }`}>{c.realisasi}%</span>
                </div>
              </div>

              {/* Budget bar (background) */}
              <div className="relative h-6 rounded-lg overflow-hidden" style={{ background: col.light }}>
                {/* Budget total bar */}
                <div className="absolute inset-0 flex items-center px-2">
                  <span className="text-xs text-slate-400 z-10 relative">
                    Rp {c.budget.toLocaleString("id-ID")}
                  </span>
                </div>

                {/* Spent bar overlay */}
                <div
                  className="absolute top-0 left-0 h-full rounded-lg flex items-center px-2 transition-all duration-700"
                  style={{
                    width: `${spentPct}%`,
                    background: c.realisasi > 100
                      ? "linear-gradient(90deg,#EF4444,#F87171)"
                      : c.realisasi > 80
                      ? "linear-gradient(90deg,#F59E0B,#FCD34D)"
                      : `linear-gradient(90deg, ${col.bar}, ${col.bar}cc)`,
                    minWidth: c.spent > 0 ? "2px" : "0",
                  }}>
                  {spentPct > 25 && (
                    <span className="text-xs text-white font-medium truncate">
                      Rp {c.spent.toLocaleString("id-ID")}
                    </span>
                  )}
                </div>
              </div>

              {/* Tooltip detail */}
              {tooltip === c.cat && (
                <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-xl shadow-xl border border-sky-100 p-3 min-w-[200px]">
                  <p className="font-semibold text-sky-900 text-sm mb-2">{c.cat}</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Budget</span>
                      <span className="font-medium">Rp {c.budget.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Terpakai</span>
                      <span className="font-medium">Rp {c.spent.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sisa</span>
                      <span className={`font-medium ${c.budget - c.spent < 0 ? "text-red-500" : "text-green-600"}`}>
                        Rp {(c.budget - c.spent).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-100">
                      <span className="text-slate-400">% dari Total Budget</span>
                      <span className="font-medium text-sky-600">{(c.budget / totalBudget * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Realisasi</span>
                      <span className={`font-bold ${c.realisasi > 100 ? "text-red-500" : c.realisasi > 80 ? "text-amber-500" : "text-sky-600"}`}>
                        {c.realisasi}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 pt-4 border-t border-sky-50 flex flex-wrap gap-x-4 gap-y-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <div className="w-8 h-2 rounded-sm" style={{ background: "#0284C7" }} />
          Terpakai
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <div className="w-8 h-2 rounded-sm" style={{ background: "#E0F2FE" }} />
          Budget
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <div className="w-8 h-2 rounded-sm" style={{ background: "#F59E0B" }} />
          &gt; 80%
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <div className="w-8 h-2 rounded-sm" style={{ background: "#EF4444" }} />
          Melebihi Budget
        </div>
      </div>
    </div>
  );
}

// Donut chart ringkasan proporsi budget per kategori
function DonutChart({ stats, totalBudget }) {
  const [hovered, setHovered] = useState(null);
  if (!stats.length || totalBudget === 0) return null;

  const size   = 140;
  const cx     = size / 2;
  const cy     = size / 2;
  const radius = 52;
  const stroke = 22;

  let cumulative = 0;
  const slices = stats.map((c) => {
    const pct   = c.budget / totalBudget;
    const start = cumulative;
    cumulative += pct;
    return { ...c, pct, start, end: cumulative };
  });

  const describeArc = (startPct, endPct) => {
    const startAngle = startPct * 2 * Math.PI - Math.PI / 2;
    const endAngle   = endPct   * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const large = endPct - startPct > 0.5 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`;
  };

  const active = hovered ? stats.find((s) => s.cat === hovered) : null;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          {slices.map((s) => (
            <path
              key={s.cat}
              d={describeArc(s.start, s.end)}
              fill="none"
              stroke={hovered === s.cat ? getColor(s.cat).bar : getColor(s.cat).bar + "CC"}
              strokeWidth={hovered === s.cat ? stroke + 4 : stroke}
              strokeLinecap="round"
              style={{ transition: "all 0.2s", cursor: "pointer" }}
              onMouseEnter={() => setHovered(s.cat)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
        </svg>
        {/* Center text */}
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

      {/* Legend */}
      <div className="mt-3 space-y-1 w-full">
        {slices.map((s) => (
          <div key={s.cat}
            className="flex items-center justify-between text-xs cursor-pointer px-2 py-0.5 rounded-lg transition"
            style={{ background: hovered === s.cat ? getColor(s.cat).light : "transparent" }}
            onMouseEnter={() => setHovered(s.cat)}
            onMouseLeave={() => setHovered(null)}>
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

export default function Dashboard() {
  const [groom, setGroom]             = useState("");
  const [bride, setBride]             = useState("");
  const [photoUrl, setPhotoUrl]       = useState("");
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpent, setTotalSpent]   = useState(0);
  const [totalGuests, setTotalGuests] = useState(0);
  const [planningDone, setPlanningDone]   = useState(0);
  const [planningTotal, setPlanningTotal] = useState(0);
  const [hadir, setHadir]           = useState(0);
  const [categoryStats, setCategoryStats] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [settingsRes, rabRes, guestsRes, planningRes, rsvpRes] = await Promise.all([
      supabase.from("settings").select("groom, bride, photo_url").eq("id", 1).single(),
      supabase.from("rab").select("budget, spent, category"),
      supabase.from("guests").select("id"),
      supabase.from("planning").select("done"),
      supabase.from("rsvp").select("attendance"),
    ]);

    if (!settingsRes.error && settingsRes.data) {
      setGroom(settingsRes.data.groom || "");
      setBride(settingsRes.data.bride || "");
      setPhotoUrl(settingsRes.data.photo_url || "");
    }

    if (!rabRes.error && rabRes.data) {
      const rows = rabRes.data;
      const tb = rows.reduce((s, r) => s + (parseFloat(r.budget) || 0), 0);
      const ts = rows.reduce((s, r) => s + (parseFloat(r.spent)  || 0), 0);
      setTotalBudget(tb);
      setTotalSpent(ts);

      const catMap = {};
      rows.forEach((r) => {
        const cat = r.category || "Lainnya";
        if (!catMap[cat]) catMap[cat] = { budget: 0, spent: 0 };
        catMap[cat].budget += parseFloat(r.budget) || 0;
        catMap[cat].spent  += parseFloat(r.spent)  || 0;
      });
      const stats = Object.entries(catMap)
        .map(([cat, val]) => ({
          cat, ...val,
          realisasi: val.budget > 0 ? Math.round((val.spent / val.budget) * 100) : 0,
        }))
        .sort((a, b) => b.budget - a.budget);
      setCategoryStats(stats);
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
  const hariLagi         = Math.max(0, Math.floor((new Date("2026-12-20") - new Date()) / 86400000));

  return (
    <div className="flex min-h-screen" style={{ background: "#F0F9FF", fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />
      <main className="flex-1 pt-16 md:pt-0 p-4 md:p-8 overflow-x-hidden">

        {/* Hero Banner */}
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
              <p className="text-sky-200 text-xs mt-1 hidden md:block">Sabtu, 20 Desember 2026 • Bandung</p>
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

            {/* Progress Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-sky-100">
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Persiapan</p>
                <h2 className="font-semibold text-sky-900 mb-3 text-sm">Progress Planning</h2>
                <div className="flex justify-between text-xs text-slate-500 mb-2">
                  <span>{planningDone} selesai</span><span>{planningTotal} total</span>
                </div>
                <div className="w-full bg-sky-100 rounded-full h-2.5">
                  <div className="h-2.5 rounded-full" style={{ width: `${progressPlanning}%`, background: "linear-gradient(90deg,#0284C7,#38BDF8)" }} />
                </div>
                <p className="text-right text-xs mt-1 text-sky-600 font-medium">{progressPlanning}%</p>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-sky-100">
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Keuangan</p>
                <h2 className="font-semibold text-sky-900 mb-3 text-sm">Total Realisasi Budget</h2>
                <div className="flex justify-between text-xs text-slate-500 mb-2">
                  <span>Rp {totalSpent.toLocaleString("id-ID")}</span>
                  <span>Rp {totalBudget.toLocaleString("id-ID")}</span>
                </div>
                <div className="w-full bg-sky-100 rounded-full h-2.5">
                  <div className="h-2.5 rounded-full" style={{ width: `${Math.min(persen,100)}%`, background: persen > 90 ? "linear-gradient(90deg,#EF4444,#F87171)" : "linear-gradient(90deg,#0284C7,#38BDF8)" }} />
                </div>
                <p className="text-right text-xs mt-1 font-medium" style={{ color: persen > 90 ? "#EF4444" : "#0284C7" }}>{persen}%</p>
              </div>
            </div>

            {/* Chart Budget per Kategori */}
            {categoryStats.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-sky-100">
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Analisis Anggaran</p>
                <h2 className="font-semibold text-sky-900 mb-5 text-sm">Budget vs Realisasi per Kategori</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Donut chart — kiri */}
                  <div className="md:col-span-1 flex flex-col items-center justify-start">
                    <p className="text-xs text-slate-400 mb-3 uppercase tracking-widest">Proporsi Budget</p>
                    <DonutChart stats={categoryStats} totalBudget={totalBudget} />
                  </div>

                  {/* Bar chart — kanan */}
                  <div className="md:col-span-2">
                    <p className="text-xs text-slate-400 mb-3 uppercase tracking-widest">Realisasi (hover untuk detail)</p>
                    <CategoryChart stats={categoryStats} totalBudget={totalBudget} />
                  </div>
                </div>

                {/* Summary tabel ringkas */}
                <div className="mt-5 pt-4 border-t border-sky-50">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs min-w-[400px]">
                      <thead>
                        <tr className="text-slate-400 uppercase tracking-widest">
                          <th className="text-left pb-2 font-medium">Kategori</th>
                          <th className="text-right pb-2 font-medium">Budget</th>
                          <th className="text-right pb-2 font-medium">Terpakai</th>
                          <th className="text-right pb-2 font-medium">Sisa</th>
                          <th className="text-right pb-2 font-medium">%</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sky-50">
                        {categoryStats.map((c) => (
                          <tr key={c.cat}>
                            <td className="py-2 font-medium text-slate-700">
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{ background: getColor(c.cat).bar }} />
                                {c.cat}
                              </div>
                            </td>
                            <td className="py-2 text-right text-slate-500">Rp {c.budget.toLocaleString("id-ID")}</td>
                            <td className="py-2 text-right text-sky-600">Rp {c.spent.toLocaleString("id-ID")}</td>
                            <td className={`py-2 text-right font-medium ${c.budget - c.spent < 0 ? "text-red-500" : "text-green-600"}`}>
                              Rp {(c.budget - c.spent).toLocaleString("id-ID")}
                            </td>
                            <td className={`py-2 text-right font-bold ${c.realisasi > 100 ? "text-red-500" : c.realisasi > 80 ? "text-amber-500" : "text-sky-600"}`}>
                              {c.realisasi}%
                            </td>
                          </tr>
                        ))}
                        {/* Total row */}
                        <tr className="font-semibold text-sky-900 border-t-2 border-sky-200">
                          <td className="pt-2">Total</td>
                          <td className="pt-2 text-right">Rp {totalBudget.toLocaleString("id-ID")}</td>
                          <td className="pt-2 text-right text-sky-600">Rp {totalSpent.toLocaleString("id-ID")}</td>
                          <td className={`pt-2 text-right ${totalBudget - totalSpent < 0 ? "text-red-500" : "text-green-600"}`}>
                            Rp {(totalBudget - totalSpent).toLocaleString("id-ID")}
                          </td>
                          <td className={`pt-2 text-right ${persen > 100 ? "text-red-500" : persen > 80 ? "text-amber-500" : "text-sky-600"}`}>
                            {persen}%
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

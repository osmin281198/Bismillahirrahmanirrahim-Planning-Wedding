import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Sidebar from "../components/Sidebar";

export default function Planning() {
  const [task, setTask]   = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchPlanning(); }, []);

  const fetchPlanning = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("planning").select("*").order("id");
    if (!error) setTasks(data);
    setLoading(false);
  };

  const addTask = async () => {
    if (!task) return;
    const newTask = { id: Date.now(), name: task, done: false };
    const { error } = await supabase.from("planning").insert(newTask);
    if (!error) { setTasks([...tasks, newTask]); setTask(""); }
  };

  const toggleTask = async (id, currentDone) => {
    const { error } = await supabase.from("planning").update({ done: !currentDone }).eq("id", id);
    if (!error) setTasks(tasks.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTask = async (id) => {
    const { error } = await supabase.from("planning").delete().eq("id", id);
    if (!error) setTasks(tasks.filter((t) => t.id !== id));
  };

  const done = tasks.filter((t) => t.done).length;
  const persen = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <div className="flex min-h-screen" style={{ background: "#F0F9FF", fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />
      <main className="flex-1 pt-16 md:pt-0 p-4 md:p-8 overflow-x-hidden">
        <div className="mb-6">
          <p className="text-sky-500 text-xs uppercase tracking-widest mb-1">Checklist</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="text-3xl md:text-4xl font-semibold text-sky-900">Planning Wedding</h1>
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-sky-100 mb-4">
          <div className="flex justify-between text-xs md:text-sm text-slate-500 mb-2">
            <span>{done} dari {tasks.length} selesai</span>
            <span className="text-sky-600 font-semibold">{persen}%</span>
          </div>
          <div className="w-full bg-sky-100 rounded-full h-2.5">
            <div className="h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${persen}%`, background: "linear-gradient(90deg, #0284C7, #38BDF8)" }} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-sky-100 mb-4">
          <div className="flex gap-2 md:gap-3">
            <input value={task} onChange={(e) => setTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              placeholder="Tambah planning baru..."
              className="border border-slate-200 p-3 rounded-xl flex-1 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
            <button onClick={addTask}
              className="px-4 md:px-5 py-3 rounded-xl text-white text-sm font-semibold transition hover:opacity-90 whitespace-nowrap"
              style={{ background: "linear-gradient(90deg, #0284C7, #38BDF8)" }}>+ Tambah</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-sky-100 divide-y divide-sky-50">
          {loading ? (
            <p className="p-6 text-center text-slate-400">Memuat...</p>
          ) : tasks.length === 0 ? (
            <p className="p-8 text-center text-slate-400">Belum ada planning.</p>
          ) : (
            tasks.map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-4 md:px-6 py-3 md:py-4 hover:bg-sky-50 transition">
                <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id, t.done)}
                  className="w-4 h-4 accent-sky-500 cursor-pointer flex-shrink-0" />
                <span className={`flex-1 text-sm ${t.done ? "line-through text-slate-400" : "text-slate-700"}`}>{t.name}</span>
                {t.done && <span className="text-xs bg-sky-100 text-sky-600 px-2 py-0.5 rounded-full hidden md:inline">Selesai</span>}
                <button onClick={() => deleteTask(t.id)}
                  className="text-xs px-2 md:px-3 py-1.5 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition flex-shrink-0">Hapus</button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

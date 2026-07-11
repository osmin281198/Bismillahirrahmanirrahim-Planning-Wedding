import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Sidebar from "../components/Sidebar";

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&display=swap');
@keyframes fadeUp { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
@keyframes checkPop { 0%{transform:scale(0)}60%{transform:scale(1.2)}100%{transform:scale(1)} }
`;

export default function Planning() {
  const [tasks, setTasks]   = useState([]);
  const [input, setInput]   = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding]   = useState(false);

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = STYLES;
    document.head.appendChild(el);
    fetchTasks();
    return () => document.head.removeChild(el);
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    const { data } = await supabase.from("planning").select("*").order("id");
    if (data) setTasks(data);
    setLoading(false);
  };

  const addTask = async () => {
    if (!input.trim()) return;
    setAdding(true);
    const newTask = { id: Date.now(), name: input.trim(), done: false };
    await supabase.from("planning").insert(newTask);
    setTasks([...tasks, newTask]);
    setInput("");
    setAdding(false);
  };

  const toggleTask = async (id, done) => {
    await supabase.from("planning").update({ done: !done }).eq("id", id);
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !done } : t));
  };

  const deleteTask = async (id) => {
    await supabase.from("planning").delete().eq("id", id);
    setTasks(tasks.filter(t => t.id !== id));
  };

  const done  = tasks.filter(t => t.done).length;
  const total = tasks.length;
  const pct   = total > 0 ? Math.round((done/total)*100) : 0;
  const gold  = "#C4A45A";

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#0F172A", fontFamily:"'Inter',sans-serif" }}>
      <Sidebar />
      <main style={{ flex:1, padding:"80px 20px 32px", maxWidth:700, margin:"0 auto" }}
        className="md:pt-8">

        {/* Header */}
        <div style={{ marginBottom:32, animation:"fadeUp 0.6s ease both" }}>
          <p style={{ color:gold, fontSize:"0.6rem", letterSpacing:"0.3em",
            textTransform:"uppercase", marginBottom:6 }}>Persiapan</p>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2.2rem",
            fontWeight:600, color:"white" }}>Wedding Planning</h1>
        </div>

        {/* Progress Card */}
        <div style={{
          background:"linear-gradient(135deg,rgba(196,164,90,0.12),rgba(196,164,90,0.04))",
          border:"1px solid rgba(196,164,90,0.2)", borderRadius:20,
          padding:"24px 28px", marginBottom:24, animation:"fadeUp 0.6s 0.1s ease both",
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div>
              <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"0.75rem", marginBottom:4 }}>Progress Keseluruhan</p>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2rem",
                color:"white", fontWeight:600 }}>{done} <span style={{ color:"rgba(255,255,255,0.3)", fontSize:"1.2rem" }}>/ {total}</span></p>
            </div>
            <div style={{ textAlign:"right" }}>
              <p style={{ fontSize:"2rem", fontWeight:700,
                color: pct===100 ? "#4ADE80" : pct>60 ? gold : "rgba(255,255,255,0.6)" }}>{pct}%</p>
              <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.7rem" }}>Selesai</p>
            </div>
          </div>
          <div style={{ height:8, background:"rgba(255,255,255,0.08)", borderRadius:99, overflow:"hidden" }}>
            <div style={{
              height:"100%", borderRadius:99, transition:"width 0.8s ease",
              width:`${pct}%`,
              background: pct===100 ? "linear-gradient(90deg,#4ADE80,#22C55E)"
                : pct>60 ? "linear-gradient(90deg,#C4A45A,#E8CC8A)"
                : "linear-gradient(90deg,#0284C7,#38BDF8)",
            }} />
          </div>
          {pct===100 && (
            <p style={{ textAlign:"center", marginTop:12, color:"#4ADE80", fontSize:"0.8rem" }}>
              🎉 Semua persiapan selesai!
            </p>
          )}
        </div>

        {/* Input */}
        <div style={{
          display:"flex", gap:10, marginBottom:24,
          animation:"fadeUp 0.6s 0.15s ease both",
        }}>
          <input placeholder="Tambah tugas persiapan..." value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key==="Enter" && addTask()}
            style={{
              flex:1, padding:"14px 18px", borderRadius:14,
              background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
              color:"white", fontSize:"0.88rem", outline:"none",
            }}
            onFocus={e => e.target.style.borderColor="rgba(196,164,90,0.4)"}
            onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.1)"}
          />
          <button onClick={addTask} disabled={adding || !input.trim()}
            style={{
              padding:"14px 22px", borderRadius:14, border:"none",
              background:`linear-gradient(135deg,${gold},#E8CC8A)`,
              color:"#0F172A", fontWeight:700, fontSize:"0.88rem",
              cursor:"pointer", flexShrink:0,
              opacity: (!input.trim() || adding) ? 0.5 : 1,
            }}>+ Tambah</button>
        </div>

        {/* Task List */}
        {loading ? (
          <div style={{ textAlign:"center", padding:"48px 0", color:"rgba(255,255,255,0.3)" }}>Memuat...</div>
        ) : tasks.length === 0 ? (
          <div style={{ textAlign:"center", padding:"64px 0" }}>
            <p style={{ fontSize:"3rem", marginBottom:12 }}>📋</p>
            <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.9rem" }}>Belum ada tugas. Tambahkan persiapan pertama!</p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {/* Belum selesai */}
            {tasks.filter(t => !t.done).map((task, i) => (
              <div key={task.id}
                style={{
                  display:"flex", alignItems:"center", gap:14,
                  padding:"16px 18px", borderRadius:14,
                  background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
                  animation:`fadeUp 0.4s ${i*0.05}s ease both`, transition:"all 0.2s",
                }}>
                <button onClick={() => toggleTask(task.id, task.done)}
                  style={{
                    width:24, height:24, borderRadius:"50%", flexShrink:0,
                    border:`2px solid rgba(196,164,90,0.4)`, background:"transparent",
                    cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                    transition:"all 0.2s",
                  }} />
                <span style={{ flex:1, color:"rgba(255,255,255,0.8)", fontSize:"0.88rem" }}>{task.name}</span>
                <button onClick={() => deleteTask(task.id)}
                  style={{ background:"none", border:"none", color:"rgba(255,255,255,0.2)",
                    cursor:"pointer", fontSize:"1rem", padding:4, transition:"color 0.2s" }}
                  onMouseEnter={e => e.target.style.color="rgba(239,68,68,0.6)"}
                  onMouseLeave={e => e.target.style.color="rgba(255,255,255,0.2)"}>✕</button>
              </div>
            ))}

            {/* Sudah selesai */}
            {tasks.filter(t => t.done).length > 0 && (
              <>
                <div style={{ padding:"12px 0 4px", display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.06)" }} />
                  <p style={{ color:"rgba(255,255,255,0.25)", fontSize:"0.7rem",
                    letterSpacing:"0.15em", textTransform:"uppercase" }}>Selesai ({tasks.filter(t=>t.done).length})</p>
                  <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.06)" }} />
                </div>
                {tasks.filter(t => t.done).map((task, i) => (
                  <div key={task.id}
                    style={{
                      display:"flex", alignItems:"center", gap:14,
                      padding:"14px 18px", borderRadius:14,
                      background:"rgba(74,222,128,0.04)", border:"1px solid rgba(74,222,128,0.1)",
                      opacity:0.65,
                    }}>
                    <button onClick={() => toggleTask(task.id, task.done)}
                      style={{
                        width:24, height:24, borderRadius:"50%", flexShrink:0,
                        background:"linear-gradient(135deg,#4ADE80,#22C55E)",
                        border:"none", cursor:"pointer",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        color:"white", fontSize:"0.75rem", fontWeight:700,
                        animation:"checkPop 0.3s ease both",
                      }}>✓</button>
                    <span style={{ flex:1, color:"rgba(255,255,255,0.35)", fontSize:"0.88rem",
                      textDecoration:"line-through" }}>{task.name}</span>
                    <button onClick={() => deleteTask(task.id)}
                      style={{ background:"none", border:"none", color:"rgba(255,255,255,0.15)",
                        cursor:"pointer", fontSize:"1rem", padding:4 }}>✕</button>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

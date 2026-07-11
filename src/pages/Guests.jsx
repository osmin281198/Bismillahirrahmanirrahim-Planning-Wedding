import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import Sidebar from "../components/Sidebar";

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&display=swap');
@keyframes fadeUp { from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)} }
`;

const CATEGORIES = ["Keluarga Pria","Keluarga Wanita","Teman Pria","Teman Wanita","Rekan Kerja","Tetangga","Lainnya"];
const CAT_COLORS = {
  "Keluarga Pria":  "#60A5FA","Keluarga Wanita": "#F472B6",
  "Teman Pria":     "#34D399","Teman Wanita":    "#FBBF24",
  "Rekan Kerja":    "#A78BFA","Tetangga":        "#FB923C","Lainnya":"#94A3B8",
};

export default function Guests() {
  const [guests, setGuests]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [name, setName]         = useState("");
  const [category, setCategory] = useState("");
  const [phone, setPhone]       = useState("");
  const [search, setSearch]     = useState("");
  const [filterCat, setFilterCat] = useState("Semua");
  const [filterSent, setFilterSent] = useState("Semua");
  const fileRef = useRef();

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = STYLES;
    document.head.appendChild(el);
    fetchGuests();
    return () => document.head.removeChild(el);
  }, []);

  const fetchGuests = async () => {
    setLoading(true);
    const { data } = await supabase.from("guests").select("*").order("id");
    if (data) setGuests(data);
    setLoading(false);
  };

  const addGuest = async () => {
    if (!name.trim()) return;
    const slug = name.trim().toLowerCase().replace(/\s+/g,"-");
    const newGuest = { id:Date.now(), name:name.trim(), category, phone, slug, invitation_sent:false };
    await supabase.from("guests").insert(newGuest);
    setGuests([...guests, newGuest]);
    setName(""); setCategory(""); setPhone("");
  };

  const deleteGuest = async (id) => {
    await supabase.from("guests").delete().eq("id",id);
    setGuests(guests.filter(g => g.id !== id));
  };

  const sendWA = async (guest) => {
    const msg = encodeURIComponent(
      `wedding-app\n\nhttps://bismillahirrahmanirrahim-planning-w.vercel.app\n\nAssalamu'alaikum Wr. Wb.\n\nKepada Yth.\n${guest.name}\n\nKami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami.\n\nSilakan buka undangan berikut:\n\nhttps://bismillahirrahmanirrahim-planning-w.vercel.app/invitation/${guest.slug}\n\nTerima kasih.`
    );
    window.open(`https://wa.me/${guest.phone}?text=${msg}`,"_blank");
    await supabase.from("guests").update({ invitation_sent:true }).eq("id",guest.id);
    setGuests(guests.map(g => g.id===guest.id ? {...g, invitation_sent:true} : g));
  };

  const importExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const XLSX = await import("xlsx");
    const ab   = await file.arrayBuffer();
    const wb   = XLSX.read(ab);
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    const newGuests = rows.map(r => ({
      id: Date.now() + Math.random(),
      name: r["Nama"]||"", category: r["Kategori"]||"Lainnya",
      phone: String(r["Telepon"]||""),
      slug: (r["Nama"]||"").toLowerCase().replace(/\s+/g,"-"),
      invitation_sent: false,
    })).filter(g => g.name);
    if (newGuests.length) {
      await supabase.from("guests").insert(newGuests);
      setGuests([...guests, ...newGuests]);
    }
    e.target.value = "";
  };

  const gold = "#C4A45A";
  const filtered = guests
    .filter(g => filterCat==="Semua" || g.category===filterCat)
    .filter(g => filterSent==="Semua" || (filterSent==="Terkirim" ? g.invitation_sent : !g.invitation_sent))
    .filter(g => !search || g.name?.toLowerCase().includes(search.toLowerCase()));

  const sent    = guests.filter(g => g.invitation_sent).length;
  const notSent = guests.filter(g => !g.invitation_sent).length;

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#0F172A", fontFamily:"'Inter',sans-serif" }}>
      <Sidebar />
      <main style={{ flex:1, padding:"80px 16px 32px" }} className="md:pt-8 md:p-8">

        {/* Header */}
        <div style={{ marginBottom:24, animation:"fadeUp 0.6s ease both" }}>
          <p style={{ color:gold, fontSize:"0.6rem", letterSpacing:"0.3em", textTransform:"uppercase", marginBottom:6 }}>Manajemen</p>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2.2rem", fontWeight:600, color:"white" }}>Daftar Tamu</h1>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12,
          marginBottom:20, animation:"fadeUp 0.6s 0.1s ease both" }}>
          {[
            { label:"Total Tamu", val:guests.length, color:"#60A5FA" },
            { label:"Terkirim",   val:sent,          color:"#4ADE80" },
            { label:"Belum Kirim",val:notSent,        color:"#FBBF24" },
          ].map(s => (
            <div key={s.label} style={{ padding:"16px 14px", borderRadius:16, textAlign:"center",
              background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
              <p style={{ fontSize:"1.6rem", fontWeight:700, color:s.color }}>{s.val}</p>
              <p style={{ fontSize:"0.68rem", color:"rgba(255,255,255,0.35)", marginTop:3 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Form Tambah */}
        <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)",
          borderRadius:20, padding:"20px", marginBottom:20, animation:"fadeUp 0.6s 0.15s ease both" }}>
          <p style={{ color:gold, fontSize:"0.68rem", letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:14 }}>Tambah Tamu</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            {[
              { ph:"Nama tamu", val:name, set:setName },
              { ph:"No. WA (628...)", val:phone, set:setPhone },
            ].map((f,i) => (
              <input key={i} placeholder={f.ph} value={f.val} onChange={e=>f.set(e.target.value)}
                style={{ padding:"11px 14px", borderRadius:10, background:"rgba(255,255,255,0.05)",
                  border:"1px solid rgba(255,255,255,0.1)", color:"white", fontSize:"0.85rem", outline:"none" }} />
            ))}
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <select value={category} onChange={e=>setCategory(e.target.value)}
              style={{ flex:1, padding:"11px 14px", borderRadius:10, background:"rgba(255,255,255,0.05)",
                border:"1px solid rgba(255,255,255,0.1)", color:"white", fontSize:"0.85rem", outline:"none" }}>
              <option value="">Pilih Kategori</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={addGuest}
              style={{ padding:"11px 20px", borderRadius:10, border:"none",
                background:`linear-gradient(135deg,${gold},#E8CC8A)`,
                color:"#0F172A", fontWeight:700, fontSize:"0.85rem", cursor:"pointer" }}>+ Tambah</button>
            <label style={{ padding:"11px 16px", borderRadius:10, cursor:"pointer",
              background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)",
              color:"rgba(255,255,255,0.5)", fontSize:"0.82rem", display:"flex", alignItems:"center" }}>
              📥 Excel
              <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={importExcel} style={{ display:"none" }} />
            </label>
          </div>
        </div>

        {/* Filter */}
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16,
          animation:"fadeUp 0.6s 0.2s ease both" }}>
          <input placeholder="🔍 Cari tamu..." value={search} onChange={e=>setSearch(e.target.value)}
            style={{ flex:1, minWidth:160, padding:"9px 14px", borderRadius:10,
              background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
              color:"white", fontSize:"0.82rem", outline:"none" }} />
          {["Semua","Terkirim","Belum"].map(f => (
            <button key={f} onClick={() => setFilterSent(f==="Belum"?"Belum Kirim":f)}
              style={{ padding:"9px 14px", borderRadius:10, fontSize:"0.78rem",
                border: filterSent===(f==="Belum"?"Belum Kirim":f) ? `1px solid ${gold}` : "1px solid rgba(255,255,255,0.08)",
                background: filterSent===(f==="Belum"?"Belum Kirim":f) ? "rgba(196,164,90,0.12)" : "rgba(255,255,255,0.03)",
                color: filterSent===(f==="Belum"?"Belum Kirim":f) ? gold : "rgba(255,255,255,0.35)",
                cursor:"pointer" }}>{f}</button>
          ))}
        </div>

        {/* Category filter */}
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>
          {["Semua",...CATEGORIES].map(c => (
            <button key={c} onClick={() => setFilterCat(c)}
              style={{ padding:"6px 12px", borderRadius:99, fontSize:"0.73rem",
                border: filterCat===c ? `1px solid ${CAT_COLORS[c]||gold}` : "1px solid rgba(255,255,255,0.06)",
                background: filterCat===c ? `${CAT_COLORS[c]||gold}18` : "rgba(255,255,255,0.03)",
                color: filterCat===c ? (CAT_COLORS[c]||gold) : "rgba(255,255,255,0.3)",
                cursor:"pointer" }}>{c}</button>
          ))}
        </div>

        {/* Guest list */}
        {loading ? (
          <div style={{ textAlign:"center", padding:"48px", color:"rgba(255,255,255,0.3)" }}>Memuat...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"64px 0" }}>
            <p style={{ fontSize:"3rem", marginBottom:12 }}>👥</p>
            <p style={{ color:"rgba(255,255,255,0.3)" }}>Belum ada tamu.</p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {filtered.map((g, i) => (
              <div key={g.id}
                style={{
                  display:"flex", alignItems:"center", gap:12,
                  padding:"14px 16px", borderRadius:14,
                  background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)",
                  animation:`fadeUp 0.4s ${i*0.03}s ease both`,
                }}>
                <div style={{ width:8, height:8, borderRadius:"50%", flexShrink:0,
                  background:CAT_COLORS[g.category]||"#94A3B8" }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ color:"white", fontWeight:500, fontSize:"0.88rem",
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{g.name}</p>
                  <div style={{ display:"flex", gap:8, marginTop:3, flexWrap:"wrap" }}>
                    {g.category && (
                      <span style={{ fontSize:"0.68rem", color:CAT_COLORS[g.category]||"#94A3B8" }}>{g.category}</span>
                    )}
                    {g.phone && <span style={{ fontSize:"0.68rem", color:"rgba(255,255,255,0.25)" }}>{g.phone}</span>}
                  </div>
                </div>
                <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                  {g.invitation_sent ? (
                    <span style={{ fontSize:"0.7rem", padding:"4px 10px", borderRadius:99,
                      background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.2)",
                      color:"#4ADE80" }}>✓ Terkirim</span>
                  ) : (
                    <button onClick={() => sendWA(g)} disabled={!g.phone}
                      style={{ padding:"6px 12px", borderRadius:8, border:"none",
                        background:"rgba(37,211,102,0.15)", color:"#25D366",
                        fontSize:"0.75rem", fontWeight:600, cursor:"pointer",
                        border:"1px solid rgba(37,211,102,0.2)" }}>WA</button>
                  )}
                  <button onClick={() => deleteGuest(g.id)}
                    style={{ padding:"6px 10px", borderRadius:8, border:"none",
                      background:"rgba(239,68,68,0.08)", color:"rgba(239,68,68,0.6)",
                      fontSize:"0.75rem", cursor:"pointer",
                      border:"1px solid rgba(239,68,68,0.12)" }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
        <p style={{ color:"rgba(255,255,255,0.2)", fontSize:"0.72rem", marginTop:12, textAlign:"center" }}>
          Menampilkan {filtered.length} dari {guests.length} tamu
        </p>
      </main>
    </div>
  );
}

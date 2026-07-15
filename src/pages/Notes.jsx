import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import Sidebar from "../components/Sidebar";

const gold = "#C4A45A";
const goldLight = "#E8CC8A";

const TYPES = [
  { value:"motivasi", label:"💡 Motivasi",  color:"#FBBF24" },
  { value:"doa",      label:"🤲 Doa",       color:"#60A5FA" },
  { value:"cinta",    label:"❤️ Cinta",     color:"#F472B6" },
  { value:"kenangan", label:"📸 Kenangan",  color:"#4ADE80" },
  { value:"harapan",  label:"🌟 Harapan",   color:"#A78BFA" },
];

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&display=swap');
@keyframes fadeUp { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
@keyframes spin { to{transform:rotate(360deg)} }
`;

export default function Notes() {
  const [notes, setNotes]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [content, setContent]   = useState("");
  const [author, setAuthor]     = useState("");
  const [type, setType]         = useState("motivasi");
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [filter, setFilter]     = useState("semua");
  const [expanded, setExpanded] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = STYLES;
    document.head.appendChild(el);
    fetchNotes();
    return () => document.head.removeChild(el);
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    const { data } = await supabase.from("notes").select("*").order("created_at", { ascending:false });
    if (data) setNotes(data);
    setLoading(false);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const ext  = file.name.split(".").pop();
    const path = `note-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("wedding-photos").upload(path, file, { upsert:true });
    if (!error) {
      const { data } = supabase.storage.from("wedding-photos").getPublicUrl(path);
      setPhotoUrl(data.publicUrl);
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    const note = {
      id: Date.now(),
      content: content.trim(),
      author: author.trim(),
      type,
      photo_url: photoUrl,
      created_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("notes").insert(note);
    if (!error) {
      setNotes([note, ...notes]);
      setContent(""); setAuthor(""); setPhotoUrl(""); setType("motivasi");
      if (fileRef.current) fileRef.current.value = "";
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    await supabase.from("notes").delete().eq("id", id);
    setNotes(notes.filter(n => n.id !== id));
  };

  const getTypeInfo = (t) => TYPES.find(x => x.value === t) || TYPES[0];

  const filtered = filter === "semua"
    ? notes
    : notes.filter(n => n.type === filter);

  const withPhoto  = notes.filter(n => n.photo_url).length;
  const inp = {
    width:"100%", padding:"12px 14px", borderRadius:12,
    background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
    color:"white", fontSize:"0.88rem", outline:"none", boxSizing:"border-box",
    fontFamily:"'Inter',sans-serif",
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#0F172A",
      fontFamily:"'Inter',sans-serif", maxWidth:"100vw", overflow:"hidden" }}>
      <Sidebar />
      <main style={{ flex:1, minWidth:0, width:0,
        padding:"68px 14px 32px", overflowX:"hidden", boxSizing:"border-box" }}>

        {/* Header */}
        <div style={{ marginBottom:20 }}>
          <p style={{ color:gold, fontSize:"0.6rem", letterSpacing:"0.3em",
            textTransform:"uppercase", margin:"0 0 4px" }}>Perjalanan Cinta</p>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2rem",
            fontWeight:600, color:"white", margin:0 }}>Catatan & Galeri</h1>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr",
          gap:8, marginBottom:16 }}>
          {[
            { label:"Total Catatan", val:notes.length,  color:gold },
            { label:"Dengan Foto",   val:withPhoto,     color:"#4ADE80" },
            { label:"Kategori",      val:TYPES.length,  color:"#A78BFA" },
          ].map(s => (
            <div key={s.label} style={{ padding:"12px 10px", borderRadius:14, textAlign:"center",
              background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)" }}>
              <p style={{ fontSize:"1.4rem", fontWeight:700, color:s.color, margin:0 }}>{s.val}</p>
              <p style={{ fontSize:"0.6rem", color:"rgba(255,255,255,0.3)", marginTop:3 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Form Tambah */}
        <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)",
          borderRadius:18, padding:"18px", marginBottom:16, animation:"fadeUp 0.6s ease both" }}>
          <p style={{ color:gold, fontSize:"0.65rem", letterSpacing:"0.2em",
            textTransform:"uppercase", margin:"0 0 14px" }}>✍ Tulis Catatan</p>

          {/* Tipe */}
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
            {TYPES.map(t => (
              <button key={t.value} onClick={() => setType(t.value)}
                style={{ padding:"6px 12px", borderRadius:99, fontSize:"0.72rem",
                  border:`1px solid ${type===t.value ? t.color : "rgba(255,255,255,0.08)"}`,
                  background:type===t.value ? `${t.color}18` : "rgba(255,255,255,0.03)",
                  color:type===t.value ? t.color : "rgba(255,255,255,0.35)",
                  cursor:"pointer" }}>{t.label}</button>
            ))}
          </div>

          <textarea
            placeholder="Tulis kata-kata motivasi, doa, atau kenangan indah..." value={content}
            onChange={e => setContent(e.target.value)} rows={4}
            style={{ ...inp, resize:"none", marginBottom:10 }} />

          <input placeholder="Nama penulis (opsional)" value={author}
            onChange={e => setAuthor(e.target.value)}
            style={{ ...inp, marginBottom:10 }} />

          {/* Upload foto */}
          <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:14 }}>
            <label style={{ flex:1, padding:"10px 14px", borderRadius:10, cursor:"pointer",
              background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)",
              color:"rgba(255,255,255,0.4)", fontSize:"0.82rem", textAlign:"center",
              display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
              {uploading ? (
                <>
                  <div style={{ width:14, height:14, borderRadius:"50%", border:`2px solid ${gold}`,
                    borderTopColor:"transparent", animation:"spin 0.8s linear infinite" }} />
                  Mengupload...
                </>
              ) : photoUrl ? "✓ Foto terpilih" : "📷 Tambah Foto"}
              <input ref={fileRef} type="file" accept="image/*"
                onChange={handleUpload} style={{ display:"none" }} />
            </label>
            {photoUrl && (
              <div style={{ position:"relative" }}>
                <img src={photoUrl} alt="Preview"
                  style={{ width:48, height:48, objectFit:"cover", borderRadius:10,
                    border:`2px solid rgba(196,164,90,0.4)` }} />
                <button onClick={() => setPhotoUrl("")}
                  style={{ position:"absolute", top:-6, right:-6, width:18, height:18,
                    borderRadius:"50%", background:"#EF4444", border:"none",
                    color:"white", fontSize:"0.65rem", cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
              </div>
            )}
          </div>

          <button onClick={handleSave} disabled={saving || !content.trim()}
            style={{ width:"100%", padding:"13px", borderRadius:12, border:"none",
              background:saving||!content.trim() ? "rgba(196,164,90,0.3)"
                : `linear-gradient(135deg,${gold},${goldLight})`,
              color:"#0F172A", fontWeight:700, fontSize:"0.9rem",
              cursor:saving||!content.trim() ? "not-allowed" : "pointer",
              boxShadow:`0 6px 16px rgba(196,164,90,0.25)` }}>
            {saving ? "Menyimpan..." : "✦ Simpan Catatan"}
          </button>
        </div>

        {/* Filter */}
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>
          <button onClick={() => setFilter("semua")}
            style={{ padding:"7px 14px", borderRadius:99, fontSize:"0.72rem",
              border:`1px solid ${filter==="semua" ? gold : "rgba(255,255,255,0.08)"}`,
              background:filter==="semua" ? "rgba(196,164,90,0.12)" : "rgba(255,255,255,0.03)",
              color:filter==="semua" ? gold : "rgba(255,255,255,0.35)", cursor:"pointer" }}>
            Semua ({notes.length})
          </button>
          {TYPES.map(t => (
            <button key={t.value} onClick={() => setFilter(t.value)}
              style={{ padding:"7px 14px", borderRadius:99, fontSize:"0.72rem",
                border:`1px solid ${filter===t.value ? t.color : "rgba(255,255,255,0.08)"}`,
                background:filter===t.value ? `${t.color}18` : "rgba(255,255,255,0.03)",
                color:filter===t.value ? t.color : "rgba(255,255,255,0.3)", cursor:"pointer" }}>
              {t.label} ({notes.filter(n=>n.type===t.value).length})
            </button>
          ))}
        </div>

        {/* Notes List */}
        {loading ? (
          <div style={{ textAlign:"center", padding:"48px", color:"rgba(255,255,255,0.3)" }}>
            <div style={{ width:28, height:28, borderRadius:"50%", border:`2px solid ${gold}`,
              borderTopColor:"transparent", animation:"spin 0.8s linear infinite",
              margin:"0 auto 12px" }} />
            Memuat catatan...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"48px 0" }}>
            <p style={{ fontSize:"3rem", marginBottom:8 }}>📝</p>
            <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.88rem" }}>
              Belum ada catatan. Tulis yang pertama!
            </p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {filtered.map((note, i) => {
              const t = getTypeInfo(note.type);
              const isOpen = expanded === note.id;
              return (
                <div key={note.id}
                  style={{ background:"rgba(255,255,255,0.03)",
                    border:`1px solid rgba(255,255,255,0.07)`,
                    borderRadius:16, overflow:"hidden",
                    animation:`fadeUp 0.4s ${i*0.04}s ease both` }}>

                  {/* Foto */}
                  {note.photo_url && (
                    <div style={{ position:"relative", cursor:"pointer" }}
                      onClick={() => setExpanded(isOpen ? null : note.id)}>
                      <img src={note.photo_url} alt="Foto catatan"
                        style={{ width:"100%", height:isOpen?240:160,
                          objectFit:"cover", display:"block",
                          transition:"height 0.4s ease" }} />
                      <div style={{ position:"absolute", inset:0,
                        background:"linear-gradient(to bottom,transparent 40%,rgba(15,23,42,0.8))" }} />
                      <div style={{ position:"absolute", top:10, left:12 }}>
                        <span style={{ fontSize:"0.65rem", padding:"3px 10px", borderRadius:99,
                          background:`${t.color}25`, border:`1px solid ${t.color}40`,
                          color:t.color }}>{t.label}</span>
                      </div>
                    </div>
                  )}

                  <div style={{ padding:"14px 16px" }}>
                    {!note.photo_url && (
                      <div style={{ marginBottom:8 }}>
                        <span style={{ fontSize:"0.65rem", padding:"3px 10px", borderRadius:99,
                          background:`${t.color}18`, border:`1px solid ${t.color}30`,
                          color:t.color }}>{t.label}</span>
                      </div>
                    )}

                    <p style={{ color:"rgba(255,255,255,0.85)", fontSize:"0.88rem",
                      lineHeight:1.75, fontStyle:"italic", margin:"0 0 10px",
                      display:isOpen?"block":"-webkit-box",
                      WebkitLineClamp:isOpen?999:3,
                      WebkitBoxOrient:"vertical",
                      overflow:"hidden" }}>
                      "{note.content}"
                    </p>

                    <div style={{ display:"flex", justifyContent:"space-between",
                      alignItems:"center" }}>
                      <div>
                        {note.author && (
                          <p style={{ color:gold, fontSize:"0.72rem",
                            fontWeight:600, margin:0 }}>— {note.author}</p>
                        )}
                        <p style={{ color:"rgba(255,255,255,0.2)", fontSize:"0.62rem", margin:"2px 0 0" }}>
                          {new Date(note.created_at).toLocaleDateString("id-ID",
                            {day:"numeric",month:"long",year:"numeric"})}
                        </p>
                      </div>
                      <div style={{ display:"flex", gap:6 }}>
                        {note.content.length > 100 && (
                          <button onClick={() => setExpanded(isOpen ? null : note.id)}
                            style={{ padding:"5px 10px", borderRadius:8, border:"none",
                              background:"rgba(255,255,255,0.06)",
                              color:"rgba(255,255,255,0.4)", fontSize:"0.72rem", cursor:"pointer" }}>
                            {isOpen ? "Tutup" : "Baca"}
                          </button>
                        )}
                        <button onClick={() => handleDelete(note.id)}
                          style={{ padding:"5px 8px", borderRadius:8, border:"none",
                            background:"rgba(239,68,68,0.08)",
                            color:"rgba(239,68,68,0.6)", fontSize:"0.72rem", cursor:"pointer" }}>✕</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

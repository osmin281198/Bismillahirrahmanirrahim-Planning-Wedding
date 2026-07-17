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
@keyframes slideIn { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
`;

export default function Notes() {
  const [notes, setNotes]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [content, setContent]     = useState("");
  const [author, setAuthor]       = useState("");
  const [type, setType]           = useState("motivasi");
  const [photoUrl, setPhotoUrl]   = useState("");
  const [inGallery, setInGallery] = useState(true); // ✅ default masuk galeri
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [filter, setFilter]       = useState("semua");
  const [expanded, setExpanded]   = useState(null);

  // ✅ State edit
  const [editId, setEditId]             = useState(null);
  const [editContent, setEditContent]   = useState("");
  const [editAuthor, setEditAuthor]     = useState("");
  const [editType, setEditType]         = useState("motivasi");
  const [editPhoto, setEditPhoto]       = useState("");
  const [editInGallery, setEditInGallery] = useState(true); // ✅
  const [editUploading, setEditUploading] = useState(false);
  const [editSaving, setEditSaving]     = useState(false);

  // ✅ Toggle cepat per-kartu
  const [togglingId, setTogglingId] = useState(null);

  const fileRef     = useRef();
  const editFileRef = useRef();

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

  const handleUpload = async (e, isEdit=false) => {
    const file = e.target.files[0];
    if (!file) return;
    isEdit ? setEditUploading(true) : setUploading(true);
    try {
      const ext  = file.name.split(".").pop();
      const path = `note-${Date.now()}.${ext}`;
      const { data: upData, error: upErr } = await supabase.storage
        .from("wedding-photos")
        .upload(path, file, { upsert:true, cacheControl:"3600" });
      if (upErr) {
        console.error("Upload error:", upErr.message);
        alert("Gagal upload: " + upErr.message);
      } else {
        const { data: urlData } = supabase.storage
          .from("wedding-photos")
          .getPublicUrl(path);
        console.log("Upload OK:", urlData.publicUrl);
        if (isEdit) setEditPhoto(urlData.publicUrl);
        else setPhotoUrl(urlData.publicUrl);
      }
    } catch(err) {
      console.error("Upload exception:", err);
      alert("Error: " + err.message);
    }
    isEdit ? setEditUploading(false) : setUploading(false);
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    const note = {
      id: Date.now(), content: content.trim(), author: author.trim(),
      type, photo_url: photoUrl, in_gallery: inGallery, // ✅
      created_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("notes").insert(note);
    if (!error) {
      setNotes([note, ...notes]);
      setContent(""); setAuthor(""); setPhotoUrl(""); setType("motivasi"); setInGallery(true);
      if (fileRef.current) fileRef.current.value = "";
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    await supabase.from("notes").delete().eq("id", id);
    setNotes(notes.filter(n => n.id !== id));
    if (editId === id) setEditId(null);
  };

  // ✅ Buka modal edit
  const openEdit = (note) => {
    setEditId(note.id);
    setEditContent(note.content);
    setEditAuthor(note.author||"");
    setEditType(note.type||"motivasi");
    setEditPhoto(note.photo_url||"");
    setEditInGallery(note.in_gallery !== false);
  };

  // ✅ Simpan edit
  const handleEditSave = async () => {
    if (!editContent.trim()) return;
    setEditSaving(true);
    const updates = {
      content: editContent.trim(),
      author:  editAuthor.trim(),
      type:    editType,
      photo_url: editPhoto,
      in_gallery: editInGallery, // ✅
    };
    const { error } = await supabase.from("notes").update(updates).eq("id", editId);
    if (!error) {
      setNotes(notes.map(n => n.id === editId ? { ...n, ...updates } : n));
      setEditId(null);
    }
    setEditSaving(false);
  };

  // ✅ Toggle cepat langsung dari kartu
  const handleToggleGallery = async (note) => {
    const nextValue = !(note.in_gallery !== false);
    setTogglingId(note.id);
    const { error } = await supabase.from("notes").update({ in_gallery: nextValue }).eq("id", note.id);
    if (!error) {
      setNotes(notes.map(n => n.id === note.id ? { ...n, in_gallery: nextValue } : n));
    }
    setTogglingId(null);
  };

  const getTypeInfo = (t) => TYPES.find(x => x.value === t) || TYPES[0];

  const filtered = filter === "semua" ? notes
    : filter === "galeri" ? notes.filter(n => n.in_gallery !== false)
    : notes.filter(n => n.type === filter);
  const withPhoto = notes.filter(n => n.photo_url).length;
  const inGalleryCount = notes.filter(n => n.in_gallery !== false).length; // ✅

  const inp = {
    width:"100%", padding:"12px 14px", borderRadius:12,
    background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
    color:"white", fontSize:"0.88rem", outline:"none", boxSizing:"border-box",
    fontFamily:"'Inter',sans-serif",
  };

  // ✅ Style checkbox galeri (dipakai di form tambah & modal edit)
  const galleryCheckbox = (checked, onChange) => (
    <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer",
      padding:"10px 12px", borderRadius:10,
      background: checked ? "rgba(196,164,90,0.08)" : "rgba(255,255,255,0.03)",
      border:`1px solid ${checked ? "rgba(196,164,90,0.3)" : "rgba(255,255,255,0.08)"}` }}>
      <input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)}
        style={{ width:16, height:16, accentColor:gold, cursor:"pointer" }} />
      <span style={{ fontSize:"0.8rem", color: checked ? gold : "rgba(255,255,255,0.4)" }}>
        🖼️ Tampilkan di Galeri Undangan
      </span>
    </label>
  );

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#0F172A",
      fontFamily:"'Inter',sans-serif", maxWidth:"100vw", overflow:"hidden" }}>
      <Sidebar />

      {/* ✅ Modal Edit */}
      {editId && (
        <div style={{ position:"fixed", inset:0, zIndex:100,
          background:"rgba(0,0,0,0.7)", backdropFilter:"blur(6px)",
          display:"flex", alignItems:"flex-end", justifyContent:"center" }}
          onClick={e => { if(e.target===e.currentTarget) setEditId(null); }}>
          <div style={{ width:"100%", maxWidth:520, background:"#1E293B",
            borderRadius:"24px 24px 0 0", padding:"24px 20px 40px",
            border:"1px solid rgba(196,164,90,0.2)",
            boxShadow:"0 -20px 60px rgba(0,0,0,0.5)",
            animation:"slideIn 0.3s ease both" }}>

            <div style={{ width:40, height:4, borderRadius:99,
              background:"rgba(255,255,255,0.15)", margin:"0 auto 20px" }} />

            <p style={{ color:gold, fontSize:"0.65rem", letterSpacing:"0.2em",
              textTransform:"uppercase", margin:"0 0 16px" }}>✎ Edit Catatan</p>

            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
              {TYPES.map(t => (
                <button key={t.value} onClick={() => setEditType(t.value)}
                  style={{ padding:"5px 10px", borderRadius:99, fontSize:"0.7rem",
                    border:`1px solid ${editType===t.value ? t.color : "rgba(255,255,255,0.08)"}`,
                    background:editType===t.value ? `${t.color}18` : "rgba(255,255,255,0.03)",
                    color:editType===t.value ? t.color : "rgba(255,255,255,0.35)",
                    cursor:"pointer" }}>{t.label}</button>
              ))}
            </div>

            <textarea value={editContent} onChange={e=>setEditContent(e.target.value)}
              rows={4} style={{ ...inp, resize:"none", marginBottom:10 }}
              placeholder="Isi catatan..." />

            <input value={editAuthor} onChange={e=>setEditAuthor(e.target.value)}
              style={{ ...inp, marginBottom:10 }} placeholder="Nama penulis (opsional)" />

            <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:12 }}>
              <label style={{ flex:1, padding:"10px 14px", borderRadius:10, cursor:"pointer",
                background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)",
                color:"rgba(255,255,255,0.45)", fontSize:"0.82rem",
                display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                {editUploading ? (
                  <>
                    <div style={{ width:14, height:14, borderRadius:"50%",
                      border:`2px solid ${gold}`, borderTopColor:"transparent",
                      animation:"spin 0.8s linear infinite" }} />
                    Mengupload...
                  </>
                ) : editPhoto ? "🔄 Ganti Foto" : "📷 Tambah Foto"}
                <input ref={editFileRef} type="file" accept="image/*"
                  onChange={e=>handleUpload(e,true)} style={{ display:"none" }} />
              </label>
              {editPhoto && (
                <div style={{ position:"relative" }}>
                  <img src={editPhoto} alt="Preview"
                    style={{ width:52, height:52, objectFit:"cover", borderRadius:10,
                      border:`2px solid rgba(196,164,90,0.4)` }} />
                  <button onClick={() => setEditPhoto("")}
                    style={{ position:"absolute", top:-6, right:-6, width:18, height:18,
                      borderRadius:"50%", background:"#EF4444", border:"none",
                      color:"white", fontSize:"0.65rem", cursor:"pointer",
                      display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                </div>
              )}
            </div>

            {/* ✅ Checklist galeri di modal edit */}
            <div style={{ marginBottom:16 }}>
              {galleryCheckbox(editInGallery, setEditInGallery)}
            </div>

            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => setEditId(null)}
                style={{ flex:1, padding:"12px", borderRadius:12, border:"1px solid rgba(255,255,255,0.1)",
                  background:"transparent", color:"rgba(255,255,255,0.5)",
                  fontSize:"0.88rem", cursor:"pointer" }}>Batal</button>
              <button onClick={handleEditSave} disabled={editSaving || !editContent.trim()}
                style={{ flex:2, padding:"12px", borderRadius:12, border:"none",
                  background:editSaving||!editContent.trim() ? "rgba(196,164,90,0.3)"
                    : `linear-gradient(135deg,${gold},${goldLight})`,
                  color:"#0F172A", fontWeight:700, fontSize:"0.88rem",
                  cursor:editSaving||!editContent.trim() ? "not-allowed" : "pointer" }}>
                {editSaving ? "Menyimpan..." : "✓ Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}

      <main style={{ flex:1, minWidth:0, width:0,
        padding:"68px 14px 32px", overflowX:"hidden", boxSizing:"border-box" }}>

        <div style={{ marginBottom:20 }}>
          <p style={{ color:gold, fontSize:"0.6rem", letterSpacing:"0.3em",
            textTransform:"uppercase", margin:"0 0 4px" }}>Perjalanan Cinta</p>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2rem",
            fontWeight:600, color:"white", margin:0 }}>Catatan & Galeri</h1>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr",
          gap:8, marginBottom:16 }}>
          {[
            { label:"Total", val:notes.length,  color:gold },
            { label:"Ada Foto", val:withPhoto,  color:"#4ADE80" },
            { label:"Di Galeri", val:inGalleryCount, color:"#60A5FA" }, // ✅
            { label:"Kategori", val:TYPES.length, color:"#A78BFA" },
          ].map(s => (
            <div key={s.label} style={{ padding:"12px 6px", borderRadius:14, textAlign:"center",
              background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)" }}>
              <p style={{ fontSize:"1.3rem", fontWeight:700, color:s.color, margin:0 }}>{s.val}</p>
              <p style={{ fontSize:"0.56rem", color:"rgba(255,255,255,0.3)", marginTop:3 }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)",
          borderRadius:18, padding:"18px", marginBottom:16 }}>
          <p style={{ color:gold, fontSize:"0.65rem", letterSpacing:"0.2em",
            textTransform:"uppercase", margin:"0 0 14px" }}>✍ Tulis Catatan Baru</p>

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

          <textarea placeholder="Tulis kata-kata motivasi, doa, atau kenangan indah..."
            value={content} onChange={e=>setContent(e.target.value)} rows={4}
            style={{ ...inp, resize:"none", marginBottom:10 }} />

          <input placeholder="Nama penulis (opsional)" value={author}
            onChange={e=>setAuthor(e.target.value)} style={{ ...inp, marginBottom:10 }} />

          <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:12 }}>
            <label style={{ flex:1, padding:"10px 14px", borderRadius:10, cursor:"pointer",
              background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)",
              color:"rgba(255,255,255,0.4)", fontSize:"0.82rem",
              display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
              {uploading ? (
                <>
                  <div style={{ width:14, height:14, borderRadius:"50%",
                    border:`2px solid ${gold}`, borderTopColor:"transparent",
                    animation:"spin 0.8s linear infinite" }} />
                  Mengupload...
                </>
              ) : photoUrl ? "✓ Foto terpilih" : "📷 Tambah Foto"}
              <input ref={fileRef} type="file" accept="image/*"
                onChange={e=>handleUpload(e,false)} style={{ display:"none" }} />
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

          {/* ✅ Checklist galeri di form tambah */}
          <div style={{ marginBottom:14 }}>
            {galleryCheckbox(inGallery, setInGallery)}
          </div>

          <button onClick={handleSave} disabled={saving || !content.trim()}
            style={{ width:"100%", padding:"13px", borderRadius:12, border:"none",
              background:saving||!content.trim() ? "rgba(196,164,90,0.3)"
                : `linear-gradient(135deg,${gold},${goldLight})`,
              color:"#0F172A", fontWeight:700, fontSize:"0.9rem",
              cursor:saving||!content.trim() ? "not-allowed" : "pointer" }}>
            {saving ? "Menyimpan..." : "✦ Simpan Catatan"}
          </button>
        </div>

        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>
          <button onClick={() => setFilter("semua")}
            style={{ padding:"7px 14px", borderRadius:99, fontSize:"0.72rem",
              border:`1px solid ${filter==="semua" ? gold : "rgba(255,255,255,0.08)"}`,
              background:filter==="semua" ? "rgba(196,164,90,0.12)" : "rgba(255,255,255,0.03)",
              color:filter==="semua" ? gold : "rgba(255,255,255,0.35)", cursor:"pointer" }}>
            Semua ({notes.length})
          </button>
          {/* ✅ Filter khusus galeri */}
          <button onClick={() => setFilter("galeri")}
            style={{ padding:"7px 14px", borderRadius:99, fontSize:"0.72rem",
              border:`1px solid ${filter==="galeri" ? "#60A5FA" : "rgba(255,255,255,0.08)"}`,
              background:filter==="galeri" ? "#60A5FA18" : "rgba(255,255,255,0.03)",
              color:filter==="galeri" ? "#60A5FA" : "rgba(255,255,255,0.35)", cursor:"pointer" }}>
            🖼️ Di Galeri ({inGalleryCount})
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
            <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.88rem" }}>Belum ada catatan.</p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {filtered.map((note, i) => {
              const t = getTypeInfo(note.type);
              const isOpen = expanded === note.id;
              const isInGallery = note.in_gallery !== false; // ✅ default true
              return (
                <div key={note.id}
                  style={{ background:"rgba(255,255,255,0.03)",
                    border:`1px solid rgba(255,255,255,0.07)`,
                    borderRadius:16, overflow:"hidden",
                    animation:`fadeUp 0.4s ${i*0.04}s ease both` }}>

                  {note.photo_url && (
                    <div style={{ position:"relative" }}>
                      <img src={note.photo_url} alt="Foto catatan"
                        style={{ width:"100%", height:isOpen?240:160,
                          objectFit:"cover", display:"block",
                          transition:"height 0.4s ease" }} />
                      <div style={{ position:"absolute", inset:0,
                        background:"linear-gradient(to bottom,transparent 40%,rgba(15,23,42,0.8))" }} />
                      <div style={{ position:"absolute", top:10, left:12, display:"flex", gap:6 }}>
                        <span style={{ fontSize:"0.65rem", padding:"3px 10px", borderRadius:99,
                          background:`${t.color}25`, border:`1px solid ${t.color}40`,
                          color:t.color }}>{t.label}</span>
                      </div>
                    </div>
                  )}

                  <div style={{ padding:"14px 16px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between",
                      alignItems:"flex-start", marginBottom:8, gap:8 }}>
                      {!note.photo_url ? (
                        <span style={{ fontSize:"0.65rem", padding:"3px 10px", borderRadius:99,
                          background:`${t.color}18`, border:`1px solid ${t.color}30`,
                          color:t.color }}>{t.label}</span>
                      ) : <span />}

                      {/* ✅ Checkbox toggle cepat masuk galeri */}
                      <label style={{ display:"flex", alignItems:"center", gap:5, cursor:"pointer",
                        padding:"3px 8px", borderRadius:99, flexShrink:0,
                        background: isInGallery ? "rgba(96,165,250,0.1)" : "rgba(255,255,255,0.04)",
                        border:`1px solid ${isInGallery ? "rgba(96,165,250,0.35)" : "rgba(255,255,255,0.08)"}` }}>
                        {togglingId === note.id ? (
                          <div style={{ width:11, height:11, borderRadius:"50%",
                            border:"2px solid #60A5FA", borderTopColor:"transparent",
                            animation:"spin 0.8s linear infinite" }} />
                        ) : (
                          <input type="checkbox" checked={isInGallery}
                            onChange={() => handleToggleGallery(note)}
                            style={{ width:12, height:12, accentColor:"#60A5FA", cursor:"pointer" }} />
                        )}
                        <span style={{ fontSize:"0.62rem",
                          color: isInGallery ? "#60A5FA" : "rgba(255,255,255,0.35)" }}>
                          Galeri
                        </span>
                      </label>
                    </div>

                    <p style={{ color:"rgba(255,255,255,0.85)", fontSize:"0.88rem",
                      lineHeight:1.75, fontStyle:"italic", margin:"0 0 10px",
                      display:isOpen?"block":"-webkit-box",
                      WebkitLineClamp:isOpen?999:3,
                      WebkitBoxOrient:"vertical",
                      overflow:"hidden" }}>
                      "{note.content}"
                    </p>

                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div>
                        {note.author && (
                          <p style={{ color:gold, fontSize:"0.72rem", fontWeight:600, margin:0 }}>
                            — {note.author}
                          </p>
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
                        <button onClick={() => openEdit(note)}
                          style={{ padding:"5px 10px", borderRadius:8, border:"none",
                            background:"rgba(196,164,90,0.1)",
                            border:`1px solid rgba(196,164,90,0.2)`,
                            color:gold, fontSize:"0.72rem", cursor:"pointer" }}>✎ Edit</button>
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

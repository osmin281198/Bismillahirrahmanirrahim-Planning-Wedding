import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Sidebar from "../components/Sidebar";

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&display=swap');
@keyframes fadeUp { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
`;

function Field({ label, value, onChange, type="text", placeholder="" }) {
  return (
    <div>
      <label style={{ display:"block", color:"rgba(255,255,255,0.35)", fontSize:"0.65rem",
        letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:8 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width:"100%", padding:"13px 16px", borderRadius:12, fontSize:"0.88rem",
          background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
          color:"white", outline:"none", boxSizing:"border-box", transition:"border-color 0.2s",
        }}
        onFocus={e => e.target.style.borderColor="rgba(196,164,90,0.4)"}
        onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.1)"}
      />
    </div>
  );
}

export default function Settings() {
  const [groom, setGroom]                   = useState("");
  const [bride, setBride]                   = useState("");
  const [groomFather, setGroomFather]       = useState("");
  const [groomMother, setGroomMother]       = useState("");
  const [brideFather, setBrideFather]       = useState("");
  const [brideMother, setBrideMother]       = useState("");
  const [weddingDate, setWeddingDate]       = useState("");
  const [weddingTime, setWeddingTime]       = useState("");
  const [weddingLocation, setWeddingLocation] = useState("");
  const [photoUrl, setPhotoUrl]             = useState("");
  const [uploading, setUploading]           = useState(false);
  const [saving, setSaving]                 = useState(false);
  const [saved, setSaved]                   = useState(false);
  const [loading, setLoading]               = useState(true);

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = STYLES;
    document.head.appendChild(el);
    fetchSettings();
    return () => document.head.removeChild(el);
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from("settings").select("*").eq("id",1).single();
    if (data) {
      setGroom(data.groom||""); setBride(data.bride||"");
      setGroomFather(data.groom_father||""); setGroomMother(data.groom_mother||"");
      setBrideFather(data.bride_father||""); setBrideMother(data.bride_mother||"");
      setWeddingDate(data.wedding_date||""); setWeddingTime(data.wedding_time||"");
      setWeddingLocation(data.wedding_location||""); setPhotoUrl(data.photo_url||"");
    }
    setLoading(false);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const ext  = file.name.split(".").pop();
    const path = `couple-photo.${ext}`;
    await supabase.storage.from("wedding-photos").upload(path, file, { upsert:true });
    const { data } = supabase.storage.from("wedding-photos").getPublicUrl(path);
    setPhotoUrl(data.publicUrl);
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await supabase.from("settings").update({
      groom, bride, groom_father:groomFather, groom_mother:groomMother,
      bride_father:brideFather, bride_mother:brideMother,
      wedding_date:weddingDate, wedding_time:weddingTime,
      wedding_location:weddingLocation, photo_url:photoUrl,
    }).eq("id",1);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const gold = "#C4A45A";
  const formatDateID = (d) => d ? new Date(d).toLocaleDateString("id-ID",{weekday:"long",year:"numeric",month:"long",day:"numeric"}) : "";

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#0F172A", fontFamily:"'Inter',sans-serif" }}>
      <Sidebar />
      <main style={{ flex:1, padding:"80px 20px 40px", maxWidth:720, margin:"0 auto" }}
        className="md:pt-8">

        <div style={{ marginBottom:32, animation:"fadeUp 0.6s ease both" }}>
          <p style={{ color:gold, fontSize:"0.6rem", letterSpacing:"0.3em",
            textTransform:"uppercase", marginBottom:6 }}>Konfigurasi</p>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2.2rem",
            fontWeight:600, color:"white" }}>Pengaturan</h1>
        </div>

        {loading ? (
          <div style={{ textAlign:"center", padding:"48px", color:"rgba(255,255,255,0.3)" }}>Memuat...</div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

            {/* Foto */}
            <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)",
              borderRadius:20, padding:"24px", animation:"fadeUp 0.6s 0.1s ease both" }}>
              <p style={{ color:gold, fontSize:"0.7rem", letterSpacing:"0.2em",
                textTransform:"uppercase", marginBottom:16 }}>Foto Pasangan</p>
              <div style={{ display:"flex", gap:20, alignItems:"center", flexWrap:"wrap" }}>
                {photoUrl ? (
                  <img src={photoUrl} alt="Foto" style={{ width:80, height:80,
                    objectFit:"cover", borderRadius:16,
                    border:"2px solid rgba(196,164,90,0.3)" }} />
                ) : (
                  <div style={{ width:80, height:80, borderRadius:16,
                    background:"rgba(196,164,90,0.08)", border:"2px dashed rgba(196,164,90,0.2)",
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2rem" }}>💑</div>
                )}
                <label style={{
                  padding:"11px 20px", borderRadius:12, cursor:"pointer",
                  background:"rgba(196,164,90,0.1)", border:"1px solid rgba(196,164,90,0.2)",
                  color:gold, fontSize:"0.82rem", fontWeight:600,
                }}>
                  {uploading ? "Mengupload..." : "📷 Ganti Foto"}
                  <input type="file" accept="image/*" onChange={handleUpload} style={{ display:"none" }} />
                </label>
              </div>
            </div>

            {/* Mempelai */}
            <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)",
              borderRadius:20, padding:"24px", animation:"fadeUp 0.6s 0.15s ease both" }}>
              <p style={{ color:gold, fontSize:"0.7rem", letterSpacing:"0.2em",
                textTransform:"uppercase", marginBottom:16 }}>Data Mempelai</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <Field label="Nama Mempelai Pria" value={groom} onChange={setGroom} placeholder="Nama lengkap" />
                <Field label="Nama Mempelai Wanita" value={bride} onChange={setBride} placeholder="Nama lengkap" />
                <Field label="Ayah Mempelai Pria" value={groomFather} onChange={setGroomFather} />
                <Field label="Ibu Mempelai Pria" value={groomMother} onChange={setGroomMother} />
                <Field label="Ayah Mempelai Wanita" value={brideFather} onChange={setBrideFather} />
                <Field label="Ibu Mempelai Wanita" value={brideMother} onChange={setBrideMother} />
              </div>
            </div>

            {/* Acara */}
            <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)",
              borderRadius:20, padding:"24px", animation:"fadeUp 0.6s 0.2s ease both" }}>
              <p style={{ color:gold, fontSize:"0.7rem", letterSpacing:"0.2em",
                textTransform:"uppercase", marginBottom:16 }}>Detail Acara</p>
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <Field label="Tanggal Pernikahan" value={weddingDate} onChange={setWeddingDate} type="date" />
                {weddingDate && (
                  <div style={{ padding:"10px 16px", borderRadius:10,
                    background:"rgba(196,164,90,0.08)", border:"1px solid rgba(196,164,90,0.15)" }}>
                    <p style={{ color:gold, fontSize:"0.82rem" }}>📅 {formatDateID(weddingDate)}</p>
                  </div>
                )}
                <Field label="Waktu" value={weddingTime} onChange={setWeddingTime} type="time" />
                <Field label="Lokasi" value={weddingLocation} onChange={setWeddingLocation} placeholder="Nama gedung / alamat" />
              </div>
            </div>

            {/* Save */}
            <button onClick={handleSave} disabled={saving}
              style={{
                padding:"16px", borderRadius:14, border:"none",
                background: saved ? "linear-gradient(135deg,#4ADE80,#22C55E)"
                  : `linear-gradient(135deg,${gold},#E8CC8A)`,
                color:"#0F172A", fontWeight:700, fontSize:"0.92rem",
                cursor: saving ? "not-allowed" : "pointer",
                transition:"all 0.3s",
                boxShadow: `0 8px 24px rgba(196,164,90,0.25)`,
                animation:"fadeUp 0.6s 0.25s ease both",
              }}>
              {saved ? "✓ Tersimpan!" : saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Sidebar from "../components/Sidebar";

export default function Settings() {
  const [groom, setGroom]             = useState("");
  const [bride, setBride]             = useState("");
  const [groomFather, setGroomFather] = useState("");
  const [groomMother, setGroomMother] = useState("");
  const [brideFather, setBrideFather] = useState("");
  const [brideMother, setBrideMother] = useState("");
  const [photoUrl, setPhotoUrl]       = useState("");
  const [uploading, setUploading]     = useState(false);
  const [loading, setLoading]         = useState(false);
  const [saved, setSaved]             = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase.from("settings").select("*").eq("id", 1).single();
    if (!error && data) {
      setGroom(data.groom || "");
      setBride(data.bride || "");
      setGroomFather(data.groom_father || "");
      setGroomMother(data.groom_mother || "");
      setBrideFather(data.bride_father || "");
      setBrideMother(data.bride_mother || "");
      setPhotoUrl(data.photo_url || "");
    }
  };

  const uploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Maksimal 5MB"); return; }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const { error: uploadError } = await supabase.storage.from("wedding-photos").upload(`couple-photo.${ext}`, file, { upsert: true });
    if (uploadError) { alert("Gagal upload: " + uploadError.message); setUploading(false); return; }
    const { data } = supabase.storage.from("wedding-photos").getPublicUrl(`couple-photo.${ext}`);
    setPhotoUrl(data.publicUrl);
    await supabase.from("settings").update({ photo_url: data.publicUrl }).eq("id", 1);
    setUploading(false);
  };

  const save = async () => {
    setLoading(true);
    const { error } = await supabase.from("settings").update({
      groom, bride, photo_url: photoUrl,
      groom_father: groomFather, groom_mother: groomMother,
      bride_father: brideFather, bride_mother: brideMother,
    }).eq("id", 1);
    if (!error) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
    setLoading(false);
  };

  const Field = ({ label, value, onChange, placeholder }) => (
    <div>
      <label className="block text-xs text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>
      <input className="border border-slate-200 p-3 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
        placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );

  return (
    <div className="flex min-h-screen" style={{ background: "#F0F9FF", fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />
      <main className="flex-1 pt-16 md:pt-0 p-4 md:p-8 overflow-x-hidden">
        <div className="mb-5">
          <p className="text-sky-500 text-xs uppercase tracking-widest mb-1">Konfigurasi</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl md:text-4xl font-semibold text-sky-900">Pengaturan Wedding</h1>
        </div>

        <div className="max-w-lg space-y-4">

          {/* Foto */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-sky-100">
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-4">Foto Pasangan</p>
            <div className="flex justify-center mb-4">
              {photoUrl ? (
                <img src={photoUrl} alt="Foto" className="w-36 h-36 object-cover rounded-2xl shadow-md border-4 border-sky-100" />
              ) : (
                <div className="w-36 h-36 rounded-2xl border-2 border-dashed border-sky-200 flex flex-col items-center justify-center text-slate-400" style={{ background: "#F0F9FF" }}>
                  <span className="text-4xl mb-2">📸</span>
                  <span className="text-xs">Belum ada foto</span>
                </div>
              )}
            </div>
            <label className="block cursor-pointer">
              <div className="w-full py-3 rounded-xl text-center text-sm font-medium border-2 border-dashed border-sky-300 text-sky-600 hover:bg-sky-50 transition">
                {uploading ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />Mengupload...</span> : "📁 Pilih Foto Pasangan"}
              </div>
              <input type="file" accept="image/*" onChange={uploadPhoto} className="hidden" disabled={uploading} />
            </label>
            <p className="text-xs text-slate-400 text-center mt-2">Format: JPG, PNG. Maksimal 5MB.</p>
          </div>

          {/* Mempelai Pria */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-sky-100">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🤵</span>
              <p className="text-xs text-slate-400 uppercase tracking-widest">Mempelai Pria</p>
            </div>
            <div className="space-y-3">
              <Field label="Nama Lengkap" value={groom} onChange={setGroom} placeholder="Nama lengkap pria" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Nama Ayah" value={groomFather} onChange={setGroomFather} placeholder="Nama ayah pria" />
                <Field label="Nama Ibu" value={groomMother} onChange={setGroomMother} placeholder="Nama ibu pria" />
              </div>
            </div>
          </div>

          {/* Mempelai Wanita */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-sky-100">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">👰</span>
              <p className="text-xs text-slate-400 uppercase tracking-widest">Mempelai Wanita</p>
            </div>
            <div className="space-y-3">
              <Field label="Nama Lengkap" value={bride} onChange={setBride} placeholder="Nama lengkap wanita" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Nama Ayah" value={brideFather} onChange={setBrideFather} placeholder="Nama ayah wanita" />
                <Field label="Nama Ibu" value={brideMother} onChange={setBrideMother} placeholder="Nama ibu wanita" />
              </div>
            </div>
          </div>

          <button onClick={save} disabled={loading || uploading}
            className="w-full py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition"
            style={{ background: "linear-gradient(90deg, #0284C7, #38BDF8)" }}>
            {loading ? "Menyimpan..." : "Simpan Semua Perubahan"}
          </button>

          {saved && (
            <div className="bg-sky-50 border border-sky-200 text-sky-700 text-sm text-center py-2 rounded-xl">
              ✓ Semua data berhasil disimpan
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

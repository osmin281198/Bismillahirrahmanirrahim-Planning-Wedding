import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Sidebar from "../components/Sidebar";
import { SUPER_EMAIL, GRANTABLE_PAGES } from "../lib/roles";

const gold      = "#C4A45A";
const goldLight = "#E8CC8A";

export default function Users() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState({ email:"", role_label:"admin", pages:[] });
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => { fetchRows(); }, []);

  const fetchRows = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("user_permissions").select("*").order("created_at");
    if (!error && data) setRows(data);
    setLoading(false);
  };

  const openNew  = () => { setForm({ email:"", role_label:"admin", pages:[] }); setEditing("new"); setError(""); };
  const openEdit = (row) => { setForm({ email:row.email, role_label:row.role_label, pages:row.pages||[] }); setEditing(row.email); setError(""); };

  const togglePage = (key) => {
    setForm(f => ({ ...f, pages: f.pages.includes(key) ? f.pages.filter(p => p !== key) : [...f.pages, key] }));
  };

  const handleSave = async () => {
    setError("");
    const email = form.email.trim().toLowerCase();
    if (!email) { setError("Email wajib diisi."); return; }
    if (email === SUPER_EMAIL) { setError("Email ini sudah punya akses penuh secara otomatis."); return; }
    if (form.pages.length === 0) { setError("Pilih minimal satu halaman."); return; }

    setSaving(true);
    const payload = {
      email, role_label: form.role_label.trim() || "admin",
      pages: form.pages, updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("user_permissions").upsert(payload, { onConflict:"email" });
    setSaving(false);
    if (error) { setError("Gagal menyimpan: " + error.message); return; }
    setEditing(null);
    fetchRows();
  };

  const handleDelete = async (email) => {
    if (!confirm(`Cabut akses untuk ${email}?`)) return;
    await supabase.from("user_permissions").delete().eq("email", email);
    fetchRows();
  };

  const cardStyle = { background:"rgba(255,255,255,0.03)", borderRadius:16, border:"1px solid rgba(196,164,90,0.12)" };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"linear-gradient(180deg,#0F172A,#1E293B)" }}>
      <Sidebar />
      <main className="pt-16 md:pt-0" style={{ flex:1, padding:"24px 20px 60px", maxWidth:640, margin:"0 auto", width:"100%" }}>
        <p style={{ color:gold, fontSize:"0.65rem", letterSpacing:"0.25em", textTransform:"uppercase", marginBottom:6 }}>Akses & Keamanan</p>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2rem", fontWeight:600, color:"white", marginBottom:20 }}>Kelola User</h1>

        <div style={{ ...cardStyle, padding:"16px 18px", marginBottom:16, display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:"1.4rem" }}>👑</span>
          <div>
            <p style={{ color:"white", fontWeight:600, fontSize:"0.85rem", margin:0 }}>{SUPER_EMAIL}</p>
            <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.7rem", margin:0 }}>
              Admin utama · akses penuh ke semua halaman (tetap, tidak bisa diubah)
            </p>
          </div>
        </div>

        <button onClick={openNew} style={{
          width:"100%", padding:"12px", borderRadius:10, border:"none", cursor:"pointer",
          background:`linear-gradient(135deg,${gold},${goldLight})`, color:"#0F172A", fontWeight:700, marginBottom:20 }}>
          + Tambah User
        </button>

        {loading && <p style={{ color:"rgba(255,255,255,0.4)" }}>Memuat…</p>}

        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {rows.map(row => (
            <div key={row.email} style={{ ...cardStyle, padding:"14px 16px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
                <div style={{ minWidth:0 }}>
                  <p style={{ color:"white", fontWeight:600, fontSize:"0.85rem", margin:0,
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{row.email}</p>
                  <p style={{ color:gold, fontSize:"0.68rem", textTransform:"uppercase", letterSpacing:"0.08em", margin:"2px 0 8px" }}>{row.role_label}</p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {(row.pages || []).map(p => (
                      <span key={p} style={{ fontSize:"0.65rem", padding:"3px 7px", borderRadius:6,
                        background:"rgba(196,164,90,0.1)", color:"rgba(255,255,255,0.6)", border:"1px solid rgba(196,164,90,0.15)" }}>{p}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:6, flexShrink:0 }}>
                  <button onClick={() => openEdit(row)} style={{ background:"none", border:"none", color:gold, fontSize:"0.72rem", cursor:"pointer" }}>Edit</button>
                  <button onClick={() => handleDelete(row.email)} style={{ background:"none", border:"none", color:"#F87171", fontSize:"0.72rem", cursor:"pointer" }}>Hapus</button>
                </div>
              </div>
            </div>
          ))}
          {!loading && rows.length === 0 && (
            <div style={{ ...cardStyle, padding:20, textAlign:"center", color:"rgba(255,255,255,0.4)", fontSize:"0.85rem" }}>
              Belum ada user lain. Tambahkan lewat tombol di atas.
            </div>
          )}
        </div>

        {editing && (
          <div onClick={() => setEditing(null)} style={{
            position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)",
            display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:50 }}>
            <div onClick={e => e.stopPropagation()} style={{
              width:"100%", maxWidth:480, background:"#1E293B", borderRadius:"20px 20px 0 0",
              padding:"24px 20px 28px", border:"1px solid rgba(196,164,90,0.15)", maxHeight:"88vh", overflowY:"auto" }}>
              <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.4rem", color:"white", marginBottom:18 }}>
                {editing === "new" ? "Tambah User" : "Edit Akses"}
              </h2>

              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <label style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.5)" }}>
                  Email
                  <input type="email" value={form.email} disabled={editing !== "new"}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    style={{ width:"100%", marginTop:6, padding:"11px 12px", borderRadius:10,
                      background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"white",
                      opacity: editing !== "new" ? 0.6 : 1 }} />
                </label>

                <label style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.5)" }}>
                  Label Peran <span style={{ opacity:0.6 }}>(bebas, cuma label — akses ditentukan halaman di bawah)</span>
                  <input value={form.role_label} onChange={e => setForm(f => ({ ...f, role_label: e.target.value }))}
                    placeholder="misal: admin, family, panitia"
                    style={{ width:"100%", marginTop:6, padding:"11px 12px", borderRadius:10,
                      background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"white" }} />
                </label>

                <div>
                  <p style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.5)", marginBottom:8 }}>Halaman yang boleh diakses</p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    {GRANTABLE_PAGES.map(p => (
                      <button key={p.key} type="button" onClick={() => togglePage(p.key)} style={{
                        padding:"7px 12px", borderRadius:8, cursor:"pointer", fontSize:"0.75rem",
                        border: form.pages.includes(p.key) ? `1.5px solid ${gold}` : "1.5px solid rgba(255,255,255,0.1)",
                        background: form.pages.includes(p.key) ? "rgba(196,164,90,0.15)" : "transparent",
                        color: form.pages.includes(p.key) ? gold : "rgba(255,255,255,0.5)" }}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {error && <p style={{ color:"#F87171", fontSize:"0.78rem", margin:0 }}>{error}</p>}

                <div style={{ background:"rgba(196,164,90,0.08)", border:"1px solid rgba(196,164,90,0.15)",
                  borderRadius:10, padding:"10px 12px", fontSize:"0.72rem", color:"rgba(255,255,255,0.55)" }}>
                  Ini cuma mengatur <b>akses halaman</b>. Akun login (email + password) untuk user baru tetap perlu dibuat
                  manual satu kali di Supabase Dashboard → Authentication → Add User, pakai email yang sama persis.
                </div>

                <div style={{ display:"flex", gap:10 }}>
                  <button onClick={() => setEditing(null)} style={{
                    flex:1, padding:12, borderRadius:10, border:"1px solid rgba(255,255,255,0.15)",
                    background:"transparent", color:"rgba(255,255,255,0.6)", cursor:"pointer" }}>Batal</button>
                  <button onClick={handleSave} disabled={saving} style={{
                    flex:1, padding:12, borderRadius:10, border:"none", cursor:"pointer",
                    background:`linear-gradient(135deg,${gold},${goldLight})`, color:"#0F172A", fontWeight:700 }}>
                    {saving ? "Menyimpan…" : "Simpan"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

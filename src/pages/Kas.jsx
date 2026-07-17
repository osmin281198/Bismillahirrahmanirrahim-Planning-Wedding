import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import Sidebar from "../components/Sidebar";

const gold        = "#C4A45A";
const goldLight   = "#E8CC8A";
const debitColor  = "#F87171";
const kreditColor = "#4ADE80";

const fmtRp = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&display=swap');
@keyframes fadeUp { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
`;

export default function Kas() {
  const [session, setSession]   = useState(null);
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [type, setType]           = useState("kredit");
  const [amount, setAmount]       = useState("");
  const [note, setNote]           = useState("");
  const [file, setFile]           = useState(null);
  const [preview, setPreview]     = useState("");
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState("");
  const fileRef = useRef();

  const [openProofId, setOpenProofId] = useState(null);
  const [proofUrls, setProofUrls]     = useState({});

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = STYLES;
    document.head.appendChild(el);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchItems(session.user.id);
    });

    return () => document.head.removeChild(el);
  }, []);

  const fetchItems = async (userId) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("kas_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (!error && data) setItems(data);
    setLoading(false);
  };

  const saldo       = items.reduce((s, t) => s + (t.type === "kredit" ? Number(t.amount) : -Number(t.amount)), 0);
  const totalKredit = items.filter(t => t.type === "kredit").reduce((s, t) => s + Number(t.amount), 0);
  const totalDebit  = items.filter(t => t.type === "debit").reduce((s, t) => s + Number(t.amount), 0);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const resetForm = () => {
    setType("kredit"); setAmount(""); setNote(""); setFile(null); setPreview(""); setFormError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError("");
    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0) { setFormError("Jumlah harus lebih dari 0."); return; }
    if (!file) { setFormError("Bukti transfer wajib dilampirkan."); return; }

    setSaving(true);
    try {
      const ext  = file.name.split(".").pop();
      const path = `${session.user.id}/${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage.from("kas-proofs").upload(path, file, { upsert: false });
      if (upErr) throw upErr;

      const { error: insErr } = await supabase.from("kas_transactions").insert({
        user_id: session.user.id, type, amount: amountNum, note: note.trim(), proof_url: path,
      });
      if (insErr) throw insErr;

      resetForm();
      setShowForm(false);
      fetchItems(session.user.id);
    } catch (err) {
      setFormError("Gagal menyimpan: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (t) => {
    if (!confirm("Hapus transaksi ini?")) return;
    await supabase.from("kas_transactions").delete().eq("id", t.id);
    await supabase.storage.from("kas-proofs").remove([t.proof_url]);
    fetchItems(session.user.id);
  };

  const toggleProof = async (t) => {
    if (openProofId === t.id) { setOpenProofId(null); return; }
    if (!proofUrls[t.id]) {
      const { data } = await supabase.storage.from("kas-proofs").createSignedUrl(t.proof_url, 3600);
      if (data) setProofUrls(prev => ({ ...prev, [t.id]: data.signedUrl }));
    }
    setOpenProofId(t.id);
  };

  const cardStyle = {
    background: "rgba(255,255,255,0.03)", borderRadius: 18,
    border: "1px solid rgba(196,164,90,0.12)",
  };

  // Mutasi saldo berjalan — diurutkan dari transaksi paling lama ke paling baru
  // supaya saldo terakumulasi dengan benar, lalu dibalik untuk ditampilkan (terbaru di atas)
  const mutasi = [...items]
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .reduce((acc, t) => {
      const prevSaldo = acc.length ? acc[acc.length - 1].saldo : 0;
      const rowSaldo = prevSaldo + (t.type === "kredit" ? Number(t.amount) : -Number(t.amount));
      acc.push({ ...t, saldo: rowSaldo });
      return acc;
    }, [])
    .reverse();

  const thStyle = {
    padding: "10px 12px", textAlign: "left", fontSize: "0.66rem",
    letterSpacing: "0.06em", textTransform: "uppercase",
    color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap",
  };
  const tdStyle = {
    padding: "10px 12px", fontSize: "0.78rem", color: "rgba(255,255,255,0.85)",
    whiteSpace: "nowrap",
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"linear-gradient(180deg,#0F172A,#1E293B)" }}>
      <Sidebar />
      <main className="pt-16 md:pt-0" style={{ flex:1, padding:"24px 20px 60px", maxWidth:640, margin:"0 auto", width:"100%" }}>
        <p style={{ color:gold, fontSize:"0.65rem", letterSpacing:"0.25em", textTransform:"uppercase", marginBottom:6 }}>Keuangan Pribadi</p>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2rem", fontWeight:600, color:"white", marginBottom:20 }}>Kas</h1>

        <div style={{ ...cardStyle, padding:"22px 20px", marginBottom:18,
          background:"linear-gradient(135deg, rgba(196,164,90,0.12), rgba(196,164,90,0.02))" }}>
          <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"0.7rem", letterSpacing:"0.1em", textTransform:"uppercase" }}>Saldo Saat Ini</p>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2.4rem", fontWeight:700,
            color: saldo < 0 ? debitColor : "white", margin:"6px 0 14px" }}>{fmtRp(saldo)}</p>
          <div style={{ display:"flex", gap:20, fontSize:"0.78rem", color:"rgba(255,255,255,0.6)" }}>
            <span>▲ Masuk <b style={{ color:kreditColor }}>{fmtRp(totalKredit)}</b></span>
            <span>▼ Keluar <b style={{ color:debitColor }}>{fmtRp(totalDebit)}</b></span>
          </div>
        </div>

        <button onClick={() => setShowForm(true)} style={{
          width:"100%", padding:"13px", borderRadius:12, border:"none", cursor:"pointer",
          background:`linear-gradient(135deg,${gold},${goldLight})`, color:"#0F172A",
          fontWeight:700, fontSize:"0.88rem", marginBottom:24,
          boxShadow:"0 8px 24px rgba(196,164,90,0.25)" }}>
          + Catat Transaksi
        </button>

        <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.72rem", letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:10 }}>Mutasi Saldo</p>

        {loading && <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.85rem" }}>Memuat…</p>}
        {!loading && items.length === 0 && (
          <div style={{ ...cardStyle, padding:20, textAlign:"center", color:"rgba(255,255,255,0.4)", fontSize:"0.85rem" }}>
            Belum ada transaksi. Catat transaksi pertama kamu — lampirkan bukti transfer.
          </div>
        )}

        {!loading && items.length > 0 && (
          <div style={{ ...cardStyle, overflowX:"auto", marginBottom:24 }}>
            <table style={{ width:"100%", borderCollapse:"collapse", minWidth:520 }}>
              <thead>
                <tr style={{ background:"rgba(196,164,90,0.08)" }}>
                  <th style={thStyle}>Tanggal</th>
                  <th style={thStyle}>Keterangan</th>
                  <th style={{ ...thStyle, textAlign:"right" }}>Debit</th>
                  <th style={{ ...thStyle, textAlign:"right" }}>Kredit</th>
                  <th style={{ ...thStyle, textAlign:"right" }}>Saldo</th>
                </tr>
              </thead>
              <tbody>
                {mutasi.map(t => (
                  <tr key={t.id} style={{ borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                    <td style={tdStyle}>
                      {new Date(t.created_at).toLocaleDateString("id-ID", { day:"2-digit", month:"short", year:"2-digit" })}
                    </td>
                    <td style={{ ...tdStyle, whiteSpace:"normal", maxWidth:160 }}>
                      {t.note || (t.type === "kredit" ? "Uang masuk" : "Uang keluar")}
                    </td>
                    <td style={{ ...tdStyle, textAlign:"right", color: debitColor }}>
                      {t.type === "debit" ? fmtRp(t.amount) : "—"}
                    </td>
                    <td style={{ ...tdStyle, textAlign:"right", color: kreditColor }}>
                      {t.type === "kredit" ? fmtRp(t.amount) : "—"}
                    </td>
                    <td style={{ ...tdStyle, textAlign:"right", fontWeight:700, color:"white" }}>
                      {fmtRp(t.saldo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.72rem", letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:10 }}>Detail Transaksi</p>

        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {items.map(t => (
            <div key={t.id} style={{ ...cardStyle, padding:"14px 16px", animation:"fadeUp 0.3s ease both" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{
                  fontSize:"0.62rem", fontWeight:700, padding:"4px 8px", borderRadius:6,
                  color: t.type === "kredit" ? kreditColor : debitColor,
                  background: t.type === "kredit" ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)",
                  border: `1px solid ${t.type === "kredit" ? "rgba(74,222,128,0.3)" : "rgba(248,113,113,0.3)"}`,
                }}>{t.type === "kredit" ? "MASUK" : "KELUAR"}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ color:"white", fontSize:"0.85rem", fontWeight:600, margin:0,
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {t.note || (t.type === "kredit" ? "Uang masuk" : "Uang keluar")}
                  </p>
                  <p style={{ color:"rgba(255,255,255,0.35)", fontSize:"0.68rem", margin:"2px 0 0" }}>
                    {new Date(t.created_at).toLocaleDateString("id-ID", { day:"numeric", month:"long", year:"numeric" })}
                  </p>
                </div>
                <p style={{ fontWeight:700, fontSize:"0.9rem", margin:0,
                  color: t.type === "kredit" ? kreditColor : debitColor }}>
                  {t.type === "debit" ? "-" : "+"}{fmtRp(t.amount)}
                </p>
              </div>
              <div style={{ display:"flex", gap:16, marginTop:10, paddingTop:10, borderTop:"1px dashed rgba(255,255,255,0.08)" }}>
                <button onClick={() => toggleProof(t)} style={{ background:"none", border:"none", color:gold, fontSize:"0.72rem", cursor:"pointer", padding:0 }}>
                  {openProofId === t.id ? "Sembunyikan bukti" : "Lihat bukti transfer"}
                </button>
                <button onClick={() => handleDelete(t)} style={{ background:"none", border:"none", color:debitColor, fontSize:"0.72rem", cursor:"pointer", padding:0 }}>
                  Hapus
                </button>
              </div>
              {openProofId === t.id && proofUrls[t.id] && (
                <img src={proofUrls[t.id]} alt="Bukti transfer" style={{ width:"100%", borderRadius:10, marginTop:10 }} />
              )}
            </div>
          ))}
        </div>

        {showForm && (
          <div onClick={() => setShowForm(false)} style={{
            position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)",
            display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:50 }}>
            <div onClick={e => e.stopPropagation()} style={{
              width:"100%", maxWidth:480, background:"#1E293B", borderRadius:"20px 20px 0 0",
              padding:"24px 20px 28px", border:"1px solid rgba(196,164,90,0.15)",
              maxHeight:"88vh", overflowY:"auto" }}>
              <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.4rem", color:"white", marginBottom:18 }}>Catat Transaksi</h2>
              <form onSubmit={handleSave} style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <div style={{ display:"flex", gap:8 }}>
                  <button type="button" onClick={() => setType("kredit")} style={{
                    flex:1, padding:10, borderRadius:10, cursor:"pointer",
                    border: type === "kredit" ? `1.5px solid ${kreditColor}` : "1.5px solid rgba(255,255,255,0.1)",
                    background: type === "kredit" ? "rgba(74,222,128,0.1)" : "transparent",
                    color: type === "kredit" ? kreditColor : "rgba(255,255,255,0.5)", fontWeight:600, fontSize:"0.82rem" }}>
                    Uang Masuk
                  </button>
                  <button type="button" onClick={() => setType("debit")} style={{
                    flex:1, padding:10, borderRadius:10, cursor:"pointer",
                    border: type === "debit" ? `1.5px solid ${debitColor}` : "1.5px solid rgba(255,255,255,0.1)",
                    background: type === "debit" ? "rgba(248,113,113,0.1)" : "transparent",
                    color: type === "debit" ? debitColor : "rgba(255,255,255,0.5)", fontWeight:600, fontSize:"0.82rem" }}>
                    Uang Keluar
                  </button>
                </div>

                <label style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.5)" }}>
                  Jumlah (Rp)
                  <input type="number" min="1" required value={amount} onChange={e => setAmount(e.target.value)}
                    style={{ width:"100%", marginTop:6, padding:"11px 12px", borderRadius:10,
                      background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"white" }} />
                </label>

                <label style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.5)" }}>
                  Catatan
                  <input value={note} onChange={e => setNote(e.target.value)} placeholder="Contoh: Transfer dari Budi"
                    style={{ width:"100%", marginTop:6, padding:"11px 12px", borderRadius:10,
                      background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"white" }} />
                </label>

                <label style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.5)" }}>
                  Bukti Transfer <span style={{ color:debitColor }}>(wajib)</span>
                  <input type="file" accept="image/*" required ref={fileRef} onChange={handleFile}
                    style={{ display:"block", marginTop:6, fontSize:"0.78rem", color:"rgba(255,255,255,0.6)" }} />
                </label>

                {preview && <img src={preview} alt="Pratinjau" style={{ width:"100%", maxHeight:200, objectFit:"cover", borderRadius:10 }} />}
                {formError && <p style={{ color:debitColor, fontSize:"0.78rem", margin:0 }}>{formError}</p>}

                <div style={{ display:"flex", gap:10, marginTop:4 }}>
                  <button type="button" onClick={() => { setShowForm(false); resetForm(); }} style={{
                    flex:1, padding:12, borderRadius:10, border:"1px solid rgba(255,255,255,0.15)",
                    background:"transparent", color:"rgba(255,255,255,0.6)", cursor:"pointer" }}>Batal</button>
                  <button type="submit" disabled={saving} style={{
                    flex:1, padding:12, borderRadius:10, border:"none", cursor:"pointer",
                    background:`linear-gradient(135deg,${gold},${goldLight})`, color:"#0F172A", fontWeight:700 }}>
                    {saving ? "Menyimpan…" : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

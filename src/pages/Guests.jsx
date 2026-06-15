import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Sidebar from "../components/Sidebar";

const GUEST_CATEGORIES = ["Keluarga Pria", "Keluarga Wanita", "Teman Pria", "Teman Wanita", "Rekan Kerja", "Tetangga", "Lainnya"];

export default function Guests() {
  const [guests, setGuests]     = useState([]);
  const [name, setName]         = useState("");
  const [category, setCategory] = useState("");
  const [phone, setPhone]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState("");
  const [filterCat, setFilterCat] = useState("Semua");
  const [filterSent, setFilterSent] = useState("Semua");

  useEffect(() => { fetchGuests(); }, []);

  const fetchGuests = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("guests").select("*").order("id");
    if (!error) setGuests(data);
    setLoading(false);
  };

  const addGuest = async () => {
    if (!name) return;
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const newGuest = { id: Date.now(), name, category, phone, slug, invitation_sent: false };
    const { error } = await supabase.from("guests").insert(newGuest);
    if (!error) { setGuests([...guests, newGuest]); setName(""); setCategory(""); setPhone(""); }
  };

  const deleteGuest = async (id) => {
    const { error } = await supabase.from("guests").delete().eq("id", id);
    if (!error) setGuests(guests.filter((g) => g.id !== id));
  };

  const sendWhatsApp = async (guest) => {
    const link = `${window.location.origin}/invitation/${guest.slug}`;
    const text = `Assalamu'alaikum Wr. Wb.\n\nKepada Yth.\n${guest.name}\n\nKami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami.\n\nSilakan buka undangan berikut:\n\n${link}\n\nTerima kasih.`;
    window.open(`https://wa.me/${guest.phone}?text=${encodeURIComponent(text)}`, "_blank");

    // Tandai sudah dikirim
    const { error } = await supabase.from("guests").update({ invitation_sent: true }).eq("id", guest.id);
    if (!error) setGuests(guests.map((g) => g.id === guest.id ? { ...g, invitation_sent: true } : g));
  };

  const importExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const XLSX = await import("xlsx");
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const workbook = XLSX.read(evt.target.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);
      const imported = rows.map((row, i) => ({
        id: Date.now() + i, name: row.Nama || "", category: row.Kategori || "",
        phone: row.Telepon || "", slug: (row.Nama || "").toLowerCase().replace(/\s+/g, "-"),
        invitation_sent: false,
      }));
      const { error } = await supabase.from("guests").insert(imported);
      if (!error) setGuests((prev) => [...prev, ...imported]);
    };
    reader.readAsBinaryString(file);
  };

  // Filter
  const usedCats = ["Semua", ...new Set(guests.map((g) => g.category).filter(Boolean))];
  const filtered = guests.filter((g) => {
    const matchSearch = g.name?.toLowerCase().includes(search.toLowerCase()) || g.category?.toLowerCase().includes(search.toLowerCase());
    const matchCat  = filterCat  === "Semua" || g.category === filterCat;
    const matchSent = filterSent === "Semua" || (filterSent === "Terkirim" ? g.invitation_sent : !g.invitation_sent);
    return matchSearch && matchCat && matchSent;
  });

  const totalSent    = guests.filter((g) => g.invitation_sent).length;
  const totalNotSent = guests.filter((g) => !g.invitation_sent).length;

  return (
    <div className="flex min-h-screen" style={{ background: "#F0F9FF", fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />
      <main className="flex-1 pt-16 md:pt-0 p-4 md:p-8 overflow-x-hidden">
        <div className="mb-5">
          <p className="text-sky-500 text-xs uppercase tracking-widest mb-1">Undangan</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl md:text-4xl font-semibold text-sky-900">Data Tamu</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-2xl p-3 md:p-4 shadow-sm border border-sky-100 text-center">
            <p className="text-xl md:text-2xl font-bold text-sky-600">{guests.length}</p>
            <p className="text-xs text-slate-400 mt-0.5">Total Tamu</p>
          </div>
          <div className="bg-white rounded-2xl p-3 md:p-4 shadow-sm border border-sky-100 text-center">
            <p className="text-xl md:text-2xl font-bold text-green-500">{totalSent}</p>
            <p className="text-xs text-slate-400 mt-0.5">Terkirim</p>
          </div>
          <div className="bg-white rounded-2xl p-3 md:p-4 shadow-sm border border-sky-100 text-center">
            <p className="text-xl md:text-2xl font-bold text-amber-500">{totalNotSent}</p>
            <p className="text-xs text-slate-400 mt-0.5">Belum Kirim</p>
          </div>
        </div>

        {/* Form Tambah */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-sky-100 mb-4">
          <h2 className="font-semibold text-sky-900 mb-3 text-sm">Tambah Tamu</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input className="border border-slate-200 p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" placeholder="Nama Tamu" value={name} onChange={(e) => setName(e.target.value)} />
            <select className="border border-slate-200 p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Pilih Kategori</option>
              {GUEST_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input className="border border-slate-200 p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" placeholder="No WhatsApp (628xxx)" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <button onClick={addGuest} className="py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90"
              style={{ background: "linear-gradient(90deg, #0284C7, #38BDF8)" }}>+ Tambah Tamu</button>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500">Import Excel:</label>
            <input type="file" accept=".xlsx,.xls" onChange={importExcel} className="text-xs text-slate-500" />
          </div>
        </div>

        {/* Filter & Search */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-sky-100 mb-4 space-y-3">
          <input className="border border-slate-200 p-3 rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-sky-400"
            placeholder="🔍 Cari nama tamu..." value={search} onChange={(e) => setSearch(e.target.value)} />

          <div className="flex gap-2 flex-wrap">
            <span className="text-xs text-slate-400 self-center">Kategori:</span>
            {usedCats.map((c) => (
              <button key={c} onClick={() => setFilterCat(c)}
                className="text-xs px-3 py-1.5 rounded-full font-medium transition"
                style={{ background: filterCat === c ? "linear-gradient(90deg,#0284C7,#38BDF8)" : "#E0F2FE", color: filterCat === c ? "white" : "#0284C7" }}>
                {c}
              </button>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap">
            <span className="text-xs text-slate-400 self-center">Status:</span>
            {["Semua", "Terkirim", "Belum Kirim"].map((s) => (
              <button key={s} onClick={() => setFilterSent(s)}
                className="text-xs px-3 py-1.5 rounded-full font-medium transition"
                style={{ background: filterSent === s ? "linear-gradient(90deg,#0284C7,#38BDF8)" : "#E0F2FE", color: filterSent === s ? "white" : "#0284C7" }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Tabel */}
        <div className="bg-white rounded-2xl shadow-sm border border-sky-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr style={{ background: "linear-gradient(90deg, #0C4A6E, #0284C7)" }}>
                  {["Nama", "Kategori", "No WA", "Status", "Link", "Aksi"].map((h) => (
                    <th key={h} className="p-3 text-left text-white font-medium text-xs uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan={6} className="p-6 text-center text-slate-400">Memuat...</td></tr>
                : filtered.length === 0 ? <tr><td colSpan={6} className="p-6 text-center text-slate-400">Belum ada tamu.</td></tr>
                : filtered.map((g, i) => (
                  <tr key={g.id} className={i % 2 === 0 ? "bg-white" : "bg-sky-50"}>
                    <td className="p-3 font-medium text-slate-700">{g.name}</td>
                    <td className="p-3">{g.category && <span className="bg-sky-100 text-sky-700 text-xs px-2 py-0.5 rounded-full">{g.category}</span>}</td>
                    <td className="p-3 text-slate-500 text-xs">{g.phone}</td>
                    <td className="p-3">
                      {g.invitation_sent ? (
                        <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                          Terkirim
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-amber-500 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                          Belum
                        </span>
                      )}
                    </td>
                    <td className="p-3"><a href={`/invitation/${g.slug}`} target="_blank" rel="noreferrer" className="text-sky-500 text-xs underline">Lihat</a></td>
                    <td className="p-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => sendWhatsApp(g)}
                          className={`text-xs px-2 py-1.5 rounded-lg transition ${g.invitation_sent ? "bg-green-100 text-green-700" : "bg-green-50 text-green-600 hover:bg-green-100"}`}>
                          {g.invitation_sent ? "✓ WA" : "WA"}
                        </button>
                        <button onClick={() => deleteGuest(g.id)} className="text-xs px-2 py-1.5 rounded-lg bg-red-50 text-red-400 hover:bg-red-100">Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-400">Menampilkan {filtered.length} dari {guests.length} tamu</p>
      </main>
    </div>
  );
}

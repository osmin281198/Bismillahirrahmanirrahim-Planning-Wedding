import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { getPermissions } from "../lib/roles";

const ALL_NAV = [
  { to:"/dashboard", icon:"✦", label:"Dashboard",   page:"dashboard" },
  { to:"/rab",       icon:"◈", label:"Anggaran",    page:"rab" },
  { to:"/planning",  icon:"◉", label:"Planning",    page:"planning" },
  { to:"/guests",    icon:"◎", label:"Tamu",        page:"guests" },
  { to:"/wishes",    icon:"◇", label:"RSVP",        page:"wishes" },
  { to:"/notes",     icon:"✎", label:"Catatan",     page:"notes" },
  { to:"/kas",       icon:"💰", label:"Kas",         page:"kas" },
  { to:"/settings",  icon:"◆", label:"Pengaturan",  page:"settings" },
  { to:"/users",     icon:"🔐", label:"Kelola User", page:"users" },
];

export default function Sidebar() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const [open, setOpen]             = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [roleLabel, setRoleLabel]   = useState(null);
  const [pages, setPages]           = useState([]);
  const [userEmail, setUserEmail]   = useState("");
  const [groom, setGroom]           = useState("");
  const [bride, setBride]           = useState("");
  const [photoUrl, setPhotoUrl]     = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setUserEmail(session.user.email);
        const perm = await getPermissions(session.user.email);
        if (perm) { setRoleLabel(perm.role); setPages(perm.pages); }
      }
    });
    supabase.from("settings").select("groom, bride, photo_url").eq("id",1).single()
      .then(({ data }) => {
        if (data) {
          setGroom(data.groom||"");
          setBride(data.bride||"");
          setPhotoUrl(data.photo_url||"");
        }
      });
  }, []);

  const navItems = ALL_NAV.filter(item => pages.includes(item.page));

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    navigate("/");
  };

  const bg   = "linear-gradient(180deg, #0F172A 0%, #1E293B 100%)";
  const gold = "#C4A45A";
  const goldLight = "#E8CC8A";

  const NavLinks = ({ onClose }) => (
    <nav style={{ flex:1, display:"flex", flexDirection:"column", gap:4 }}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.to;
        return (
          <Link key={item.to} to={item.to} onClick={onClose}
            style={{
              display:"flex", alignItems:"center", gap:12,
              padding:"12px 16px", borderRadius:12, textDecoration:"none",
              transition:"all 0.2s",
              background: isActive
                ? "linear-gradient(135deg,rgba(196,164,90,0.2),rgba(196,164,90,0.05))"
                : "transparent",
              border: isActive ? `1px solid rgba(196,164,90,0.3)` : "1px solid transparent",
              color: isActive ? gold : "rgba(255,255,255,0.55)",
            }}>
            <span style={{ fontSize:"1rem", color: isActive ? gold : "rgba(255,255,255,0.3)" }}>{item.icon}</span>
            <span style={{ fontSize:"0.85rem", fontWeight: isActive ? 600 : 400,
              letterSpacing:"0.03em" }}>{item.label}</span>
            {isActive && (
              <div style={{ marginLeft:"auto", width:6, height:6, borderRadius:"50%", background:gold }} />
            )}
          </Link>
        );
      })}
    </nav>
  );

  const roleDisplay = () => {
    if (roleLabel === "super") return { emoji:"👑", text:"Admin Utama" };
    if (roleLabel === "family") return { emoji:"👨‍👩‍👧", text:"Keluarga" };
    return { emoji:"💍", text: roleLabel ? roleLabel : "Pengantin" };
  };

  const UserInfo = () => {
    const rd = roleDisplay();
    return (
      <div style={{
        padding:"14px 16px", borderRadius:14, marginBottom:10,
        background:"rgba(196,164,90,0.08)", border:`1px solid rgba(196,164,90,0.15)`,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{
            width:40, height:40, borderRadius:"50%", flexShrink:0,
            overflow:"hidden", border:`2px solid rgba(196,164,90,0.4)`,
            background:`linear-gradient(135deg,${gold},${goldLight})`,
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            {photoUrl ? (
              <img src={photoUrl} alt="Foto"
                style={{ width:"100%", height:"100%", objectFit:"cover" }}
                onError={e => { e.target.style.display="none"; }} />
            ) : (
              <span style={{ fontSize:"1.1rem" }}>{rd.emoji}</span>
            )}
          </div>
          <div style={{ minWidth:0 }}>
            <p style={{ fontSize:"0.68rem", color:gold, fontWeight:600,
              letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:2 }}>
              {rd.emoji} {rd.text}
            </p>
            <p style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.35)",
              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {userEmail}
            </p>
          </div>
        </div>
        {groom && bride && (
          <div style={{ marginTop:10, paddingTop:10,
            borderTop:`1px solid rgba(196,164,90,0.15)`, textAlign:"center" }}>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1rem",
              color:"rgba(255,255,255,0.8)", fontWeight:500 }}>
              {groom.split(" ")[0]} &amp; {bride.split(" ")[0]}
            </p>
          </div>
        )}
      </div>
    );
  };

  const LogoutBtn = () => (
    <button onClick={handleLogout} disabled={loggingOut}
      style={{
        display:"flex", alignItems:"center", gap:10, width:"100%",
        padding:"12px 16px", borderRadius:12,
        border:"1px solid rgba(239,68,68,0.2)",
        background:"rgba(239,68,68,0.06)", cursor:"pointer",
        color:"rgba(239,68,68,0.7)", fontSize:"0.85rem",
        transition:"all 0.2s", opacity: loggingOut ? 0.5 : 1,
      }}>
      <span>↩</span>
      <span>{loggingOut ? "Keluar..." : "Keluar"}</span>
    </button>
  );

  const Brand = () => (
    <div style={{ marginBottom:20 }}>
      <p style={{ fontSize:"0.58rem", color:"rgba(196,164,90,0.5)",
        letterSpacing:"0.3em", textTransform:"uppercase", marginBottom:4 }}>Wedding Planner</p>
      <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.6rem",
        fontWeight:600, color:"white", lineHeight:1.2, margin:0 }}>Our Big Day</h2>
      <div style={{ marginTop:10, height:1,
        background:"linear-gradient(90deg,transparent,rgba(196,164,90,0.4),transparent)" }} />
    </div>
  );

  return (
    <>
      <div className="md:hidden" style={{
        position:"fixed", top:0, left:0, right:0, zIndex:50,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"13px 20px",
        background:"rgba(15,23,42,0.96)",
        backdropFilter:"blur(12px)",
        borderBottom:`1px solid rgba(196,164,90,0.12)`,
      }}>
        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.2rem",
          color:"white", fontWeight:600, margin:0 }}>Our Big Day</p>
        <button onClick={() => setOpen(!open)}
          style={{ width:38, height:38, borderRadius:10,
            background:"rgba(196,164,90,0.1)", border:`1px solid rgba(196,164,90,0.2)`,
            color:gold, fontSize:"1.1rem",
            display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <div className="md:hidden" style={{
          position:"fixed", inset:0, zIndex:40,
          background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)",
        }} onClick={() => setOpen(false)}>
          <div style={{
            width:280, height:"100%", padding:"24px 18px",
            background:bg, display:"flex", flexDirection:"column",
            borderRight:`1px solid rgba(196,164,90,0.12)`,
          }} onClick={e => e.stopPropagation()}>
            <Brand />
            <UserInfo />
            <NavLinks onClose={() => setOpen(false)} />
            <div style={{ marginTop:16, paddingTop:16,
              borderTop:"1px solid rgba(255,255,255,0.05)" }}>
              <LogoutBtn />
              <p style={{ textAlign:"center", fontSize:"0.6rem",
                color:"rgba(196,164,90,0.35)", marginTop:12, letterSpacing:"0.2em" }}>
                ✦ Semoga bahagia selalu ✦
              </p>
            </div>
          </div>
        </div>
      )}

      <aside className="hidden md:flex" style={{
        width:260, minHeight:"100vh", padding:"28px 18px",
        background:bg, flexDirection:"column", flexShrink:0,
        borderRight:`1px solid rgba(196,164,90,0.1)`,
        boxShadow:"4px 0 24px rgba(0,0,0,0.3)",
      }}>
        <Brand />
        <UserInfo />
        <NavLinks onClose={() => {}} />
        <div style={{ marginTop:16, paddingTop:16,
          borderTop:"1px solid rgba(255,255,255,0.05)" }}>
          <LogoutBtn />
          <p style={{ textAlign:"center", fontSize:"0.6rem",
            color:"rgba(196,164,90,0.35)", marginTop:12, letterSpacing:"0.2em" }}>
            ✦ Semoga bahagia selalu ✦
          </p>
        </div>
      </aside>
    </>
  );
}

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../lib/supabase";

const navItems = [
  { to: "/dashboard", icon: "🏠", label: "Dashboard" },
  { to: "/rab",       icon: "💰", label: "Anggaran" },
  { to: "/planning",  icon: "📋", label: "Planning" },
  { to: "/guests",    icon: "👥", label: "Tamu" },
  { to: "/wishes",    icon: "💌", label: "RSVP" },
  { to: "/settings",  icon: "⚙️",  label: "Pengaturan" },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen]         = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    navigate("/");
  };

  const NavLinks = () => (
    <nav className="flex flex-col gap-1 flex-1">
      {navItems.map((item) => {
        const isActive = location.pathname === item.to;
        return (
          <Link key={item.to} to={item.to} onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
            style={{
              background: isActive ? "rgba(255,255,255,0.15)" : "transparent",
              color: isActive ? "#ffffff" : "#BAE6FD",
              boxShadow: isActive ? "0 0 16px rgba(56,189,248,0.25)" : "none",
            }}>
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium text-sm">{item.label}</span>
            {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-300" />}
          </Link>
        );
      })}
    </nav>
  );

  const LogoutButton = () => (
    <button onClick={handleLogout} disabled={loggingOut}
      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full text-left disabled:opacity-50"
      style={{ color: "#FDA4AF", background: "rgba(255,255,255,0.05)" }}>
      <span className="text-lg">🚪</span>
      <span className="font-medium text-sm">{loggingOut ? "Keluar..." : "Keluar"}</span>
    </button>
  );

  return (
    <>
      {/* MOBILE: Top navbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 shadow-md"
        style={{ background: "linear-gradient(90deg, #0C4A6E, #0284C7)" }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }}
          className="text-white text-xl font-semibold">Our Big Day</h2>
        <button onClick={() => setOpen(!open)}
          className="text-white text-2xl w-10 h-10 flex items-center justify-center rounded-xl"
          style={{ background: "rgba(255,255,255,0.15)" }}>
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* MOBILE: Drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setOpen(false)}
          style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="w-64 h-full p-6 flex flex-col shadow-xl" onClick={(e) => e.stopPropagation()}
            style={{ background: "linear-gradient(180deg, #0C4A6E 0%, #0284C7 100%)" }}>
            <div className="mb-8">
              <p className="text-sky-300 text-xs uppercase tracking-widest mb-1">Wedding Planner</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }}
                className="text-white text-3xl font-semibold">Our Big Day</h2>
              <div className="mt-3 h-px bg-sky-500 opacity-40" />
            </div>
            <NavLinks />
            <div className="mt-6 pt-4 border-t border-sky-700 space-y-2">
              <LogoutButton />
              <p className="text-sky-400 text-xs text-center">✦ Semoga bahagia selalu ✦</p>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP: Sidebar */}
      <aside className="hidden md:flex w-64 min-h-screen p-6 flex-col shadow-xl flex-shrink-0"
        style={{ background: "linear-gradient(180deg, #0C4A6E 0%, #0284C7 100%)", fontFamily: "'Inter', sans-serif" }}>
        <div className="mb-10">
          <p className="text-sky-300 text-xs uppercase tracking-widest mb-1">Wedding Planner</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="text-white text-3xl font-semibold leading-tight">Our Big Day</h2>
          <div className="mt-3 h-px bg-sky-500 opacity-40" />
        </div>
        <NavLinks />
        <div className="mt-6 pt-4 border-t border-sky-700 space-y-2">
          <LogoutButton />
          <p className="text-sky-400 text-xs text-center">✦ Semoga bahagia selalu ✦</p>
        </div>
      </aside>
    </>
  );
}

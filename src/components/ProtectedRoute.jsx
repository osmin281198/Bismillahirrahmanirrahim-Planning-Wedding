import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getRole } from "../lib/roles";

// Halaman yang boleh diakses role "family"
const FAMILY_ALLOWED = ["/guests", "/wishes"];

export default function ProtectedRoute({ children }) {
  const navigate  = useNavigate();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed]   = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate("/");
        return;
      }

      const email    = session.user.email;
      const role     = getRole(email);
      const pathname = window.location.pathname;

      // Tidak ada role → tidak diizinkan
      if (!role) {
        await supabase.auth.signOut();
        navigate("/");
        return;
      }

      // Family hanya boleh akses halaman tertentu
      if (role === "family" && !FAMILY_ALLOWED.some((p) => pathname.startsWith(p))) {
        navigate("/guests");
        return;
      }

      setAllowed(true);
      setChecking(false);
    };

    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/");
    });

    return () => subscription.unsubscribe();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F0F9FF" }}>
        <div className="flex items-center gap-2 text-sky-400">
          <div className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Memuat...</span>
        </div>
      </div>
    );
  }

  return allowed ? children : null;
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getPermissions, PATH_PAGE_MAP, firstAllowedPath } from "../lib/roles";

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

      const email = session.user.email;
      const perm  = await getPermissions(email);

      if (!perm) {
        await supabase.auth.signOut();
        navigate("/");
        return;
      }

      const pathname = window.location.pathname;
      const requiredPage = Object.entries(PATH_PAGE_MAP)
        .find(([path]) => pathname.startsWith(path))?.[1];

      if (requiredPage && !perm.pages.includes(requiredPage)) {
        const fallback = firstAllowedPath(perm.pages);
        if (fallback) navigate(fallback);
        else {
          await supabase.auth.signOut();
          navigate("/");
        }
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

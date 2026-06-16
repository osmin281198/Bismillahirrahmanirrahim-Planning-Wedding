import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/");
      else setChecking(false);
    });

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

  return children;
}

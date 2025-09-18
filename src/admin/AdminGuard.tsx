import React from "react";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = React.useState(true);
  const [allowed, setAllowed] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) { setAllowed(false); setLoading(false); return; }
      const { data: prof } = await supabase
        .from("profiles").select("app_role").eq("id", data.session.user.id).single();
      setAllowed(prof?.app_role === "ADMIN");
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="p-4">Cargando…</div>;
  if (!allowed)
    return (
      <div className="p-6">
        <p className="text-red-600 mb-3">No tienes permisos para el panel de admin.</p>
        <div className="flex gap-2">
          <Link className="underline" to="/login">Iniciar sesión</Link>
          <Link className="underline" to="/pass">Ir a Mi Pase</Link>
        </div>
      </div>
    );
  return <>{children}</>;
}

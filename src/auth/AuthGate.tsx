// src/auth/AuthGate.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().finally(() => setReady(true));
  }, []);

  if (!ready) return <div className="p-6">Cargando sesión…</div>;
  return <>{children}</>;
}

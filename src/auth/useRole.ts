// src/auth/useRole.ts
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function useRole() {
  const [role, setRole] = useState<"ADMIN"|"SOCIO"|null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const r = (data.user?.app_metadata as any)?.app_role ?? "SOCIO";
      setRole(r);
    })();
  }, []);

  return role;
}

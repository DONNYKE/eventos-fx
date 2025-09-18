import React from "react";
import { supabase } from "../lib/supabaseClient";

export default function DebugInfo() {
  const [info, setInfo] = React.useState<any>({});

  React.useEffect(() => {
    (async () => {
      const env = {
        VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
        VITE_SUPABASE_ANON_KEY: (import.meta.env.VITE_SUPABASE_ANON_KEY || "").slice(0, 8) + "...",
      };
      const { data: sess, error: sessErr } = await supabase.auth.getSession();
      setInfo({ env, session: !!sess?.session, sessErr: sessErr?.message });
    })();
  }, []);

  return (
    <div style={{ padding: 16, fontFamily: "sans-serif" }}>
      <h2>🔎 Debug</h2>
      <pre style={{ whiteSpace: "pre-wrap", background:"#f5f5f5", padding:12, borderRadius:8 }}>
        {JSON.stringify(info, null, 2)}
      </pre>
      <p>
        Rutas rápidas: <a href="/pass">/pass</a> · <a href="/pass?demo=1">/pass?demo=1</a> · <a href="/scan">/scan</a> · <a href="/dash">/dash</a>
      </p>
    </div>
  );
}

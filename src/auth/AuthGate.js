import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
// src/auth/AuthGate.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
export function AuthGate({ children }) {
    const [ready, setReady] = useState(false);
    useEffect(() => {
        supabase.auth.getSession().finally(() => setReady(true));
    }, []);
    if (!ready)
        return _jsx("div", { className: "p-6", children: "Cargando sesi\u00F3n\u2026" });
    return _jsx(_Fragment, { children: children });
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { supabase } from "../lib/supabaseClient";
export default function DebugInfo() {
    const [info, setInfo] = React.useState({});
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
    return (_jsxs("div", { style: { padding: 16, fontFamily: "sans-serif" }, children: [_jsx("h2", { children: "\uD83D\uDD0E Debug" }), _jsx("pre", { style: { whiteSpace: "pre-wrap", background: "#f5f5f5", padding: 12, borderRadius: 8 }, children: JSON.stringify(info, null, 2) }), _jsxs("p", { children: ["Rutas r\u00E1pidas: ", _jsx("a", { href: "/pass", children: "/pass" }), " \u00B7 ", _jsx("a", { href: "/pass?demo=1", children: "/pass?demo=1" }), " \u00B7 ", _jsx("a", { href: "/scan", children: "/scan" }), " \u00B7 ", _jsx("a", { href: "/dash", children: "/dash" })] })] }));
}

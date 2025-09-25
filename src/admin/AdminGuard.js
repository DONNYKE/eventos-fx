import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from "react";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";
export default function AdminGuard({ children }) {
    const [loading, setLoading] = React.useState(true);
    const [allowed, setAllowed] = React.useState(false);
    React.useEffect(() => {
        (async () => {
            const { data } = await supabase.auth.getSession();
            if (!data.session) {
                setAllowed(false);
                setLoading(false);
                return;
            }
            const { data: prof } = await supabase
                .from("profiles").select("app_role").eq("id", data.session.user.id).single();
            setAllowed(prof?.app_role === "ADMIN");
            setLoading(false);
        })();
    }, []);
    if (loading)
        return _jsx("div", { className: "p-4", children: "Cargando\u2026" });
    if (!allowed)
        return (_jsxs("div", { className: "p-6", children: [_jsx("p", { className: "text-red-600 mb-3", children: "No tienes permisos para el panel de admin." }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Link, { className: "underline", to: "/login", children: "Iniciar sesi\u00F3n" }), _jsx(Link, { className: "underline", to: "/pass", children: "Ir a Mi Pase" })] })] }));
    return _jsx(_Fragment, { children: children });
}

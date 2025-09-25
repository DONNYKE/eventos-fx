import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/ui/AppShell.tsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
export default function AppShell({ children }) {
    const { pathname } = useLocation();
    const nav = useNavigate();
    const [hasSession, setHasSession] = React.useState(false);
    const [role, setRole] = React.useState(null);
    const [loadingRole, setLoadingRole] = React.useState(true);
    // Carga inicial de sesión y rol + suscripción a cambios de auth
    React.useEffect(() => {
        async function load() {
            const { data } = await supabase.auth.getSession();
            const session = !!data.session;
            setHasSession(session);
            if (session) {
                setLoadingRole(true);
                const { data: prof } = await supabase
                    .from("profiles")
                    .select("app_role")
                    .eq("id", data.session.user.id)
                    .single();
                setRole(prof?.app_role ?? "SOCIO");
                setLoadingRole(false);
            }
            else {
                setRole(null);
                setLoadingRole(false);
            }
        }
        load();
        // escuchar cambios de autenticación (firma nueva)
        const { data: { subscription }, } = supabase.auth.onAuthStateChange((_e, s) => {
            const logged = !!s;
            setHasSession(logged);
            if (!logged) {
                setRole(null);
                nav("/login");
            }
            else {
                (async () => {
                    const { data: prof } = await supabase
                        .from("profiles")
                        .select("app_role")
                        .eq("id", s.user.id)
                        .single();
                    setRole(prof?.app_role ?? "SOCIO");
                })();
            }
        });
        return () => {
            subscription.unsubscribe();
        };
    }, [nav]);
    // helper para marcar la pestaña activa (soporta subrutas)
    const isActive = (base) => pathname === base || pathname.startsWith(base + "/");
    const tabClass = (base) => `px-3 py-2 rounded-xl ${isActive(base) ? "bg-black text-white" : "bg-gray-100"}`;
    return (_jsxs("div", { className: "min-h-dvh bg-gray-100", children: [_jsx("nav", { className: "sticky top-0 z-10 bg-white border-b", children: _jsxs("div", { className: "max-w-md mx-auto flex items-center justify-between p-3 gap-2", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx(Link, { className: tabClass("/pass"), to: "/pass", children: "Mi Pase" }), _jsx(Link, { className: tabClass("/scan"), to: "/scan", children: "Esc\u00E1ner" }), _jsx(Link, { className: tabClass("/dash"), to: "/dash", children: "Dashboard" }), hasSession && !loadingRole && role === "ADMIN" && (_jsx(Link, { className: tabClass("/admin"), to: "/admin", children: "Admin" }))] }), _jsx("div", { className: "flex items-center gap-2", children: !hasSession ? (_jsx(Link, { className: "px-3 py-2 rounded-xl border", to: "/login", children: "Entrar" })) : (_jsx("button", { className: "px-3 py-2 rounded-xl border", onClick: async () => {
                                    await supabase.auth.signOut();
                                    setRole(null);
                                    nav("/login");
                                }, children: "Salir" })) })] }) }), _jsx("main", { className: "max-w-md mx-auto", children: children })] }));
}

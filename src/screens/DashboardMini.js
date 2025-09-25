import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { supabase } from "../lib/supabaseClient";
export const DashboardMini = () => {
    const [stats, setStats] = React.useState(null);
    React.useEffect(() => {
        (async () => {
            // Demo rápida: ajusta con tus queries
            const { data: conf } = await supabase.rpc("rpc_confirmados_actual"); // opcional si defines funciones
            const { data: paid } = await supabase.rpc("rpc_pagados_actual");
            const { data: inx } = await supabase.rpc("rpc_asistidos_actual");
            setStats({ confirmados: conf ?? 0, pagados: paid ?? 0, asistieron: inx ?? 0 });
        })();
    }, []);
    return (_jsxs("div", { className: "p-4 grid grid-cols-3 gap-3", children: [_jsxs("div", { className: "p-3 rounded-2xl border text-center", children: [_jsx("div", { className: "text-2xl font-bold", children: stats?.confirmados ?? "—" }), _jsx("div", { className: "text-xs text-gray-500", children: "Confirmados" })] }), _jsxs("div", { className: "p-3 rounded-2xl border text-center", children: [_jsx("div", { className: "text-2xl font-bold", children: stats?.pagados ?? "—" }), _jsx("div", { className: "text-xs text-gray-500", children: "Pagados" })] }), _jsxs("div", { className: "p-3 rounded-2xl border text-center", children: [_jsx("div", { className: "text-2xl font-bold", children: stats?.asistieron ?? "—" }), _jsx("div", { className: "text-xs text-gray-500", children: "Asistencias" })] })] }));
};

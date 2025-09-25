import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { supabase } from "../lib/supabaseClient";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
export const DashboardLive = () => {
    const [loading, setLoading] = React.useState(true);
    const [eventId, setEventId] = React.useState(null);
    const [tickets, setTickets] = React.useState([]);
    const load = async () => {
        setLoading(true);
        const now = new Date();
        const from = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(); // -1 día
        const to = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(); // +7 días
        const { data: evs } = await supabase
            .from("events").select("id,name,start_at")
            .gte("start_at", from)
            .lte("start_at", to)
            .order("start_at", { ascending: true })
            .limit(1);
        const evId = evs?.[0]?.id ?? null;
        setEventId(evId);
        let q = supabase
            .from("tickets")
            .select("id,event_id,zone,price,payment_status,payment_method,checkin_status,checkin_at")
            .order("created_at", { ascending: false })
            .limit(5000);
        if (evId)
            q = q.eq("event_id", evId);
        const { data } = await q;
        setTickets((data ?? []));
        setLoading(false);
    };
    React.useEffect(() => { load(); }, []);
    const totals = React.useMemo(() => {
        const confirmados = tickets.length;
        const pagados = tickets.filter(t => t.payment_status === "PAID").length;
        const asistieron = tickets.filter(t => t.checkin_status === "CHECKED_IN").length;
        const recaudado = tickets.reduce((s, t) => s + (t.payment_status === 'PAID' ? Number(t.price || 0) : 0), 0);
        return { confirmados, pagados, asistieron, recaudado };
    }, [tickets]);
    const byZone = React.useMemo(() => {
        const map = {};
        tickets.forEach(t => {
            const z = t.zone || "(sin zona)";
            map[z] = (map[z] || 0) + 1;
        });
        return Object.entries(map).map(([zone, count]) => ({ zone, count }));
    }, [tickets]);
    const byMethod = React.useMemo(() => {
        const map = {};
        tickets.forEach(t => {
            if (t.payment_status === "PAID") {
                const m = t.payment_method || "OTRO";
                map[m] = (map[m] || 0) + 1;
            }
        });
        return Object.entries(map).map(([method, count]) => ({ method, count }));
    }, [tickets]);
    const checkinsOverTime = React.useMemo(() => {
        const buckets = {};
        tickets.forEach(t => {
            if (t.checkin_status === "CHECKED_IN" && t.checkin_at) {
                const d = new Date(t.checkin_at);
                const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:00`;
                buckets[label] = (buckets[label] || 0) + 1;
            }
        });
        return Object.entries(buckets)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([time, count]) => ({ time, count }));
    }, [tickets]);
    return (_jsxs("div", { className: "p-4 space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { className: "p-3 rounded-2xl border text-center bg-white", children: [_jsx("div", { className: "text-2xl font-bold", children: totals.confirmados }), _jsx("div", { className: "text-xs text-gray-500", children: "Confirmados" })] }), _jsxs("div", { className: "p-3 rounded-2xl border text-center bg-white", children: [_jsx("div", { className: "text-2xl font-bold", children: totals.pagados }), _jsx("div", { className: "text-xs text-gray-500", children: "Pagados" })] }), _jsxs("div", { className: "p-3 rounded-2xl border text-center bg-white", children: [_jsx("div", { className: "text-2xl font-bold", children: totals.asistieron }), _jsx("div", { className: "text-xs text-gray-500", children: "Asistencias" })] }), _jsxs("div", { className: "p-3 rounded-2xl border text-center bg-white", children: [_jsxs("div", { className: "text-2xl font-bold", children: ["S/ ", totals.recaudado.toLocaleString()] }), _jsx("div", { className: "text-xs text-gray-500", children: "Recaudado" })] })] }), _jsxs("section", { className: "p-3 rounded-2xl border bg-white", children: [_jsx("h3", { className: "font-semibold mb-2", children: "Asistencias por hora" }), _jsx("div", { className: "h-40", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(LineChart, { data: checkinsOverTime, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "time", tick: { fontSize: 10 }, hide: checkinsOverTime.length > 12 }), _jsx(YAxis, { allowDecimals: false }), _jsx(Tooltip, {}), _jsx(Line, { type: "monotone", dataKey: "count" })] }) }) })] }), _jsxs("section", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [_jsxs("div", { className: "p-3 rounded-2xl border bg-white", children: [_jsx("h3", { className: "font-semibold mb-2", children: "Distribuci\u00F3n por zona" }), _jsx("div", { className: "h-40", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: byZone, children: [_jsx(XAxis, { dataKey: "zone", tick: { fontSize: 10 } }), _jsx(YAxis, { allowDecimals: false }), _jsx(Tooltip, {}), _jsx(Bar, { dataKey: "count" })] }) }) })] }), _jsxs("div", { className: "p-3 rounded-2xl border bg-white", children: [_jsx("h3", { className: "font-semibold mb-2", children: "Pagos por m\u00E9todo" }), _jsx("div", { className: "h-40", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(PieChart, { children: [_jsx(Pie, { data: byMethod, dataKey: "count", nameKey: "method", outerRadius: 70, label: true, children: byMethod.map((_, idx) => _jsx(Cell, {}, idx)) }), _jsx(Tooltip, {})] }) }) })] })] }), _jsxs("div", { className: "text-xs text-gray-500", children: ["Evento: ", eventId ?? "(auto)", " \u2022 Tickets: ", tickets.length, _jsx("button", { className: "ml-2 px-2 py-1 rounded-lg border", onClick: load, children: "Refrescar" })] })] }));
};

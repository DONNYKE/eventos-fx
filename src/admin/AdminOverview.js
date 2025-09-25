import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { supabase } from "../lib/supabaseClient";
export default function AdminOverview() {
    const [loading, setLoading] = React.useState(true);
    const [event, setEvent] = React.useState(null);
    const [tickets, setTickets] = React.useState([]);
    const [flyer, setFlyer] = React.useState(null);
    React.useEffect(() => {
        (async () => {
            setLoading(true);
            // 1) Traer evento más próximo (últimos 7 días hacia adelante)
            const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
            const { data: evs, error: evErr } = await supabase
                .from("events")
                .select("id,name,start_at,flyer_url,flyer_path")
                .gte("start_at", from)
                .order("start_at", { ascending: true })
                .limit(1);
            if (evErr) {
                console.error(evErr);
                setEvent(null);
                setTickets([]);
                setFlyer(null);
                setLoading(false);
                return;
            }
            const ev = evs?.[0] ?? null;
            setEvent(ev);
            // 2) Si hay evento, traer tickets para totales
            if (ev) {
                const { data: tks, error: tkErr } = await supabase
                    .from("tickets")
                    .select("payment_status,checkin_status,price")
                    .eq("event_id", ev.id);
                if (tkErr) {
                    console.error(tkErr);
                    setTickets([]);
                }
                else {
                    setTickets(tks ?? []);
                }
                // 3) Resolver URL de flyer
                //    - Si guardaste flyer_url y tu bucket es público → úsalo
                //    - Si no hay flyer_url pero sí flyer_path → genera signed URL
                let url = ev.flyer_url ?? null;
                if (!url && ev.flyer_path) {
                    const signed = await supabase
                        .storage
                        .from("event-flyers")
                        .createSignedUrl(ev.flyer_path, 60 * 60); // 1 hora
                    if (!signed.error)
                        url = signed.data?.signedUrl ?? null;
                }
                setFlyer(url ?? null);
            }
            else {
                setTickets([]);
                setFlyer(null);
            }
            setLoading(false);
        })();
    }, []);
    const totals = React.useMemo(() => {
        const total = tickets.length;
        const pagados = tickets.filter((t) => t.payment_status === "PAID").length;
        const asist = tickets.filter((t) => t.checkin_status === "CHECKED_IN").length;
        const rec = tickets.reduce((s, t) => s + (t.payment_status === "PAID" ? Number(t.price || 0) : 0), 0);
        return { total, pagados, asist, rec };
    }, [tickets]);
    if (loading)
        return _jsx("div", { children: "Cargando\u2026" });
    if (!event)
        return (_jsxs("div", { className: "p-4 rounded-2xl border bg-white", children: ["A\u00FAn no hay eventos.", " ", _jsx("a", { className: "underline", href: "/admin/event-new", children: "Crear evento" })] }));
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "p-4 rounded-2xl border bg-white space-y-3", children: [_jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm text-gray-500", children: "Evento" }), _jsx("div", { className: "font-semibold", children: event.name }), event.start_at && (_jsx("div", { className: "text-xs text-gray-500", children: new Date(event.start_at).toLocaleString() }))] }), _jsx("a", { className: "px-3 py-2 rounded-xl border", href: "/admin/event-new", children: "Crear otro" })] }), flyer ? (_jsx("img", { src: flyer, alt: "Flyer del evento", className: "w-full rounded-2xl border" })) : (_jsx("div", { className: "text-xs text-gray-500", children: "(Sin flyer cargado para este evento)" }))] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { className: "p-3 rounded-2xl border bg-white text-center", children: [_jsx("div", { className: "text-2xl font-bold", children: totals.total }), _jsx("div", { className: "text-xs text-gray-500", children: "Confirmados" })] }), _jsxs("div", { className: "p-3 rounded-2xl border bg-white text-center", children: [_jsx("div", { className: "text-2xl font-bold", children: totals.pagados }), _jsx("div", { className: "text-xs text-gray-500", children: "Pagados" })] }), _jsxs("div", { className: "p-3 rounded-2xl border bg-white text-center", children: [_jsx("div", { className: "text-2xl font-bold", children: totals.asist }), _jsx("div", { className: "text-xs text-gray-500", children: "Asistencias" })] }), _jsxs("div", { className: "p-3 rounded-2xl border bg-white text-center", children: [_jsxs("div", { className: "text-2xl font-bold", children: ["S/ ", totals.rec.toLocaleString()] }), _jsx("div", { className: "text-xs text-gray-500", children: "Recaudado" })] })] })] }));
}

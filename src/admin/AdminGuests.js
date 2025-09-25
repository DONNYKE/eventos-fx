import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
export default function AdminGuests() {
    const [loading, setLoading] = useState(true);
    const [event, setEvent] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [filter, setFilter] = useState("ALL");
    // 🔧 refs tipados (sin callback-ref)
    const dutyRef = useRef(null);
    const noteRef = useRef(null);
    async function load() {
        setLoading(true);
        const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { data: evs, error: evErr } = await supabase
            .from("events")
            .select("id,name,start_at,flyer_url")
            .gte("start_at", from)
            .order("start_at", { ascending: true })
            .limit(1);
        if (evErr) {
            console.error(evErr);
            setEvent(null);
            setTickets([]);
            setLoading(false);
            return;
        }
        const ev = evs?.[0];
        setEvent(ev ?? null);
        if (ev) {
            const { data: tks, error: tkErr } = await supabase
                .from("tickets")
                .select("id,event_id,user_id,payment_status,checkin_status,price, events(name,start_at), profiles(full_name,phone_e164)")
                .eq("event_id", ev.id)
                .order("id", { ascending: true });
            if (tkErr)
                console.error(tkErr);
            setTickets(tks ?? []);
        }
        else {
            setTickets([]);
        }
        setLoading(false);
    }
    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const filtered = useMemo(() => {
        if (filter === "PAID")
            return tickets.filter((t) => t.payment_status === "PAID");
        if (filter === "CHECKED_IN")
            return tickets.filter((t) => t.checkin_status === "CHECKED_IN");
        return tickets;
    }, [tickets, filter]);
    async function assignDutyAndNote(ticketId) {
        const duty = dutyRef.current?.value ?? "";
        const admin_note = noteRef.current?.value ?? "";
        // Ajusta columnas si tu tabla usa otros nombres
        const { error } = await supabase.from("tickets").update({ duty, admin_note }).eq("id", ticketId);
        if (error) {
            console.error(error);
            alert("No se pudo guardar la responsabilidad / nota");
            return;
        }
        alert("Responsabilidad / nota guardadas");
        load();
    }
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "p-4 rounded-2xl border bg-white flex items-start gap-3", children: [_jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "text-sm text-gray-500", children: "Invitados" }), _jsx("div", { className: "font-semibold", children: event ? event.name : "Sin evento activo" }), event?.start_at && (_jsx("div", { className: "text-xs text-gray-500", children: new Date(event.start_at).toLocaleString() }))] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("select", { className: "px-3 py-2 rounded-xl border", value: filter, onChange: (e) => setFilter(e.target.value), children: [_jsx("option", { value: "ALL", children: "Todos" }), _jsx("option", { value: "PAID", children: "Pagados" }), _jsx("option", { value: "CHECKED_IN", children: "Asistieron" })] }), _jsx("button", { className: "px-3 py-2 rounded-xl border", onClick: load, disabled: loading, children: loading ? "Cargando…" : "Recargar" })] })] }), _jsxs("div", { className: "p-4 rounded-2xl border bg-white flex flex-col md:flex-row gap-3", children: [_jsxs("div", { className: "flex-1 flex gap-2", children: [_jsxs("select", { className: "px-3 py-2 rounded-xl border w-48", ref: dutyRef, defaultValue: "", children: [_jsx("option", { value: "", children: "(Responsabilidad)" }), _jsx("option", { value: "ACCESO", children: "Acceso" }), _jsx("option", { value: "BARRA", children: "Barra" }), _jsx("option", { value: "VIP", children: "Zona VIP" }), _jsx("option", { value: "LOGISTICA", children: "Log\u00EDstica" })] }), _jsx("input", { type: "text", className: "flex-1 px-3 py-2 rounded-xl border", placeholder: "Nota del admin", ref: noteRef })] }), _jsx("div", { className: "text-xs text-gray-500", children: "Elige una fila y pulsa \u201CGuardar\u201D." })] }), _jsx("div", { className: "rounded-2xl border bg-white overflow-hidden", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "text-left px-3 py-2", children: "Invitado" }), _jsx("th", { className: "text-left px-3 py-2", children: "Tel\u00E9fono" }), _jsx("th", { className: "text-left px-3 py-2", children: "Pago" }), _jsx("th", { className: "text-left px-3 py-2", children: "Asistencia" }), _jsx("th", { className: "text-left px-3 py-2", children: "Acciones" })] }) }), _jsxs("tbody", { children: [filtered.map((t) => {
                                    const profile = t.profiles?.[0];
                                    return (_jsxs("tr", { className: "border-t", children: [_jsx("td", { className: "px-3 py-2", children: profile?.full_name ?? "(sin nombre)" }), _jsx("td", { className: "px-3 py-2", children: profile?.phone_e164 ?? "—" }), _jsx("td", { className: "px-3 py-2", children: t.payment_status ?? "PENDING" }), _jsx("td", { className: "px-3 py-2", children: t.checkin_status === "CHECKED_IN" ? "✅" : "—" }), _jsx("td", { className: "px-3 py-2", children: _jsx("button", { className: "px-3 py-1 rounded-xl border", onClick: () => assignDutyAndNote(t.id), children: "Guardar" }) })] }, t.id));
                                }), filtered.length === 0 && (_jsx("tr", { children: _jsx("td", { className: "px-3 py-6 text-center text-gray-500", colSpan: 5, children: "No hay invitados para mostrar." }) }))] })] }) })] }));
}

import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { supabase } from "../lib/supabaseClient";
import TicketQR from "../components/TicketQR";
export const MyPassScreen = () => {
    const [loading, setLoading] = React.useState(true);
    const [ticket, setTicket] = React.useState(null);
    const [error, setError] = React.useState("");
    React.useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setError("");
                const { data: sess, error: sessErr } = await supabase.auth.getSession();
                if (sessErr)
                    throw sessErr;
                if (!sess.session) {
                    setError("No has iniciado sesión.");
                    return;
                }
                const uid = sess.session.user.id;
                // 1) ÚLTIMO ticket DEL USUARIO (sin embeds)
                const { data: tks, error: e1 } = await supabase
                    .from("tickets")
                    .select("id,event_id,payment_status")
                    .eq("user_id", uid)
                    .order("created_at", { ascending: false })
                    .limit(1);
                if (e1)
                    throw e1;
                const tk = tks?.[0];
                if (!tk) {
                    setError("No tienes ticket activo.");
                    return;
                }
                // 2) EVENTO del ticket (sin embeds)
                const { data: ev, error: e2 } = await supabase
                    .from("events")
                    .select("name") // pido SOLO name
                    .eq("id", tk.event_id)
                    .single();
                if (e2)
                    throw e2;
                setTicket({ id: tk.id, event_name: ev?.name ?? "(evento)", payment_status: tk.payment_status });
            }
            catch (err) {
                console.error("PASS ERROR", err);
                setError(err?.message ?? "Error cargando tu pase");
            }
            finally {
                setLoading(false);
            }
        })();
    }, []);
    if (loading && !ticket && !error)
        return _jsx("div", { className: "p-4", children: "Cargando\u2026" });
    if (error)
        return _jsx("div", { className: "p-4 text-red-600", children: error });
    if (!ticket)
        return _jsx("div", { className: "p-4", children: "No tienes ticket activo." });
    return (_jsx("div", { className: "p-4", children: _jsx(TicketQR, { ticketId: ticket.id, eventName: ticket.event_name, status: ticket.payment_status }) }));
};

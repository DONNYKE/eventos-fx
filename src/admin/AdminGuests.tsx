import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type EventRow = { id: string; name: string; start_at: string | null; flyer_url?: string | null };
type TicketRow = {
  id: string;
  event_id: string;
  user_id: string | null;
  payment_status: "PAID" | "PENDING" | "FREE" | string | null;
  checkin_status: "CHECKED_IN" | "NONE" | "REJECTED" | string | null;
  price: number | null;
  events?: { name: string; start_at: string }[] | null;
  profiles?: { full_name: string | null; phone_e164: string | null }[] | null;
};

export default function AdminGuests() {
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<EventRow | null>(null);
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [filter, setFilter] = useState<"ALL" | "PAID" | "CHECKED_IN">("ALL");

  // 🔧 refs tipados (sin callback-ref)
  const dutyRef = useRef<HTMLSelectElement>(null);
  const noteRef = useRef<HTMLInputElement>(null);

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

    const ev = evs?.[0] as EventRow | undefined;
    setEvent(ev ?? null);

    if (ev) {
      const { data: tks, error: tkErr } = await supabase
        .from("tickets")
        .select(
          "id,event_id,user_id,payment_status,checkin_status,price, events(name,start_at), profiles(full_name,phone_e164)"
        )
        .eq("event_id", ev.id)
        .order("id", { ascending: true });

      if (tkErr) console.error(tkErr);
      setTickets((tks as TicketRow[]) ?? []);
    } else {
      setTickets([]);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    if (filter === "PAID") return tickets.filter((t) => t.payment_status === "PAID");
    if (filter === "CHECKED_IN") return tickets.filter((t) => t.checkin_status === "CHECKED_IN");
    return tickets;
  }, [tickets, filter]);

  async function assignDutyAndNote(ticketId: string) {
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

  return (
    <div className="space-y-4">
      {/* encabezado */}
      <div className="p-4 rounded-2xl border bg-white flex items-start gap-3">
        <div className="flex-1">
          <div className="text-sm text-gray-500">Invitados</div>
          <div className="font-semibold">{event ? event.name : "Sin evento activo"}</div>
          {event?.start_at && (
            <div className="text-xs text-gray-500">{new Date(event.start_at).toLocaleString()}</div>
          )}
        </div>

        <div className="flex gap-2">
          <select className="px-3 py-2 rounded-xl border" value={filter} onChange={(e) => setFilter(e.target.value as any)}>
            <option value="ALL">Todos</option>
            <option value="PAID">Pagados</option>
            <option value="CHECKED_IN">Asistieron</option>
          </select>
          <button className="px-3 py-2 rounded-xl border" onClick={load} disabled={loading}>
            {loading ? "Cargando…" : "Recargar"}
          </button>
        </div>
      </div>

      {/* controles globales */}
      <div className="p-4 rounded-2xl border bg-white flex flex-col md:flex-row gap-3">
        <div className="flex-1 flex gap-2">
          <select className="px-3 py-2 rounded-xl border w-48" ref={dutyRef} defaultValue="">
            <option value="">(Responsabilidad)</option>
            <option value="ACCESO">Acceso</option>
            <option value="BARRA">Barra</option>
            <option value="VIP">Zona VIP</option>
            <option value="LOGISTICA">Logística</option>
          </select>

          <input
            type="text"
            className="flex-1 px-3 py-2 rounded-xl border"
            placeholder="Nota del admin"
            ref={noteRef}
          />
        </div>
        <div className="text-xs text-gray-500">Elige una fila y pulsa “Guardar”.</div>
      </div>

      {/* tabla */}
      <div className="rounded-2xl border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-3 py-2">Invitado</th>
              <th className="text-left px-3 py-2">Teléfono</th>
              <th className="text-left px-3 py-2">Pago</th>
              <th className="text-left px-3 py-2">Asistencia</th>
              <th className="text-left px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => {
              const profile = t.profiles?.[0];
              return (
                <tr key={t.id} className="border-t">
                  <td className="px-3 py-2">{profile?.full_name ?? "(sin nombre)"}</td>
                  <td className="px-3 py-2">{profile?.phone_e164 ?? "—"}</td>
                  <td className="px-3 py-2">{t.payment_status ?? "PENDING"}</td>
                  <td className="px-3 py-2">{t.checkin_status === "CHECKED_IN" ? "✅" : "—"}</td>
                  <td className="px-3 py-2">
                    <button className="px-3 py-1 rounded-xl border" onClick={() => assignDutyAndNote(t.id)}>
                      Guardar
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-gray-500" colSpan={5}>
                  No hay invitados para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

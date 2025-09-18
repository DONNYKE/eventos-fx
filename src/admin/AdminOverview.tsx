import React from "react";
import { supabase } from "../lib/supabaseClient";

type EventRow = {
  id: string;
  name: string;
  start_at: string | null;
  flyer_url: string | null;
  flyer_path: string | null;
};

export default function AdminOverview() {
  const [loading, setLoading] = React.useState(true);
  const [event, setEvent] = React.useState<EventRow | null>(null);
  const [tickets, setTickets] = React.useState<any[]>([]);
  const [flyer, setFlyer] = React.useState<string | null>(null);

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

      const ev = (evs?.[0] as EventRow) ?? null;
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
        } else {
          setTickets(tks ?? []);
        }

        // 3) Resolver URL de flyer
        //    - Si guardaste flyer_url y tu bucket es público → úsalo
        //    - Si no hay flyer_url pero sí flyer_path → genera signed URL
        let url: string | null = ev.flyer_url ?? null;

        if (!url && ev.flyer_path) {
          const signed = await supabase
            .storage
            .from("event-flyers")
            .createSignedUrl(ev.flyer_path, 60 * 60); // 1 hora
          if (!signed.error) url = signed.data?.signedUrl ?? null;
        }

        setFlyer(url ?? null);
      } else {
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
    const rec = tickets.reduce(
      (s, t) => s + (t.payment_status === "PAID" ? Number(t.price || 0) : 0),
      0
    );
    return { total, pagados, asist, rec };
  }, [tickets]);

  if (loading) return <div>Cargando…</div>;

  if (!event)
    return (
      <div className="p-4 rounded-2xl border bg-white">
        Aún no hay eventos.{" "}
        <a className="underline" href="/admin/event-new">
          Crear evento
        </a>
      </div>
    );

  return (
    <div className="space-y-4">
      {/* Header + flyer */}
      <div className="p-4 rounded-2xl border bg-white space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm text-gray-500">Evento</div>
            <div className="font-semibold">{event.name}</div>
            {event.start_at && (
              <div className="text-xs text-gray-500">
                {new Date(event.start_at).toLocaleString()}
              </div>
            )}
          </div>

          <a className="px-3 py-2 rounded-xl border" href="/admin/event-new">
            Crear otro
          </a>
        </div>

        {flyer ? (
          <img
            src={flyer}
            alt="Flyer del evento"
            className="w-full rounded-2xl border"
          />
        ) : (
          <div className="text-xs text-gray-500">
            (Sin flyer cargado para este evento)
          </div>
        )}
      </div>

      {/* Totales */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-2xl border bg-white text-center">
          <div className="text-2xl font-bold">{totals.total}</div>
          <div className="text-xs text-gray-500">Confirmados</div>
        </div>
        <div className="p-3 rounded-2xl border bg-white text-center">
          <div className="text-2xl font-bold">{totals.pagados}</div>
          <div className="text-xs text-gray-500">Pagados</div>
        </div>
        <div className="p-3 rounded-2xl border bg-white text-center">
          <div className="text-2xl font-bold">{totals.asist}</div>
          <div className="text-xs text-gray-500">Asistencias</div>
        </div>
        <div className="p-3 rounded-2xl border bg-white text-center">
          <div className="text-2xl font-bold">
            S/ {totals.rec.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">Recaudado</div>
        </div>
      </div>
    </div>
  );
}

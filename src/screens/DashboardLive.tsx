import React from "react";
import { supabase } from "../lib/supabaseClient";
import {
  ResponsiveContainer,
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip,
  BarChart, Bar,
  PieChart, Pie, Cell
} from "recharts";

type PayStatus = "PENDING" | "PAID" | "WAIVED";
type CheckStatus = "NONE" | "CHECKED_IN";

interface TicketRow {
  id: string;
  event_id: string;
  zone: string | null;
  price: number | null;
  payment_status: PayStatus;
  payment_method: "EFECTIVO"|"YAPE"|"PLIN"|"CULQI"|"MP"|null;
  checkin_status: CheckStatus;
  checkin_at: string | null;
}

export const DashboardLive: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const [eventId, setEventId] = React.useState<string | null>(null);
  const [tickets, setTickets] = React.useState<TicketRow[]>([]);

  const load = async () => {
    setLoading(true);
    const now = new Date();
    const from = new Date(now.getTime() - 24*60*60*1000).toISOString(); // -1 día
    const to   = new Date(now.getTime() + 7*24*60*60*1000).toISOString(); // +7 días

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
    if (evId) q = q.eq("event_id", evId);

    const { data } = await q;
    setTickets((data ?? []) as TicketRow[]);
    setLoading(false);
  };

  React.useEffect(() => { load(); }, []);

  const totals = React.useMemo(() => {
    const confirmados = tickets.length;
    const pagados = tickets.filter(t => t.payment_status === "PAID").length;
    const asistieron = tickets.filter(t => t.checkin_status === "CHECKED_IN").length;
    const recaudado = tickets.reduce((s,t)=> s + (t.payment_status==='PAID' ? Number(t.price||0) : 0), 0);
    return { confirmados, pagados, asistieron, recaudado };
  }, [tickets]);

  const byZone = React.useMemo(() => {
    const map: Record<string, number> = {};
    tickets.forEach(t => {
      const z = t.zone || "(sin zona)";
      map[z] = (map[z]||0) + 1;
    });
    return Object.entries(map).map(([zone, count]) => ({ zone, count }));
  }, [tickets]);

  const byMethod = React.useMemo(() => {
    const map: Record<string, number> = {};
    tickets.forEach(t => {
      if (t.payment_status === "PAID") {
        const m = t.payment_method || "OTRO";
        map[m] = (map[m]||0) + 1;
      }
    });
    return Object.entries(map).map(([method, count]) => ({ method, count }));
  }, [tickets]);

  const checkinsOverTime = React.useMemo(() => {
    const buckets: Record<string, number> = {};
    tickets.forEach(t => {
      if (t.checkin_status === "CHECKED_IN" && t.checkin_at) {
        const d = new Date(t.checkin_at);
        const label = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:00`;
        buckets[label] = (buckets[label]||0) + 1;
      }
    });
    return Object.entries(buckets)
      .sort(([a],[b]) => a.localeCompare(b))
      .map(([time,count]) => ({ time, count }));
  }, [tickets]);

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-2xl border text-center bg-white">
          <div className="text-2xl font-bold">{totals.confirmados}</div>
          <div className="text-xs text-gray-500">Confirmados</div>
        </div>
        <div className="p-3 rounded-2xl border text-center bg-white">
          <div className="text-2xl font-bold">{totals.pagados}</div>
          <div className="text-xs text-gray-500">Pagados</div>
        </div>
        <div className="p-3 rounded-2xl border text-center bg-white">
          <div className="text-2xl font-bold">{totals.asistieron}</div>
          <div className="text-xs text-gray-500">Asistencias</div>
        </div>
        <div className="p-3 rounded-2xl border text-center bg-white">
          <div className="text-2xl font-bold">S/ {totals.recaudado.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Recaudado</div>
        </div>
      </div>

      <section className="p-3 rounded-2xl border bg-white">
        <h3 className="font-semibold mb-2">Asistencias por hora</h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={checkinsOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} hide={checkinsOverTime.length>12} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3 rounded-2xl border bg-white">
          <h3 className="font-semibold mb-2">Distribución por zona</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byZone}>
                <XAxis dataKey="zone" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-3 rounded-2xl border bg-white">
          <h3 className="font-semibold mb-2">Pagos por método</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byMethod} dataKey="count" nameKey="method" outerRadius={70} label>
                  {byMethod.map((_, idx) => <Cell key={idx} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <div className="text-xs text-gray-500">
        Evento: {eventId ?? "(auto)"} • Tickets: {tickets.length}
        <button className="ml-2 px-2 py-1 rounded-lg border" onClick={load}>Refrescar</button>
      </div>
    </div>
  );
};

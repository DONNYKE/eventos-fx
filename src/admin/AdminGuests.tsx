// src/admin/AdminGuests.tsx
import React from "react";
import { supabase } from "../lib/supabaseClient";

type TicketRow = {
  id: string;
  payment_status: "PENDING" | "PAID" | "WAIVED";
  checkin_status: "NONE" | "CHECKED_IN" | null;
  price: number | null;
  duty: string | null;
  duty_note: string | null;
  user_id: string;
  profiles: {
    full_name: string | null;
    phone_e164: string | null;
  } | null;
};

const DUTIES = [
  "",
  "INGRESO",
  "LOGISTICA",
  "BAR",
  "SONIDO",
  "SEGURIDAD",
  "HOST",
  "FOTO",
  "VIDEO",
  "OTRO",
];

export default function AdminGuests() {
  const [loading, setLoading] = React.useState(true);
  const [event, setEvent] = React.useState<any>(null);
  const [rows, setRows] = React.useState<TicketRow[]>([]);
  const [q, setQ] = React.useState("");
  const [filterPay, setFilterPay] = React.useState<"" | "PAID" | "PENDING" | "WAIVED">("");
  const [filterCheck, setFilterCheck] = React.useState<"" | "CHECKED_IN" | "NONE">("");
  const [filterDuty, setFilterDuty] = React.useState<string>("");
  const [savingId, setSavingId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);

    // Escoge el evento más próximo desde hace 7 días en adelante
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
      setRows([]);
      setLoading(false);
      return;
    }

    const ev = evs?.[0] ?? null;
    setEvent(ev);

    if (!ev) {
      setRows([]);
      setLoading(false);
      return;
    }

    // Trae los tickets con perfil
    const { data, error } = await supabase
      .from("tickets")
      .select(
        "id,payment_status,checkin_status,price,duty,duty_note,user_id,profiles(full_name,phone_e164)"
      )
      .eq("event_id", ev.id)
      .order("created_at", { ascending: false })
      .limit(2000);

    if (error) {
      console.error(error);
      setRows([]);
    } else {
      setRows((data as unknown as TicketRow[]) ?? []);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const filtered = rows.filter((r) => {
    const term = q.trim().toLowerCase();
    if (term) {
      const name = (r.profiles?.full_name ?? "").toLowerCase();
      const phone = (r.profiles?.phone_e164 ?? "").toLowerCase();
      if (!name.includes(term) && !phone.includes(term)) return false;
    }
    if (filterPay && r.payment_status !== filterPay) return false;
    if (filterCheck) {
      const ck = r.checkin_status ?? "NONE";
      if (ck !== filterCheck) return false;
    }
    if (filterDuty && (r.duty ?? "") !== filterDuty) return false;
    return true;
  });

  const badge = (txt: string, cls: string) => (
    <span className={`px-2 py-1 rounded-full text-xs ${cls}`}>{txt}</span>
  );

  const saveDuty = async (row: TicketRow, nextDuty: string, nextNote: string) => {
    try {
      setSavingId(row.id);
      const payload: Partial<TicketRow> = {
        duty: nextDuty || null,
        duty_note: nextNote?.trim() || null,
      };
      const { error } = await supabase.from("tickets").update(payload).eq("id", row.id);
      if (error) throw error;

      // Actualiza local
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, duty: payload.duty ?? null, duty_note: payload.duty_note ?? null } : r))
      );
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "No se pudo guardar la responsabilidad.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="text-sm text-gray-500">Evento</div>
          <div className="font-semibold">
            {event ? event.name : "–"}
          </div>
          {event?.start_at && (
            <div className="text-xs text-gray-500">
              {new Date(event.start_at).toLocaleString()}
            </div>
          )}
        </div>
        <button
          className="px-3 py-2 rounded-xl border"
          onClick={load}
          disabled={loading}
        >
          {loading ? "Cargando…" : "Recargar"}
        </button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 gap-2">
        <input
          className="px-3 py-2 rounded-xl border bg-white"
          placeholder="Buscar por nombre o teléfono"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="grid grid-cols-3 gap-2">
          <select
            className="px-3 py-2 rounded-xl border bg-white"
            value={filterPay}
            onChange={(e) => setFilterPay(e.target.value as any)}
          >
            <option value="">Pago: todos</option>
            <option value="PAID">Pagados</option>
            <option value="PENDING">Pendiente</option>
            <option value="WAIVED">Cortesía</option>
          </select>
          <select
            className="px-3 py-2 rounded-xl border bg-white"
            value={filterCheck}
            onChange={(e) => setFilterCheck(e.target.value as any)}
          >
            <option value="">Check: todos</option>
            <option value="CHECKED_IN">Check-in</option>
            <option value="NONE">Sin check-in</option>
          </select>
          <select
            className="px-3 py-2 rounded-xl border bg-white"
            value={filterDuty}
            onChange={(e) => setFilterDuty(e.target.value)}
          >
            <option value="">Responsabilidad: todas</option>
            {DUTIES.filter(Boolean).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cero-estado */}
      {loading && <div>Cargando…</div>}
      {!loading && !event && (
        <div className="p-3 rounded-2xl border bg-white">
          No hay eventos. <a className="underline" href="/admin/event-new">Crear evento</a>
        </div>
      )}
      {!loading && event && filtered.length === 0 && (
        <div className="p-3 rounded-2xl border bg-white">Aún no hay invitados con esos filtros.</div>
      )}

      {/* Lista */}
      <div className="space-y-2">
        {filtered.map((r) => {
          const payCls =
            r.payment_status === "PAID"
              ? "bg-green-100 text-green-700"
              : r.payment_status === "WAIVED"
              ? "bg-blue-100 text-blue-700"
              : "bg-amber-100 text-amber-700";

          const ck = r.checkin_status ?? "NONE";
          const ckCls =
            ck === "CHECKED_IN"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-700";

          // valores editables controlados por ref local (evitamos re-render por fila)
          const dutyRef = React.useRef<HTMLInputElement | null>(null);
          const noteRef = React.useRef<HTMLInputElement | null>(null);

          return (
            <div key={r.id} className="p-3 rounded-2xl border bg-white">
              <div className="flex justify-between gap-2">
                <div>
                  <div className="font-medium">{r.profiles?.full_name ?? "(sin nombre)"}</div>
                  <div className="text-xs text-gray-500">{r.profiles?.phone_e164 ?? ""}</div>
                </div>
                <div className="text-right space-y-1">
                  <div>{badge(r.payment_status, payCls)}</div>
                  <div>{badge(ck, ckCls)}</div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="md:col-span-1">
                  <label className="block text-xs text-gray-500 mb-1">Responsabilidad</label>
                  <select
                    defaultValue={r.duty ?? ""}
                    className="w-full px-2 py-2 rounded-xl border"
                    ref={(el) => (dutyRef.current = el)}
                  >
                    {DUTIES.map((d) => (
                      <option key={d} value={d}>
                        {d || "Sin responsabilidad"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Nota</label>
                  <input
                    defaultValue={r.duty_note ?? ""}
                    placeholder="Detalle: hora, puesto, etc."
                    className="w-full px-3 py-2 rounded-xl border"
                    ref={(el) => (noteRef.current = el)}
                  />
                </div>
              </div>

              <div className="mt-2 flex justify-end">
                <button
                  className="px-3 py-2 rounded-xl border"
                  disabled={savingId === r.id}
                  onClick={() =>
                    saveDuty(r, dutyRef.current?.value ?? "", noteRef.current?.value ?? "")
                  }
                >
                  {savingId === r.id ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React from "react";
import { supabase } from "../../lib/supabaseClient";
import { PaymentButtons } from "../../components/PaymentButtons";

type PayStatus = "PENDING" | "PAID" | "WAIVED";
type CheckStatus = "NONE" | "CHECKED_IN";

interface Row {
  id: string; // ticket id
  payment_status: PayStatus;
  checkin_status: CheckStatus;
  price: number | null;
  event_id: string;
  user_id: string;
  events: { name: string; start_at: string } | null;
  profiles: { full_name: string | null; phone_e164: string | null } | null;
}

export const ManualList: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [rows, setRows] = React.useState<Row[]>([]);
  const [q, setQ] = React.useState("");
  const [onlyPending, setOnlyPending] = React.useState(false);

  const fetchRows = React.useCallback(async () => {
    setLoading(true);

    // Evento actual/próximo simple: desde hace 7 días hacia adelante
    const { data: ev } = await supabase
      .from("events")
      .select("id, start_at")
      .gte("start_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order("start_at", { ascending: true })
      .limit(1);

    const currentEventId = ev?.[0]?.id as string | undefined;

    let query = supabase
      .from("tickets")
      .select(
        "id,payment_status,checkin_status,price,event_id,user_id, events(name,start_at), profiles(full_name,phone_e164)"
      )
      .order("created_at", { ascending: false })
      .limit(200);

    if (currentEventId) query = query.eq("event_id", currentEventId);

    const { data } = await query;
    const list = (data ?? []) as Row[];

    // Filtros en cliente
    const term = q.trim().toLowerCase();
    const filtered = list
      .filter((r) => {
        if (!term) return true;
        const name = r.profiles?.full_name?.toLowerCase() ?? "";
        const phone = r.profiles?.phone_e164?.toLowerCase() ?? "";
        return name.includes(term) || phone.includes(term);
      })
      .filter((r) => (onlyPending ? r.payment_status !== "PAID" : true));

    setRows(filtered);
    setLoading(false);
  }, [q, onlyPending]);

  React.useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const markAttendance = async (ticketId: string) => {
    await supabase
      .from("tickets")
      .update({ checkin_status: "CHECKED_IN", checkin_at: new Date().toISOString() })
      .eq("id", ticketId);
    await fetchRows();
  };

  const markPayment = async (
    ticketId: string,
    method: "EFECTIVO" | "YAPE" | "PLIN" | "CULQI" | "MP",
    amount: number
  ) => {
    await supabase
      .from("payments")
      .insert({ ticket_id: ticketId, method, amount, status: "PAID", txn_id: `MANUAL-${Date.now()}` });
    await supabase.from("tickets").update({ payment_status: "PAID", payment_method: method }).eq("id", ticketId);
    await fetchRows();
  };

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-2">Lista manual</h2>

      <div className="flex items-center gap-2 mb-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre o teléfono"
          className="flex-1 px-3 py-2 rounded-xl border bg-white"
        />
        <label className="text-sm flex items-center gap-2">
          <input
            type="checkbox"
            checked={onlyPending}
            onChange={(e) => setOnlyPending(e.target.checked)}
          />
          Solo no pagados
        </label>
        <button onClick={fetchRows} className="px-3 py-2 rounded-xl border bg-white">
          Refrescar
        </button>
      </div>

      <div className="space-y-2">
        {loading && <div className="text-sm text-gray-500">Cargando…</div>}
        {!loading && rows.length === 0 && <div className="text-sm text-gray-500">Sin resultados.</div>}

        {rows.map((r) => (
          <div key={r.id} className="p-3 rounded-2xl border bg-white">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="font-medium">{r.profiles?.full_name ?? "(sin nombre)"}</div>
                <div className="text-xs text-gray-500">{r.profiles?.phone_e164 ?? ""}</div>
                <div className="text-xs text-gray-500">{r.events?.name ?? "(evento)"}</div>
              </div>
              <div className="text-right text-xs">
                <div
                  className={`inline-block px-2 py-1 rounded-full ${
                    r.payment_status === "PAID" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {r.payment_status}
                </div>
                <div
                  className={`inline-block ml-2 px-2 py-1 rounded-full ${
                    r.checkin_status === "CHECKED_IN"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {r.checkin_status}
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2">
              {r.checkin_status !== "CHECKED_IN" && (
                <button onClick={() => markAttendance(r.id)} className="w-full py-2 rounded-xl bg-black text-white">
                  Marcar asistencia
                </button>
              )}

              {r.payment_status !== "PAID" && (
                <PaymentButtons
                  suggestedAmount={Number(r.price ?? 0)}
                  onPay={(m, a) => markPayment(r.id, m, a)}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

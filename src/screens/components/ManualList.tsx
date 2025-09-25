// src/screens/components/ManualList.tsx
import React from "react";
import { PaymentButtons } from "../../components/PaymentButtons";

/** Método que realmente acepta tu markPayment (según errores previos) */
type CorePaymentMethod = "EFECTIVO" | "YAPE" | "PLIN" | "CULQI" | "MP";

/** Fila normalizada para mostrar en la lista */
type Row = {
  id: string;
  payment_status?: string | null;
  checkin_status?: string | null;
  price?: number | null;
  event_id?: string | null;
  user_id?: string | null;
  events?: {
    name: string;
    start_at: string;
  };
  profiles?: {
    full_name?: string | null;
    phone_e164?: string | null;
  };
};

type Props = {
  /** Resultado crudo de tu query a Supabase (con events como array) */
  data?: any[];
  /** Callback que efectúa el cobro/registro de pago */
  markPayment: (
    ticketId: string,
    method: CorePaymentMethod,
    amount: number
  ) => Promise<void> | void;
  /** Deshabilitar botones (opcional) */
  disabled?: boolean;
  /** Monto sugerido para cobrar (opcional) */
  suggestedAmount?: number;
};

export default function ManualList({
  data,
  markPayment,
  disabled = false,
  suggestedAmount = 0,
}: Props) {
  // Normaliza la data: events vendrá como arreglo (events[]) y la convertimos a objeto simple.
  const list: Row[] = (data ?? []).map((d: any) => {
    const ev0 = Array.isArray(d?.events) ? d.events[0] : d?.events;
    const eventObj =
      ev0 && typeof ev0 === "object"
        ? {
            name: String(ev0.name ?? ""),
            start_at: String(ev0.start_at ?? ""),
          }
        : undefined;

    return {
      id: String(d?.id ?? ""),
      payment_status: d?.payment_status ?? null,
      checkin_status: d?.checkin_status ?? null,
      price: typeof d?.price === "number" ? d.price : Number(d?.price ?? 0),
      event_id: d?.event_id ?? null,
      user_id: d?.user_id ?? null,
      events: eventObj,
      profiles: Array.isArray(d?.profiles)
        ? {
            full_name: d.profiles[0]?.full_name ?? null,
            phone_e164: d.profiles[0]?.phone_e164 ?? null,
          }
        : d?.profiles,
    } as Row;
  });

  return (
    <div className="space-y-3">
      {list.length === 0 && (
        <div className="p-4 rounded-xl bg-gray-50 text-center text-sm text-gray-600">
          Sin registros.
        </div>
      )}

      {list.map((r) => (
        <div key={r.id} className="p-3 rounded-xl bg-white shadow flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="font-medium truncate">{r.profiles?.full_name ?? "—"}</p>
              <p className="text-xs text-gray-500 truncate">
                {r.events?.name ?? "Evento"} —{" "}
                {r.events?.start_at
                  ? new Date(r.events.start_at).toLocaleString()
                  : "—"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm">
                <span className="text-gray-500">Pago:</span>{" "}
                <span className="font-medium">{r.payment_status ?? "—"}</span>
              </p>
              <p className="text-sm">
                <span className="text-gray-500">Check-in:</span>{" "}
                <span className="font-medium">{r.checkin_status ?? "—"}</span>
              </p>
            </div>
          </div>

          <div className="pt-1">
            <PaymentButtons
              disabled={disabled}
              suggestedAmount={r.price ?? suggestedAmount}
              // onPay del componente emite (method: string, amount: number)
              // Narrow a los métodos que tu markPayment acepta
              onPay={(method: string, amount: number) => {
                const allowed: CorePaymentMethod[] = [
                  "EFECTIVO",
                  "YAPE",
                  "PLIN",
                  "CULQI",
                  "MP",
                ];
                const safeMethod: CorePaymentMethod = allowed.includes(
                  method as CorePaymentMethod
                )
                  ? (method as CorePaymentMethod)
                  : "EFECTIVO";
                return markPayment(r.id, safeMethod, amount);
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

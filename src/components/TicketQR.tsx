import { useEffect, useState } from "react";
import * as QRCode from "qrcode";
import { issueQrToken } from "../lib/api";

interface TicketQRProps {
  ticketId: string;
  eventName?: string;
  status?: "PENDING" | "PAID" | "WAIVED";
}

export default function TicketQR({ ticketId, eventName, status }: TicketQRProps) {
  const [svg, setSvg] = useState<string>("");
  const [expAt, setExpAt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  async function generate() {
    try {
      setLoading(true);
      setError("");
      // Tu Edge Function debe responder { qr, exp_at }
      const res = await issueQrToken(ticketId);
      setExpAt(res.exp_at);
      const svgString = await QRCode.toString(res.qr, { type: "svg", margin: 0 });
      setSvg(svgString);
    } catch (e: any) {
      setError(e?.message ?? "Error generando QR");
    } finally {
      setLoading(false);
    }
  }

  // Genera al montar o cuando cambie el ticket
  useEffect(() => {
    if (ticketId) generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  // Refresco automático 30s antes del vencimiento
  useEffect(() => {
    if (!expAt) return;
    const ms = new Date(expAt).getTime() - Date.now() - 30_000;
    if (ms <= 0) return;
    const t = setTimeout(() => generate(), ms);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expAt]);

  return (
    <div className="w-full max-w-sm mx-auto p-4 rounded-2xl shadow bg-white">
      <div className="text-center mb-3">
        <h2 className="text-lg font-semibold">Mi pase de entrada</h2>
        {eventName && <p className="text-sm text-gray-500">{eventName}</p>}
      </div>

      <div className="flex items-center justify-center p-3 border rounded-xl bg-gray-50 min-h-40">
        {svg ? (
          <div dangerouslySetInnerHTML={{ __html: svg }} />
        ) : (
          <div className="text-sm">{loading ? "Generando…" : "Toca actualizar"}</div>
        )}
      </div>

      <div className="mt-3 text-sm text-gray-600">
        <p>
          <span className="font-medium">Estado:</span> {status ?? "—"}
        </p>
        {expAt && (
          <p>
            <span className="font-medium">Vence:</span>{" "}
            {new Date(expAt).toLocaleString()}
          </p>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={generate}
          disabled={loading}
          className="flex-1 py-2 rounded-xl bg-black text-white hover:opacity-90"
        >
          {loading ? "Actualizando…" : "Actualizar QR"}
        </button>
      </div>

      {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
    </div>
  );
}

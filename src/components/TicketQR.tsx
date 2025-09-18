import React from "react";
import QRCode from "qrcode";
import { issueQrToken } from "../lib/api";

interface TicketQRProps {
  ticketId: string;
  eventName?: string;
  status?: "PENDING" | "PAID" | "WAIVED";
}

export const TicketQR: React.FC<TicketQRProps> = ({ ticketId, eventName, status }) => {
  const [qrText, setQrText] = React.useState<string>("");
  const [svg, setSvg] = React.useState<string>("");
  const [expAt, setExpAt] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>("");

  const generate = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await issueQrToken(ticketId);
      setQrText(res.qr);
      setExpAt(res.exp_at);
      const svgString = await QRCode.toString(res.qr, { type: "svg", margin: 0 });
      setSvg(svgString);
    } catch (e: any) {
      setError(e?.message ?? "Error generando QR");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (ticketId) generate();
  }, [ticketId]);

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
          <div className="text-sm">{loading ? "Generando..." : "Toca actualizar"}</div>
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
          {loading ? "Actualizando..." : "Actualizar QR"}
        </button>
      </div>

      {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
    </div>
  );
};

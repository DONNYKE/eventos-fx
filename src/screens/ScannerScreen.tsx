import React from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import type { Result } from "@zxing/library";
import { validateCheckin, type PaymentMethod } from "../lib/api";
import { CheckinResultCard } from "../components/CheckinResultCard";
import { PaymentButtons } from "../components/PaymentButtons";
import { ManualList } from "./components/ManualList";

export const ScannerScreen: React.FC = () => {
  const [reader] = React.useState(() => new BrowserMultiFormatReader());
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [scanning, setScanning] = React.useState(false);
  const [lastQR, setLastQR] = React.useState<string>("");
  const [result, setResult] = React.useState<
    | {
        tone: "success" | "warning" | "error";
        title: string;
        subtitle?: string;
        meta?: Record<string, string | number>;
      }
    | null
  >(null);
  const [deviceId, setDeviceId] = React.useState<string>("");
  const [pendingPaymentForQR, setPendingPaymentForQR] = React.useState<string | null>(null);

  React.useEffect(() => {
    const id = localStorage.getItem("device_id") || crypto.randomUUID();
    localStorage.setItem("device_id", id);
    setDeviceId(id);
  }, []);

  const start = async () => {
    setResult(null);
    setScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
      await reader.decodeFromStream(stream, videoRef.current!, (res: Result | undefined) => {
        if (!res) return;
        stop();
        const text = res.getText();
        setLastQR(text);
        handleValidate(text);
      });
    } catch (e) {
      setResult({
        tone: "error",
        title: "No se pudo iniciar la cámara",
        subtitle: String(e),
      });
      setScanning(false);
    }
  };

  const stop = () => {
    reader.reset();
    const v = videoRef.current;
    const s = (v?.srcObject as MediaStream | null) || null;
    s?.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setScanning(false);
  };

  const handleValidate = async (
    qr: string,
    mark?: { method: PaymentMethod; amount: number }
  ) => {
    try {
      const res = await validateCheckin({ qr, deviceId, markPayment: mark });
      const paid = res.payment_status === "PAID";
      setResult({
        tone: paid ? "success" : "warning",
        title: paid ? "Ingreso OK – Pagado" : "Ingreso OK – Pago pendiente",
        subtitle: new Date(res.checkin_at).toLocaleString(),
        meta: { ticket: res.ticket_id, pago: res.payment_status },
      });
      setPendingPaymentForQR(paid ? null : qr);
    } catch (e: any) {
      const msg = e?.message || String(e);
      const tone: "error" | "warning" = /expirado|ya usado|otro evento|QR inválido/i.test(msg)
        ? "error"
        : "warning";
      setResult({ tone, title: "No válido", subtitle: msg });
      setPendingPaymentForQR(null);
    }
  };

  const markPaymentNow = async (method: PaymentMethod, amount: number) => {
    if (!pendingPaymentForQR) return;
    await handleValidate(pendingPaymentForQR, { method, amount });
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Control de Ingreso</h1>

      <div className="rounded-2xl border overflow-hidden">
        <video ref={videoRef} autoPlay playsInline className="w-full aspect-[3/4] bg-black" />
      </div>

      <div className="flex gap-2">
        {!scanning ? (
          <button onClick={start} className="flex-1 py-2 rounded-xl bg-black text-white">
            Iniciar escáner
          </button>
        ) : (
          <button onClick={stop} className="flex-1 py-2 rounded-xl bg-gray-200">
            Detener
          </button>
        )}
      </div>

      {result && <CheckinResultCard {...result} />}

      {pendingPaymentForQR && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Registrar pago ahora:</p>
          <PaymentButtons suggestedAmount={0} onPay={markPaymentNow} />
        </div>
      )}

      <div className="text-xs text-gray-500">Último QR: {lastQR || "—"}</div>

      {/* Lista Manual debajo del escáner */}
      <ManualList />
    </div>
  );
};

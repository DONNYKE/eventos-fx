// src/screens/ScannerScreen.tsx
import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { validateCheckin } from "../lib/api";
import ManualList from "./components/ManualList";
import { BrowserMultiFormatReader } from "@zxing/browser";

// Debe alinearse con lo que acepta ManualList -> markPayment
type CorePaymentMethod = "EFECTIVO" | "YAPE" | "PLIN" | "CULQI" | "MP";

export function ScannerScreen() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string>("");

  // ⚠️ DEMO: data para la lista manual (reemplaza por tu dataset real si ya lo tienes)
  const [manualData, setManualData] = useState<any[]>([]);

  /** Actualiza pago del ticket en Supabase */
  async function markPayment(ticketId: string, method: CorePaymentMethod, amount: number) {
    try {
      const payment_status = method === "MP" ? "PAID" : method === "EFECTIVO" ? "PAID" : "PAID";
      const { error } = await supabase
        .from("tickets")
        .update({ payment_status, price: amount })
        .eq("id", ticketId);

      if (error) throw error;
      alert(`Pago registrado: ${method} S/ ${amount}`);
      // refresca tu lista local si la tienes
      // setManualData(...);
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "No se pudo registrar el pago");
    }
  }

  // Arrancar cámara / lector
  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    let stopped = false;

    async function start() {
      if (!videoRef.current) return;
      setScanning(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        // Decodificación continua
        reader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          async (res) => {
            if (stopped) return;
            if (res) {
              const text = res.getText();
              setResult(text);
              try {
                const v = await validateCheckin(text);
                if (v?.ok) {
                  alert("✅ Check-in válido");
                } else {
                  alert(`❌ Rechazado: ${v?.reason ?? "desconocido"}`);
                }
              } catch (err: any) {
                console.error(err);
                alert("Error validando QR");
              }
            }
          }
        );
      } catch (e) {
        console.error(e);
        setScanning(false);
      }
    }

    start();

    return () => {
      stopped = true;
      // Detener lector / cámara de forma segura sin await
      try {
        if (typeof (reader as any).stopContinuousDecode === "function") {
          (reader as any).stopContinuousDecode();
        }
        if (typeof (reader as any).reset === "function") {
          (reader as any).reset();
        }
      } catch {
        // no-op
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((t) => t.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">Escáner</h1>

      <div className="rounded-2xl overflow-hidden border bg-black aspect-[3/4]">
        <video ref={videoRef} className="w-full h-full object-cover" />
      </div>

      <div className="p-3 rounded-xl border bg-white text-sm">
        <div className="text-gray-500">Último QR</div>
        <div className="break-all">{result || "—"}</div>
      </div>

      {/* Lista manual de apoyo (pago rápido). 
          Si ya tienes tus datos reales, reemplaza manualData por tu state. */}
      <ManualList
        data={manualData}
        suggestedAmount={0}
        disabled={false}
        markPayment={markPayment}
      />
    </div>
  );
}

export default ScannerScreen;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/screens/ScannerScreen.tsx
import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { validateCheckin } from "../lib/api";
import ManualList from "./components/ManualList";
import { BrowserMultiFormatReader } from "@zxing/browser";
export function ScannerScreen() {
    const videoRef = useRef(null);
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState("");
    // ⚠️ DEMO: data para la lista manual (reemplaza por tu dataset real si ya lo tienes)
    const [manualData, setManualData] = useState([]);
    /** Actualiza pago del ticket en Supabase */
    async function markPayment(ticketId, method, amount) {
        try {
            const payment_status = method === "MP" ? "PAID" : method === "EFECTIVO" ? "PAID" : "PAID";
            const { error } = await supabase
                .from("tickets")
                .update({ payment_status, price: amount })
                .eq("id", ticketId);
            if (error)
                throw error;
            alert(`Pago registrado: ${method} S/ ${amount}`);
            // refresca tu lista local si la tienes
            // setManualData(...);
        }
        catch (e) {
            console.error(e);
            alert(e?.message ?? "No se pudo registrar el pago");
        }
    }
    // Arrancar cámara / lector
    useEffect(() => {
        const reader = new BrowserMultiFormatReader();
        let stopped = false;
        async function start() {
            if (!videoRef.current)
                return;
            setScanning(true);
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" },
                    audio: false,
                });
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
                // Decodificación continua
                reader.decodeFromVideoDevice(undefined, videoRef.current, async (res) => {
                    if (stopped)
                        return;
                    if (res) {
                        const text = res.getText();
                        setResult(text);
                        try {
                            const v = await validateCheckin(text);
                            if (v?.ok) {
                                alert("✅ Check-in válido");
                            }
                            else {
                                alert(`❌ Rechazado: ${v?.reason ?? "desconocido"}`);
                            }
                        }
                        catch (err) {
                            console.error(err);
                            alert("Error validando QR");
                        }
                    }
                });
            }
            catch (e) {
                console.error(e);
                setScanning(false);
            }
        }
        start();
        return () => {
            stopped = true;
            // Detener lector / cámara de forma segura sin await
            try {
                if (typeof reader.stopContinuousDecode === "function") {
                    reader.stopContinuousDecode();
                }
                if (typeof reader.reset === "function") {
                    reader.reset();
                }
            }
            catch {
                // no-op
            }
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach((t) => t.stop());
                videoRef.current.srcObject = null;
            }
        };
    }, []);
    return (_jsxs("div", { className: "max-w-md mx-auto p-4 space-y-4", children: [_jsx("h1", { className: "text-xl font-bold", children: "Esc\u00E1ner" }), _jsx("div", { className: "rounded-2xl overflow-hidden border bg-black aspect-[3/4]", children: _jsx("video", { ref: videoRef, className: "w-full h-full object-cover" }) }), _jsxs("div", { className: "p-3 rounded-xl border bg-white text-sm", children: [_jsx("div", { className: "text-gray-500", children: "\u00DAltimo QR" }), _jsx("div", { className: "break-all", children: result || "—" })] }), _jsx(ManualList, { data: manualData, suggestedAmount: 0, disabled: false, markPayment: markPayment })] }));
}
export default ScannerScreen;

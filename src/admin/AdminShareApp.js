import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import * as QRCode from "qrcode";
export default function AdminShareApp() {
    const [url, setUrl] = useState(() => {
        const base = typeof window !== "undefined" ? window.location.origin : "https://example.com";
        return `${base}/app`;
    });
    const canvasRef = useRef(null);
    useEffect(() => {
        if (!canvasRef.current)
            return;
        QRCode.toCanvas(canvasRef.current, url, { width: 256 }, (err) => {
            if (err)
                console.error(err);
        });
    }, [url]);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            alert("Enlace copiado");
        }
        catch {
            // no-op
        }
    };
    const downloadPng = () => {
        if (!canvasRef.current)
            return;
        const link = document.createElement("a");
        link.href = canvasRef.current.toDataURL("image/png");
        link.download = "instalar-eventos.png";
        link.click();
    };
    return (_jsxs("div", { className: "max-w-md mx-auto p-4 space-y-3", children: [_jsx("h1", { className: "text-xl font-bold", children: "Compartir instalaci\u00F3n" }), _jsx("p", { className: "text-sm text-gray-600", children: "Comparte el QR o el enlace para que los socios instalen la PWA." }), _jsx("canvas", { ref: canvasRef, className: "mx-auto rounded-2xl border" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { className: "flex-1 px-3 py-2 rounded-xl border", value: url, onChange: (e) => setUrl(e.target.value) }), _jsx("button", { className: "px-3 py-2 rounded-xl border", onClick: copy, children: "Copiar" }), _jsx("button", { className: "px-3 py-2 rounded-xl border", onClick: downloadPng, children: "PNG" })] })] }));
}

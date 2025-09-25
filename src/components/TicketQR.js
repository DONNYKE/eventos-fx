import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import * as QRCode from "qrcode";
import { issueQrToken } from "../lib/api";
export default function TicketQR({ ticketId, eventName, status }) {
    const [svg, setSvg] = useState("");
    const [expAt, setExpAt] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    async function generate() {
        try {
            setLoading(true);
            setError("");
            // Tu Edge Function debe responder { qr, exp_at }
            const res = await issueQrToken(ticketId);
            setExpAt(res.exp_at);
            const svgString = await QRCode.toString(res.qr, { type: "svg", margin: 0 });
            setSvg(svgString);
        }
        catch (e) {
            setError(e?.message ?? "Error generando QR");
        }
        finally {
            setLoading(false);
        }
    }
    // Genera al montar o cuando cambie el ticket
    useEffect(() => {
        if (ticketId)
            generate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ticketId]);
    // Refresco automático 30s antes del vencimiento
    useEffect(() => {
        if (!expAt)
            return;
        const ms = new Date(expAt).getTime() - Date.now() - 30000;
        if (ms <= 0)
            return;
        const t = setTimeout(() => generate(), ms);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expAt]);
    return (_jsxs("div", { className: "w-full max-w-sm mx-auto p-4 rounded-2xl shadow bg-white", children: [_jsxs("div", { className: "text-center mb-3", children: [_jsx("h2", { className: "text-lg font-semibold", children: "Mi pase de entrada" }), eventName && _jsx("p", { className: "text-sm text-gray-500", children: eventName })] }), _jsx("div", { className: "flex items-center justify-center p-3 border rounded-xl bg-gray-50 min-h-40", children: svg ? (_jsx("div", { dangerouslySetInnerHTML: { __html: svg } })) : (_jsx("div", { className: "text-sm", children: loading ? "Generando…" : "Toca actualizar" })) }), _jsxs("div", { className: "mt-3 text-sm text-gray-600", children: [_jsxs("p", { children: [_jsx("span", { className: "font-medium", children: "Estado:" }), " ", status ?? "—"] }), expAt && (_jsxs("p", { children: [_jsx("span", { className: "font-medium", children: "Vence:" }), " ", new Date(expAt).toLocaleString()] }))] }), _jsx("div", { className: "mt-4 flex gap-2", children: _jsx("button", { onClick: generate, disabled: loading, className: "flex-1 py-2 rounded-xl bg-black text-white hover:opacity-90", children: loading ? "Actualizando…" : "Actualizar QR" }) }), error && _jsx("p", { className: "mt-2 text-red-600 text-sm", children: error })] }));
}

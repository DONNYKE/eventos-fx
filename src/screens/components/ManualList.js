import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PaymentButtons } from "../../components/PaymentButtons";
export default function ManualList({ data, markPayment, disabled = false, suggestedAmount = 0, }) {
    // Normaliza la data: events vendrá como arreglo (events[]) y la convertimos a objeto simple.
    const list = (data ?? []).map((d) => {
        const ev0 = Array.isArray(d?.events) ? d.events[0] : d?.events;
        const eventObj = ev0 && typeof ev0 === "object"
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
        };
    });
    return (_jsxs("div", { className: "space-y-3", children: [list.length === 0 && (_jsx("div", { className: "p-4 rounded-xl bg-gray-50 text-center text-sm text-gray-600", children: "Sin registros." })), list.map((r) => (_jsxs("div", { className: "p-3 rounded-xl bg-white shadow flex flex-col gap-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "font-medium truncate", children: r.profiles?.full_name ?? "—" }), _jsxs("p", { className: "text-xs text-gray-500 truncate", children: [r.events?.name ?? "Evento", " \u2014", " ", r.events?.start_at
                                                ? new Date(r.events.start_at).toLocaleString()
                                                : "—"] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "text-sm", children: [_jsx("span", { className: "text-gray-500", children: "Pago:" }), " ", _jsx("span", { className: "font-medium", children: r.payment_status ?? "—" })] }), _jsxs("p", { className: "text-sm", children: [_jsx("span", { className: "text-gray-500", children: "Check-in:" }), " ", _jsx("span", { className: "font-medium", children: r.checkin_status ?? "—" })] })] })] }), _jsx("div", { className: "pt-1", children: _jsx(PaymentButtons, { disabled: disabled, suggestedAmount: r.price ?? suggestedAmount, 
                            // onPay del componente emite (method: string, amount: number)
                            // Narrow a los métodos que tu markPayment acepta
                            onPay: (method, amount) => {
                                const allowed = [
                                    "EFECTIVO",
                                    "YAPE",
                                    "PLIN",
                                    "CULQI",
                                    "MP",
                                ];
                                const safeMethod = allowed.includes(method)
                                    ? method
                                    : "EFECTIVO";
                                return markPayment(r.id, safeMethod, amount);
                            } }) })] }, r.id)))] }));
}

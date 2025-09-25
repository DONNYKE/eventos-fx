import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
export const PaymentButtons = ({ disabled, onPay, suggestedAmount }) => {
    const [amount, setAmount] = React.useState(suggestedAmount);
    const btn = (label, method) => (_jsx("button", { disabled: disabled, onClick: () => onPay(method, amount), className: "px-3 py-2 rounded-xl border bg-white hover:bg-gray-50 text-sm", children: label }, method));
    return (_jsxs("div", { className: "w-full p-3 rounded-2xl border bg-gray-50 flex flex-col gap-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Monto:" }), _jsx("input", { type: "number", className: "w-28 px-2 py-1 rounded-lg border", value: amount, onChange: e => setAmount(Number(e.target.value) || 0) })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [btn("Efectivo", "EFECTIVO"), btn("Yape", "YAPE"), btn("Plin", "PLIN"), btn("Culqi", "CULQI"), btn("Mercado Pago", "MP")] })] }));
};

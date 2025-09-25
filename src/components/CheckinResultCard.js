import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const CheckinResultCard = ({ tone, title, subtitle, meta }) => {
    const toneMap = {
        success: "border-green-500 bg-green-50",
        warning: "border-amber-500 bg-amber-50",
        error: "border-red-500 bg-red-50",
    };
    return (_jsxs("div", { className: `w-full p-4 rounded-2xl border ${toneMap[tone]} animate-in fade-in duration-150`, children: [_jsx("h3", { className: "font-semibold", children: title }), subtitle && _jsx("p", { className: "text-sm text-gray-700", children: subtitle }), meta && (_jsx("div", { className: "mt-2 grid grid-cols-2 gap-1 text-sm text-gray-700", children: Object.entries(meta).map(([k, v]) => (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-500", children: k }), _jsx("span", { className: "font-medium", children: String(v) })] }, k))) }))] }));
};

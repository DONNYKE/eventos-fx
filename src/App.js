import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { MyPassScreen } from "./screens/MyPassScreen";
import { ScannerScreen } from "./screens/ScannerScreen";
import { DashboardMini } from "./screens/DashboardMini";
export default function App() {
    const [tab, setTab] = React.useState("pass");
    return (_jsxs("div", { className: "min-h-dvh bg-gray-100", children: [_jsx("nav", { className: "sticky top-0 z-10 bg-white border-b", children: _jsxs("div", { className: "max-w-md mx-auto flex items-center justify-between p-3", children: [_jsx("button", { onClick: () => setTab("pass"), className: `px-3 py-2 rounded-xl ${tab === 'pass' ? 'bg-black text-white' : 'bg-gray-100'}`, children: "Mi Pase" }), _jsx("button", { onClick: () => setTab("scan"), className: `px-3 py-2 rounded-xl ${tab === 'scan' ? 'bg-black text-white' : 'bg-gray-100'}`, children: "Esc\u00E1ner" }), _jsx("button", { onClick: () => setTab("dash"), className: `px-3 py-2 rounded-xl ${tab === 'dash' ? 'bg-black text-white' : 'bg-gray-100'}`, children: "Dashboard" })] }) }), _jsxs("main", { className: "max-w-md mx-auto", children: [tab === "pass" && _jsx(MyPassScreen, {}), tab === "scan" && _jsx(ScannerScreen, {}), tab === "dash" && _jsx(DashboardMini, {})] })] }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, Outlet, useLocation } from "react-router-dom";
export default function AdminLayout() {
    const { pathname } = useLocation();
    const isActive = (b) => pathname === b || pathname.startsWith(b + "/");
    const tab = (b) => `px-3 py-2 rounded-xl ${isActive(b) ? "bg-black text-white" : "bg-gray-100"}`;
    return (_jsxs("div", { className: "max-w-md mx-auto p-4", children: [_jsxs("div", { className: "mb-3 flex gap-2", children: [_jsx(Link, { className: tab("/admin"), to: "/admin", children: "Overview" }), _jsx(Link, { className: tab("/admin/guests"), to: "/admin/guests", children: "Invitados" }), _jsx(Link, { className: tab("/admin/scanner"), to: "/admin/scanner", children: "Esc\u00E1ner" }), _jsx(Link, { className: tab("/admin/event-new"), to: "/admin/event-new", children: "+ Evento" })] }), _jsx(Outlet, {})] }));
}

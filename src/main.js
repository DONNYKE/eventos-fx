import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/main.tsx
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
/* UI de layout general */
import AppShell from "./ui/AppShell";
/* Rutas públicas/usuario: IMPORT CON NOMBRE */
import { MyPassScreen } from "./screens/MyPassScreen";
import { ScannerScreen } from "./screens/ScannerScreen";
import { DashboardLive } from "./screens/DashboardLive";
/* Zona admin */
import AdminLayout from "./admin/AdminLayout";
import AdminOverview from "./admin/AdminOverview";
import AdminGuests from "./admin/AdminGuests";
import AdminShareApp from "./admin/AdminShareApp";
import AdminEventNew from "./admin/AdminEventNew";
/* Guards */
import { RequireAuth, RequireAdmin } from "./auth/Protected";
/* Tailwind / estilos base */
import "./index.css";
const rootEl = document.getElementById("root");
if (!rootEl) {
    throw new Error("No se encontró el elemento #root");
}
createRoot(rootEl).render(_jsx(BrowserRouter, { children: _jsx(AppShell, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/pass", replace: true }) }), _jsx(Route, { path: "/pass", element: _jsx(RequireAuth, { children: _jsx(MyPassScreen, {}) }) }), _jsx(Route, { path: "/scanner", element: _jsx(RequireAuth, { children: _jsx(ScannerScreen, {}) }) }), _jsx(Route, { path: "/dashboard", element: _jsx(RequireAuth, { children: _jsx(DashboardLive, {}) }) }), _jsxs(Route, { path: "/admin", element: _jsx(RequireAdmin, { children: _jsx(AdminLayout, {}) }), children: [_jsx(Route, { index: true, element: _jsx(AdminOverview, {}) }), _jsx(Route, { path: "guests", element: _jsx(AdminGuests, {}) }), _jsx(Route, { path: "share", element: _jsx(AdminShareApp, {}) }), _jsx(Route, { path: "new", element: _jsx(AdminEventNew, {}) })] }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/pass", replace: true }) })] }) }) }));

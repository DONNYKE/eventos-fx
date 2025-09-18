import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// PWA: registrar Service Worker
import { registerSW } from "./pwa/registerSW";
registerSW();

// Shell de la app (tabs superiores: Mi Pase, Escáner, Dashboard, Admin, Salir)
import AppShell from "./ui/AppShell";

// Pantallas de usuario (export con nombre)
import { MyPassScreen } from "./screens/MyPassScreen";
import { ScannerScreen } from "./screens/ScannerScreen";
import { DashboardLive } from "./screens/DashboardLive";
import LoginScreen from "./screens/LoginScreen";

// Pantalla para instalar la app PWA
import DownloadAppScreen from "./screens/DownloadAppScreen";

// Admin
import AdminGuard from "./admin/AdminGuard";
import AdminLayout from "./admin/AdminLayout";
import AdminOverview from "./admin/AdminOverview";
import AdminGuests from "./admin/AdminGuests";
import AdminScanner from "./admin/AdminScanner";
import AdminEventNew from "./admin/AdminEventNew";
import AdminShareApp from "./admin/AdminShareApp";

// Estilos globales (Tailwind, etc)
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppShell>
        <Routes>
          {/* Público / usuario autenticado básico */}
          <Route path="/" element={<Navigate to="/pass" replace />} />
          <Route path="/pass" element={<MyPassScreen />} />
          <Route path="/scan" element={<ScannerScreen />} />
          <Route path="/dash" element={<DashboardLive />} />
          <Route path="/login" element={<LoginScreen />} />

          {/* Página para instalar la PWA */}
          <Route path="/app" element={<DownloadAppScreen />} />

          {/* Rutas de administración (protegidas por AdminGuard) */}
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <AdminLayout />
              </AdminGuard>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="guests" element={<AdminGuests />} />
            <Route path="scanner" element={<AdminScanner />} />
            <Route path="event-new" element={<AdminEventNew />} />
            <Route path="share-app" element={<AdminShareApp />} />
          </Route>

          {/* 404 */}
          <Route
            path="*"
            element={<div className="p-4">404 - Página no encontrada</div>}
          />
        </Routes>
      </AppShell>
    </BrowserRouter>
  </React.StrictMode>
);

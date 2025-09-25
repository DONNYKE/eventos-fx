// src/main.tsx
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* UI de layout general */
import AppShell from "./ui/AppShell";

/* Rutas públicas/usuario */
import { MyPassScreen } from "./screens/MyPassScreen";
import { ScannerScreen } from "./screens/ScannerScreen";
import { DashboardLive } from "./screens/DashboardLive";
import DownloadAppScreen from "./screens/DownloadAppScreen";

/* Zona admin */
import AdminLayout from "./admin/AdminLayout";
import AdminOverview from "./admin/AdminOverview";
import AdminGuests from "./admin/AdminGuests";
import AdminShareApp from "./admin/AdminShareApp";
import AdminEventNew from "./admin/AdminEventNew";

/* Guards */
import { RequireAuth, RequireAdmin } from "./auth/Protected";

/* PWA */
import { registerSW } from "./pwa/registerSW";

/* Estilos */
import "./index.css";

registerSW();

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("No se encontró el elemento #root");
}

createRoot(rootEl).render(
  <BrowserRouter>
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/pass" replace />} />

        <Route path="/pass" element={<RequireAuth><MyPassScreen /></RequireAuth>} />
        <Route path="/scanner" element={<RequireAuth><ScannerScreen /></RequireAuth>} />
        <Route path="/dashboard" element={<RequireAuth><DashboardLive /></RequireAuth>} />

        {/* Página pública para instalar la app */}
        <Route path="/app" element={<DownloadAppScreen />} />

        {/* Admin */}
        <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
          <Route index element={<AdminOverview />} />
          <Route path="guests" element={<AdminGuests />} />
          <Route path="share" element={<AdminShareApp />} />
          <Route path="event-new" element={<AdminEventNew />} />
        </Route>

        <Route path="*" element={<Navigate to="/pass" replace />} />
      </Routes>
    </AppShell>
  </BrowserRouter>
);

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import InstallPWAButton from "./components/InstallPWAButton";
import AdminEventNew from "./admin/AdminEventNew"; // <-- el que corregimos

// Página simple para la raíz
function Home() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Eventos FX</h1>
      <InstallPWAButton />
      {/* aquí puedes poner enlaces o tu dashboard */}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Inicio */}
        <Route path="/" element={<Home />} />

        {/* Admin → Crear evento */}
        <Route path="/admin/event-new" element={<AdminEventNew />} />

        {/* Agrega aquí tus otras rutas:
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/login" element={<Login />} />
        */}
      </Routes>
    </BrowserRouter>
  );
}

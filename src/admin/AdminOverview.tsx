// src/admin/AdminOverview.tsx
import React from "react";
import { Link } from "react-router-dom";

// Ajusta a tu modelo; aquí mantengo la estructura típica que ya tienes
export default function AdminOverview() {
  // ... tu lógica original para traer el evento activo

  return (
    <div className="space-y-4">
      {/* Tarjeta del evento actual */}
      <div className="p-4 rounded-2xl border bg-white space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-gray-500">Evento</div>
            <div className="font-semibold uppercase">EVENTO FUXION FAMILIA X MOQUEGUA</div>
            <div className="text-xs text-gray-500">25/9/2025, 7:00:00 p. m.</div>
          </div>

          <div className="flex flex-col gap-2">
            {/* NUEVO: acceso directo al QR */}
            <Link to="/admin/share" className="px-3 py-2 rounded-xl border text-center">
              Ver QR
            </Link>
            <button className="px-3 py-2 rounded-xl border">Crear otro</button>
          </div>
        </div>

        {/* Aquí sigue tu imagen/banner del evento */}
        {/* ... tu contenido existente ... */}
      </div>

      {/* ... resto de tu overview ... */}
    </div>
  );
}

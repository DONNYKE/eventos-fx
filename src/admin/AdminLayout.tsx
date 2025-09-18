import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

export default function AdminLayout() {
  const { pathname } = useLocation();
  const isActive = (b: string) => pathname === b || pathname.startsWith(b + "/");
  const tab = (b: string) => `px-3 py-2 rounded-xl ${isActive(b) ? "bg-black text-white" : "bg-gray-100"}`;
  return (
    <div className="max-w-md mx-auto p-4">
      <div className="mb-3 flex gap-2">
        <Link className={tab("/admin")} to="/admin">Overview</Link>
        <Link className={tab("/admin/guests")} to="/admin/guests">Invitados</Link>
        <Link className={tab("/admin/scanner")} to="/admin/scanner">Escáner</Link>
        <Link className={tab("/admin/event-new")} to="/admin/event-new">+ Evento</Link>
      </div>
      <Outlet />
    </div>
  );
}

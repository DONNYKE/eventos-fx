// src/auth/Protected.tsx
import { Navigate } from "react-router-dom";
import { useRole } from "./useRole";

export function RequireAuth({ children }: { children: JSX.Element }) {
  const [session, setSession] = ((): any => { /* opcional */ }) as any;
  // Si ya usas un contexto de sesión, utilízalo. Si no, puedes usar getSession dentro de un gate.
  return children;
}

export function RequireAdmin({ children }: { children: JSX.Element }) {
  const role = useRole();
  if (!role) return <div className="p-6">Cargando…</div>;
  if (role !== "ADMIN") return <Navigate to="/pass" replace />;
  return children;
}

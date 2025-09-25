import { ReactNode } from "react";

/**
 * Placeholders simples; inserta aquí tu lógica real de sesión/roles si la tienes.
 */

export function RequireAuth({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

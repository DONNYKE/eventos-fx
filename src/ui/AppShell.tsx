// src/ui/AppShell.tsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

type Role = "ADMIN" | "SOCIO" | null;

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const nav = useNavigate();

  const [hasSession, setHasSession] = React.useState(false);
  const [role, setRole] = React.useState<Role>(null);
  const [loadingRole, setLoadingRole] = React.useState(true);

  // Carga inicial de sesión y rol + suscripción a cambios de auth
  React.useEffect(() => {
    let unsub: { subscription: { unsubscribe: () => void } } | null = null;

    const load = async () => {
      const { data } = await supabase.auth.getSession();
      const session = !!data.session;
      setHasSession(session);

      if (session) {
        setLoadingRole(true);
        const { data: prof } = await supabase
          .from("profiles")
          .select("app_role")
          .eq("id", data.session!.user.id)
          .single();
        setRole((prof?.app_role as Role) ?? "SOCIO");
        setLoadingRole(false);
      } else {
        setRole(null);
        setLoadingRole(false);
      }

      // escuchar cambios de autenticación
      unsub = supabase.auth.onAuthStateChange((_e, s) => {
        const logged = !!s;
        setHasSession(logged);
        if (!logged) {
          setRole(null);
          nav("/login");
        } else {
          (async () => {
            const { data: prof } = await supabase
              .from("profiles")
              .select("app_role")
              .eq("id", s.user.id)
              .single();
            setRole((prof?.app_role as Role) ?? "SOCIO");
          })();
        }
      });
    };

    load();
    return () => {
      unsub?.subscription?.unsubscribe();
    };
  }, [nav]);

  // helper para marcar la pestaña activa (soporta subrutas)
  const isActive = (base: string) =>
    pathname === base || pathname.startsWith(base + "/");

  const tabClass = (base: string) =>
    `px-3 py-2 rounded-xl ${isActive(base) ? "bg-black text-white" : "bg-gray-100"}`;

  return (
    <div className="min-h-dvh bg-gray-100">
      <nav className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-md mx-auto flex items-center justify-between p-3 gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Link className={tabClass("/pass")} to="/pass">Mi Pase</Link>
            <Link className={tabClass("/scan")} to="/scan">Escáner</Link>
            <Link className={tabClass("/dash")} to="/dash">Dashboard</Link>

            {/* Link al panel de administración solo para ADMIN */}
            {hasSession && !loadingRole && role === "ADMIN" && (
              <Link className={tabClass("/admin")} to="/admin">Admin</Link>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!hasSession ? (
              <Link className="px-3 py-2 rounded-xl border" to="/login">
                Entrar
              </Link>
            ) : (
              <button
                className="px-3 py-2 rounded-xl border"
                onClick={async () => {
                  await supabase.auth.signOut();
                  setRole(null);
                  nav("/login");
                }}
              >
                Salir
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-md mx-auto">{children}</main>
    </div>
  );
}

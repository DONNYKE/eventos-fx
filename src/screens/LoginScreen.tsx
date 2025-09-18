import React from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function LoginScreen() {
  const nav = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      nav("/pass"); // redirigir al pase tras login
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Iniciar sesión</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded-xl"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded-xl"
          />
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded-xl"
        >
          {loading ? "Ingresando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}

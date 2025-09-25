import React from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

/** Cliente Supabase local (evita depender de ../lib/api o supabaseClient) */
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

/** Convierte el valor de <input type="datetime-local"> a ISO UTC string. */
function toISOFromLocalInput(v: string): string | null {
  if (!v) return null;
  const d = new Date(v); // interpreta en tu zona local
  return isNaN(d.getTime()) ? null : d.toISOString(); // guarda en UTC
}

/** Devuelve "YYYY-MM-DDTHH:mm" (para defaultValue/min en <input type="datetime-local">) */
function toLocalInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EventNewScreen() {
  const nav = useNavigate();

  // form state
  const [name, setName] = React.useState("");
  const [venue, setVenue] = React.useState("");
  const [startAt, setStartAt] = React.useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 60);
    d.setSeconds(0, 0);
    return toLocalInputValue(d);
  });

  // flyer
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);

  // ui state
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [okMsg, setOkMsg] = React.useState<string | null>(null);

  // preview del flyer
  React.useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOkMsg(null);

    const titleSafe = (name ?? "").toString().trim();
    const locationSafe = (venue ?? "").toString().trim();
    if (!titleSafe) { setError("Ingresa el TÍTULO del evento."); return; }
    if (!startAt)   { setError("Selecciona FECHA y HORA de inicio."); return; }

    const start_iso = toISOFromLocalInput(startAt);
    if (!start_iso) { setError("Fecha/hora de inicio inválida."); return; }

    setSubmitting(true);
    try {
      // sesión (para created_by y para respetar RLS)
      const { data: sess } = await supabase.auth.getSession();
      if (!sess?.session) throw new Error("No has iniciado sesión.");
      const userId = sess.session.user.id;

      // 1) Crear evento (sin flyer aún)
      const payload = {
        title: titleSafe,                 // <- columna real
        location: locationSafe || null,   // <- columna real
        start_at: start_iso,              // <- ISO UTC
        is_active: true,
        created_by: userId,
      };
      console.log("INSERT events payload:", payload);

      const { data: ev, error: insErr } = await supabase
        .from("events")
        .insert(payload)
        .select("id")
        .single();

      if (insErr) throw insErr;
      const eventId = ev!.id as string;

      // 2) Subir flyer (opcional) y actualizar banner_url
      if (file) {
        const safeName = file.name.replace(/\s+/g, "_");
        const path = `${eventId}/${Date.now()}_${safeName}`;

        const up = await supabase.storage.from("event-flyers").upload(path, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type || "image/*",
        });
        if (up.error) {
          // No bloqueamos la creación del evento si falla el flyer
          console.warn("No se pudo subir el flyer:", up.error.message);
        } else {
          const publicUrl = supabase.storage.from("event-flyers").getPublicUrl(path).data.publicUrl;
          const { error: updErr } = await supabase
            .from("events")
            .update({ banner_url: publicUrl }) // columna real
            .eq("id", eventId);
          if (updErr) console.warn("No se pudo guardar banner_url:", updErr.message);
        }
      }

      setOkMsg("✅ Evento creado correctamente.");
      setTimeout(() => nav("/admin"), 600);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "No se pudo crear el evento.");
    } finally {
      setSubmitting(false);
    }
  }

  const minLocal = toLocalInputValue(new Date());

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold mb-3">Crear evento</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Título */}
        <div>
          <label className="block text-sm mb-1">Título</label>
          <input
            className="w-full border px-3 py-2 rounded-xl"
            placeholder="Ej. Presentación mensual"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        {/* Lugar (opcional) */}
        <div>
          <label className="block text-sm mb-1">Lugar</label>
          <input
            className="w-full border px-3 py-2 rounded-xl"
            placeholder="Ej. Auditorio Central"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            disabled={submitting}
          />
        </div>

        {/* Fecha y hora de inicio */}
        <div>
          <label className="block text-sm mb-1">Inicio (fecha y hora)</label>
          <input
            type="datetime-local"
            className="w-full border px-3 py-2 rounded-xl"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            min={minLocal}
            disabled={submitting}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Se guarda en UTC (ISO). Lo que ves aquí está en tu hora local.
          </p>
        </div>

        {/* Flyer */}
        <div>
          <label className="block text-sm mb-1">Flyer (opcional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            disabled={submitting}
          />
          {preview && (
            <img src={preview} alt="Preview flyer" className="mt-2 rounded-2xl border" />
          )}
        </div>

        {/* Mensajes */}
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {okMsg && <div className="text-green-600 text-sm">{okMsg}</div>}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-black text-white py-2 rounded-xl"
        >
          {submitting ? "Creando…" : "Crear evento"}
        </button>
      </form>

      <div className="mt-4 text-xs text-gray-500">
        <p>
          Requisitos: bucket <code>event-flyers</code> en Storage (público). Si falla la subida,
          el evento igual se crea y podrás editar el banner luego.
        </p>
      </div>
    </div>
  );
}

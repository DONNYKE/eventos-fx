import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

/** Convierte el valor de <input type="datetime-local"> a ISO UTC string. */
function toISOFromLocalInput(v: string): string | null {
  if (!v) return null;
  // v = "YYYY-MM-DDTHH:mm" en hora local; lo convertimos a Date local y luego a ISO
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

/** Devuelve un string "YYYY-MM-DDTHH:mm" (para setear defaultValue/min en inputs) */
function toLocalInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const DEFAULT_ZONES = ["GENERAL", "VIP"];

export default function EventNewScreen() {
  const nav = useNavigate();

  // form state
  const [name, setName] = React.useState("");
  const [venue, setVenue] = React.useState("");
  const [zonesText, setZonesText] = React.useState(DEFAULT_ZONES.join(","));

  // fecha/hora (datetime-local)
  const now = React.useMemo(() => new Date(), []);
  const defaultStart = React.useMemo(() => {
    const d = new Date(now);
    d.setMinutes(d.getMinutes() + 60); // por defecto, dentro de 1 hora
    d.setSeconds(0, 0);
    return toLocalInputValue(d);
  }, [now]);

  const defaultEnd = React.useMemo(() => {
    const d = new Date(now);
    d.setMinutes(d.getMinutes() + 60 + 180); // fin 3h después del inicio por defecto
    d.setSeconds(0, 0);
    return toLocalInputValue(d);
  }, [now]);

  const [startAt, setStartAt] = React.useState(defaultStart);
  const [endAt, setEndAt] = React.useState(defaultEnd);

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

    // Validaciones
    if (!name.trim())         return setError("Ingresa el nombre del evento.");
    if (!startAt)             return setError("Selecciona fecha y hora de inicio.");
    if (!start_iso) return setError("Fecha/hora de inicio inválida.");
// Eliminamos fin y zonas porque no existen en la tabla


    setSubmitting(true);
    try {
      // sesión
      const { data: sess } = await supabase.auth.getSession();
      if (!sess?.session) throw new Error("No has iniciado sesión.");
      const userId = sess.session.user.id;

      // 1) Crear evento SIN flyer aún
      const { data: ev, error: insErr } = await supabase
  .from("events")
  .insert({
    title: name.trim(),                 // <- antes name
    location: venue.trim() || null,     // <- antes venue
    start_at: start_iso,                // OK
    is_active: true,                    // opcional, default true
    created_by: userId,                 // OK
  })
  .select("id")
  .single();

      if (insErr) throw insErr;
      const eventId = ev!.id as string;

      // 2) Subir flyer (opcional)
      if (file) {
        const safeName = file.name.replace(/\s+/g, "_");
        const path = `${eventId}/${Date.now()}_${safeName}`;
        const up = await supabase.storage.from("event-flyers").upload(path, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type || "image/*",
        });
        if (up.error) throw up.error;

        const publicUrl = supabase.storage.from("event-flyers").getPublicUrl(path).data.publicUrl;

        const { error: updErr } = await supabase
  .from("events")
  .update({ banner_url: publicUrl }) // tu columna real
  .eq("id", eventId);


        if (updErr) throw updErr;
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

  // min: no permitir seleccionar pasado
  const minLocal = toLocalInputValue(new Date());

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold mb-3">Crear evento</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm mb-1">Nombre</label>
          <input
            className="w-full border px-3 py-2 rounded-xl"
            placeholder="Ej. Fiesta Aniversario"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting}
          />
        </div>

        {/* Lugar */}
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

        {/* Fecha y hora */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Inicio (fecha y hora)</label>
            <input
              type="datetime-local"
              className="w-full border px-3 py-2 rounded-xl"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              min={minLocal}
              disabled={submitting}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Fin (fecha y hora)</label>
            <input
              type="datetime-local"
              className="w-full border px-3 py-2 rounded-xl"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              min={startAt || minLocal}
              disabled={submitting}
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 -mt-2">
          Las horas se guardan en UTC (ISO). Lo que ves aquí está en tu zona horaria local.
        </p>

        {/* Zonas */}
        <div>
          <label className="block text-sm mb-1">Zonas (separadas por coma)</label>
          <input
            className="w-full border px-3 py-2 rounded-xl"
            placeholder="GENERAL, VIP"
            value={zonesText}
            onChange={(e) => setZonesText(e.target.value)}
            disabled={submitting}
          />
          <p className="text-xs text-gray-500 mt-1">
            Se guardan como arreglo JSON: ej. <code>["GENERAL","VIP"]</code>
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
          Requisitos: bucket <code>event-flyers</code> en Storage con policies para que
          ADMIN pueda subir/actualizar, y RLS en <code>events</code> que permita INSERT
          a ADMIN.
        </p>
      </div>
    </div>
  );
}

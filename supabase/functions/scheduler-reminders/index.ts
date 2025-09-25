// supabase/functions/scheduler-reminders/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { serviceClient, json, bad } from "../_shared/mod.ts";

type Target = {
  user_id: string;
  fcm_token: string;
  event_id: string;
  title: string;
  start_at: string; // ISO
  days_left: number; // 3, 2 o 1
};

async function sendFcmBatch(messages: any[]) {
  // Envío directo al endpoint de FCM HTTP v1 (usando clave vieja de server) o con tu Cloud Function.
  // Opción simple: usar el endpoint legacy (clave de servidor FCM, si la tienes):
  const FCM_KEY = Deno.env.get("FCM_SERVER_KEY");
  if (!FCM_KEY) throw new Error("Falta FCM_SERVER_KEY");

  const res = await fetch("https://fcm.googleapis.com/fcm/send", {
    method: "POST",
    headers: {
      "Authorization": `key=${FCM_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ registration_ids: messages.map(m => m.to), notification: messages[0]?.notification, data: messages[0]?.data }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`FCM error: ${res.status} ${txt}`);
  }
  return res.json();
}

serve(async (req) => {
  // CORS opcional
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }
  if (req.method !== "POST") return bad("Use POST", 405);

  try {
    const sb = serviceClient();

    // Hora de referencia en Lima
    const now = new Date(); // correrás 09:00 Lima con el scheduler
    const dayMs = 24 * 3600 * 1000;

    // Cargamos eventos próximos (hasta 3 días)
    // Nota: trabajamos en UTC en DB: traemos [mañana..+3 días] con tolerancia
    const in3 = new Date(now.getTime() + 3 * dayMs);
    const in2 = new Date(now.getTime() + 2 * dayMs);
    const in1 = new Date(now.getTime() + 1 * dayMs);

    // Traer eventos activos (start_at entre (now, now+4d)) para no escanear toda la tabla
    const { data: events, error: evErr } = await sb
      .from("events")
      .select("id, title, start_at, is_active")
      .eq("is_active", true)
      .gt("start_at", now.toISOString())
      .lt("start_at", new Date(now.getTime() + 4 * dayMs).toISOString());

    if (evErr) return bad(`Error events: ${evErr.message}`, 500);
    if (!events?.length) return json({ ok: true, sent: 0, info: "No hay eventos próximos (<= 3 días)." });

    // Obtener attendances confirmadas (will_attend = true) para esos eventos
    const eventIds = events.map((e: any) => e.id);
    const { data: atts, error: atErr } = await sb
      .from("attendances")
      .select("event_id, user_id, will_attend")
      .in("event_id", eventIds)
      .eq("will_attend", true);

    if (atErr) return bad(`Error attendances: ${atErr.message}`, 500);
    if (!atts?.length) return json({ ok: true, sent: 0, info: "No hay confirmados." });

    // Tokens FCM de esos usuarios
    const userIds = Array.from(new Set(atts.map((a: any) => a.user_id)));
    const { data: tokens, error: tkErr } = await sb
      .from("push_tokens")
      .select("user_id, fcm_token")
      .in("user_id", userIds);

    if (tkErr) return bad(`Error tokens: ${tkErr.message}`, 500);
    if (!tokens?.length) return json({ ok: true, sent: 0, info: "No hay tokens FCM." });

    // Construir targets por 3/2/1 días
    const targets: Target[] = [];
    for (const ev of events) {
      const start = new Date(ev.start_at);
      const diffDays = Math.ceil((start.getTime() - now.getTime()) / dayMs); // 1,2,3...
      if (![1,2,3].includes(diffDays)) continue;

      const attendees = atts.filter((a: any) => a.event

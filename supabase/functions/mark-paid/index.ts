// supabase/functions/mark-paid/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { serviceClient, signQR, json, bad, required } from "../_shared/mod.ts";

serve(async (req) => {
  if (req.method !== "POST") return bad("Use POST", 405);
  try {
    const sb = serviceClient();
    const body = await req.json();
    required(body, ["event_id", "user_id"]);
    const { event_id, user_id } = body;

    // 1) Trae el evento para calcular exp
    const { data: ev, error: evErr } = await sb.from("events").select("id,start_at").eq("id", event_id).single();
    if (evErr || !ev) return bad("Evento no encontrado", 404);

    const startAt = new Date(ev.start_at);
    // expira 6 horas después del inicio del evento
    const exp = Math.floor((startAt.getTime() / 1000) + 6 * 3600);
    const iat = Math.floor(Date.now() / 1000);
    const jti = crypto.randomUUID();

    // 2) Upsert pago + genera token
    const token = await signQR({ sub: user_id, ev: event_id, jti, iat, exp });

    const { data: att, error: attErr } = await sb
      .from("attendances")
      .upsert({
        event_id,
        user_id,
        paid: true,
        paid_at: new Date().toISOString(),
        qr_token: token,
      }, { onConflict: "event_id,user_id" })
      .select()
      .single();

    if (attErr) return bad(`No se pudo marcar pago: ${attErr.message}`, 500);
    return json({ ok: true, attendance: att, qr_token: token });
  } catch (e) {
    return bad(String(e), 400);
  }
});

// supabase/functions/scan-qr/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { serviceClient, verifyQR, json, bad } from "../_shared/mod.ts";

serve(async (req) => {
  if (req.method !== "POST") return bad("Use POST", 405);
  try {
    const { token } = await req.json();
    if (!token) return bad("Falta token");

    // 1) Verificar firma y exp
    let payload: any;
    try {
      payload = await verifyQR(token); // { sub, ev, jti, iat, exp }
    } catch {
      return bad("QR inválido o expirado", 401);
    }

    const user_id = payload.sub as string;
    const event_id = payload.ev as string;

    const sb = serviceClient();

    // 2) Marcar uso atómico: solo si coincide el token y aun no usado
    const { data, error } = await sb
      .from("attendances")
      .update({ qr_used: true, qr_used_at: new Date().toISOString() })
      .eq("event_id", event_id)
      .eq("user_id", user_id)
      .eq("qr_token", token)
      .eq("qr_used", false)
      .select("id, user_id, event_id, paid, qr_used")
      .single();

    if (error) return bad("No válido: ya usado, no pagado o no coincide", 409);

    // (Opcional) puedes verificar también que paid sea true (aunque por diseño llega así)
    if (!data.paid) return bad("No válido: falta pago", 403);

    return json({ ok: true, attendance_id: data.id });
  } catch (e) {
    return bad(String(e), 400);
  }
});

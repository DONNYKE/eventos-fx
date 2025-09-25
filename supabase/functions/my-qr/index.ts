// supabase/functions/my-qr/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { userClient, json, bad, required } from "../_shared/mod.ts";

serve(async (req) => {
  if (req.method !== "POST") return bad("Use POST", 405);
  try {
    const sb = userClient(req);
    const body = await req.json();
    required(body, ["event_id"]);
    const { event_id } = body;

    // ¿Quién es el usuario?
    const { data: { user }, error: uErr } = await sb.auth.getUser();
    if (uErr || !user) return bad("No autenticado", 401);

    // Busca su asistencia
    const { data: att, error: attErr } = await sb
      .from("attendances")
      .select("paid, qr_token")
      .eq("event_id", event_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (attErr) return bad(attErr.message, 500);
    if (!att || !att.paid) return json({ paid: false, message: "Aún no tienes pago confirmado." });

    return json({ paid: true, qr_token: att.qr_token });
  } catch (e) {
    return bad(String(e), 400);
  }
});

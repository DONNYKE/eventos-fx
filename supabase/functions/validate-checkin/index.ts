import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);
const HMAC_SECRET = Deno.env.get("QR_TOKEN_SECRET")!;

async function hmac(input: string) {
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(HMAC_SECRET), {name:"HMAC", hash:"SHA-256"}, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(input));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2,"0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("", { headers: cors() });
  try {
    const { qr, deviceId, markPayment } = await req.json();
    if (!qr || !deviceId) return json({ error: "qr y deviceId requeridos" }, 400);

    const match = /^EVT:([a-f0-9-]+)\.([a-f0-9-]+)$/.exec(qr);
    if (!match) return json({ error: "QR inválido" }, 400);
    const [_, eventId, jti] = match;

    // 1) Buscar token por jti -> comparar hash
    const tokenHash = await hmac(jti);
    const { data: token, error: tokErr } = await supabase
      .from("ticket_tokens")
      .select("id, ticket_id, exp_at, used_at")
      .eq("token_hash", tokenHash)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (tokErr || !token) return json({ error: "Token no encontrado" }, 404);
    if (token.used_at)   return json({ error: "QR ya usado" }, 409);
    if (new Date(token.exp_at).getTime() < Date.now()) return json({ error: "QR expirado" }, 410);

    // 2) Traer ticket y validar que es del mismo evento
    const { data: ticket, error: tErr } = await supabase
      .from("tickets")
      .select("id, event_id, user_id, payment_status, checkin_status, price")
      .eq("id", token.ticket_id).single();
    if (tErr || !ticket) return json({ error: "Ticket inválido" }, 404);
    if (ticket.event_id !== eventId) return json({ error: "QR de otro evento" }, 400);

    // 3) Marcar uso del token + check-in (transacción ligera)
    const nowIso = new Date().toISOString();

    const updates: any = { checkin_status: "CHECKED_IN", checkin_at: nowIso };
    let paymentInserted = null;

    // si viene marcar pago y aún está PENDING
    if (markPayment && ticket.payment_status === "PENDING") {
      const { method, amount } = markPayment;
      const pay = await supabase.from("payments").insert({
        ticket_id: ticket.id,
        method,
        amount,
        status: "PAID",
        txn_id: `MANUAL-${Date.now()}`
      }).select("*").single();
      if (!pay.error) {
        paymentInserted = pay.data;
        updates.payment_status = "PAID";
        updates.payment_method = method;
      }
    }

    const { error: up1 } = await supabase.from("tickets").update(updates).eq("id", ticket.id);
    if (up1) return json({ error: "No se pudo actualizar ticket" }, 500);

    const { error: up2 } = await supabase.from("ticket_tokens")
      .update({ used_at: nowIso, device_first: deviceId })
      .eq("id", token.id);
    if (up2) return json({ error: "No se pudo cerrar token" }, 500);

    return json({
      ok: true,
      ticket_id: ticket.id,
      user_id: ticket.user_id,
      payment_status: updates.payment_status ?? ticket.payment_status,
      checkin_at: nowIso,
      payment: paymentInserted
    }, 200);

  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };
}
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: cors() });
}

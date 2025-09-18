// Deno Deploy (Supabase Edge Functions)
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const HMAC_SECRET = Deno.env.get("QR_TOKEN_SECRET")!; // pon uno largo

const supabase = createClient(supabaseUrl, serviceKey);

function hmacSHA256(input: string, key: string) {
  const enc = new TextEncoder();
  const cryptoKey = crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return cryptoKey.then(k =>
    crypto.subtle.sign("HMAC", k, enc.encode(input))
  ).then(sig => {
    const bytes = new Uint8Array(sig);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("", { headers: cors() });

  try {
    const authHeader = req.headers.get("authorization") || "";
    const jwt = authHeader.replace("Bearer ", "");

    const { ticketId } = await req.json();
    if (!ticketId) return json({ error: "ticketId requerido" }, 400);

    // 1) Traer ticket + user para validar dueño
    const { data: ticket, error: te } = await supabase
      .from("tickets").select("id, event_id, user_id")
      .eq("id", ticketId).single();
    if (te || !ticket) return json({ error: "Ticket no existe" }, 404);

    // 2) Validar que el que llama sea dueño o admin (consultando perfiles vía JWT)
    const userCheck = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${jwt}` }
    }).then(r => r.ok ? r.json() : null);

    if (!userCheck?.id) return json({ error: "No autenticado" }, 401);

    const callerId = userCheck.id;
    const appRole = userCheck.app_metadata?.app_role ?? "SOCIO";
    if (callerId !== ticket.user_id && appRole !== "ADMIN") {
      return json({ error: "No autorizado" }, 403);
    }

    // 3) Generar JTI + hash
    const jti = crypto.randomUUID();
    const tokenHash = await hmacSHA256(jti, HMAC_SECRET);
    const expAt = new Date(Date.now() + 1000 * 60 * 60 * 12); // 12 horas (ajusta)

    // 4) Insert token y set qr_last_token_id
    const { data: tok, error: ti } = await supabase
      .from("ticket_tokens")
      .insert({ ticket_id: ticketId, jti, token_hash: tokenHash, exp_at: expAt.toISOString() })
      .select("id").single();
    if (ti) return json({ error: "No se pudo crear token" }, 500);

    await supabase.from("tickets")
      .update({ qr_last_token_id: tok.id })
      .eq("id", ticketId);

    // 5) QR string que irá en el código
    const qrPayload = `EVT:${ticket.event_id}.${jti}`;

    return json({ ok: true, qr: qrPayload, jti, exp_at: expAt }, 200);
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

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Para producción, valida firma del proveedor (ej. X-Signature) aquí.
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("", { headers: cors() });

  try {
    const body = await req.json(); // payload del proveedor
    // Normaliza campos (depende del gateway). Ejemplo genérico:
    const provider = body.provider || (body?.data?.object ? "CULQI" : "MP");
    const status   = body.status     || body?.data?.outcome_type || body?.type;
    const txnId    = body.id         || body?.data?.id;

    // Debes mapear qué ticket_id corresponde a este pago.
    // Recomendado: al crear la "preferencia" o "cargo", envía metadata con ticket_id.
    const ticketId = body?.metadata?.ticket_id
                  || body?.data?.metadata?.ticket_id
                  || null;

    if (!ticketId) return json({ error: "metadata.ticket_id ausente" }, 400);

    // Marca pago como PAID si corresponde
    const okPaid = /approved|success|paid/i.test(String(status));

    const { data: payment } = await supabase
      .from("payments")
      .insert({
        ticket_id: ticketId,
        method: provider === "MP" ? "MP" : "CULQI",
        amount: Number(body?.amount || body?.data?.amount || 0) / (body?.amount ? 100 : 1),
        currency: (body?.currency || body?.data?.currency || "PEN").toUpperCase(),
        status: okPaid ? "PAID" : "FAILED",
        txn_id: txnId,
        raw: body
      })
      .select("*").single();

    if (okPaid) {
      await supabase.from("tickets").update({
        payment_status: "PAID",
        payment_method: payment.method
      }).eq("id", ticketId);
    }

    return json({ ok: true }, 200);
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

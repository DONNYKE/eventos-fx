// supabase/functions/_shared/mod.ts
import { createClient as createSbClient } from "https://esm.sh/@supabase/supabase-js@2";
import { create, verify, getNumericDate, Header, Payload } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

export function serviceClient() {
  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createSbClient(url, key, { auth: { persistSession: false } });
}

export function userClient(req: Request) {
  const url = Deno.env.get("SUPABASE_URL")!;
  const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? "anon"; // opcional si la tienes
  // Propaga el token del usuario desde el header Authorization
  const headers: Record<string, string> = {};
  const auth = req.headers.get("Authorization");
  if (auth) headers["Authorization"] = auth;
  return createSbClient(url, anon, {
    global: { headers },
    auth: { persistSession: false },
  });
}

const QR_SECRET = Deno.env.get("QR_JWT_SECRET")!;
export async function signQR(payload: Payload) {
  const header: Header = { alg: "HS256", typ: "JWT" };
  return await create(header, payload, QR_SECRET);
}
export async function verifyQR(token: string) {
  return await verify(token, QR_SECRET, "HS256");
}

export function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), { status: 200, headers: { "content-type": "application/json", ...init.headers }, ...init });
}
export function bad(msg: string, status = 400) { return json({ error: msg }, { status }); }
export function required(body: any, keys: string[]) {
  for (const k of keys) if (body?.[k] == null) throw new Error(`Missing field: ${k}`);
}

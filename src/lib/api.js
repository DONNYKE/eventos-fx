// src/lib/api.ts
import { supabase } from "./supabaseClient";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
/**
 * Devuelve el access_token del usuario autenticado
 * (necesario para autorizar llamadas a Edge Functions).
 */
async function getAccessToken() {
    const { data, error } = await supabase.auth.getSession();
    if (error)
        throw error;
    const token = data.session?.access_token;
    if (!token)
        throw new Error("No hay sesión activa");
    return token;
}
/**
 * Llama a la Edge Function que emite un token de QR
 * Debe responder algo como: { qr: string, exp_at: string }
 */
export async function issueQrToken(ticketId) {
    const token = await getAccessToken();
    const url = `${SUPABASE_URL}/functions/v1/issue-qr-token`;
    const res = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ ticketId }),
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`issue-qr-token failed: ${res.status} ${text}`);
    }
    return res.json();
}
/**
 * Llama a la Edge Function que valida un check-in
 * (ejemplo: { ok: true } o { ok: false, reason: '...' })
 */
export async function validateCheckin(qrPayload) {
    const token = await getAccessToken();
    const url = `${SUPABASE_URL}/functions/v1/validate-checkin`;
    const res = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ qr: qrPayload }),
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`validate-checkin failed: ${res.status} ${text}`);
    }
    return res.json();
}

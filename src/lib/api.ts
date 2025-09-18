export type PaymentMethod = "EFECTIVO" | "YAPE" | "PLIN" | "CULQI" | "MP";


export async function issueQrToken(ticketId: string) {
const token = await getAccessToken();
if (!token) throw new Error("No autenticado");
const url = `${SUPABASE_URL}/functions/v1/issue-qr-token`;
const res = await fetch(url, {
method: "POST",
headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
body: JSON.stringify({ ticketId })
});
if (!res.ok) throw new Error(await res.text());
return res.json() as Promise<{ ok: boolean; qr: string; jti: string; exp_at: string }>;
}


export async function validateCheckin(params: {
qr: string;
deviceId: string;
markPayment?: { method: PaymentMethod; amount: number };
}) {
const token = await getAccessToken();
if (!token) throw new Error("No autenticado");
const url = `${SUPABASE_URL}/functions/v1/validate-checkin`;
const res = await fetch(url, {
method: "POST",
headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
body: JSON.stringify(params)
});
if (!res.ok) throw new Error(await res.text());
return res.json() as Promise<{
ok: boolean;
ticket_id: string;
user_id: string;
payment_status: "PENDING" | "PAID" | "WAIVED";
checkin_at: string;
payment?: any;
}>;
}
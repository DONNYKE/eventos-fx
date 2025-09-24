import type { Handler } from "@netlify/functions";

const SUPABASE_FUNC_URL = "https://mcvlemslgzmlzfdfuiyl.supabase.co/scheduler-reminders";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const handler: Handler = async () => {
  const res = await fetch(SUPABASE_FUNC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SERVICE_KEY}`
    },
    body: "{}"
  });
  const data = await res.text();
  return { statusCode: 200, body: data };
};

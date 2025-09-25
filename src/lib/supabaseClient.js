import { createClient } from "@supabase/supabase-js";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export async function getAccessToken() {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
}
export async function requireUser() {
    const { data } = await supabase.auth.getUser();
    return data.user ?? null;
}

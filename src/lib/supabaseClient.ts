import { createClient, type User } from "@supabase/supabase-js";


const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;


export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


export async function getAccessToken(): Promise<string | null> {
const { data } = await supabase.auth.getSession();
return data.session?.access_token ?? null;
}


export async function requireUser(): Promise<User | null> {
const { data } = await supabase.auth.getUser();
return data.user ?? null;
}
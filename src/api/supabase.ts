import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_API_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL and Key are required for TitraSmart 3D persistence.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

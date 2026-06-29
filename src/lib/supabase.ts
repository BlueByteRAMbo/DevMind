// ============================================================
// DevMind — Supabase Client
// Uses VITE_ env vars (safe to expose anon key in browser).
// Service role key ONLY lives in Vercel env / api/ serverless.
// ============================================================

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const isPlaceholder = (v: string) =>
  !v || v.includes("your-project") || v.includes("your-anon-key") || v.includes("placeholder");

if (isPlaceholder(supabaseUrl) || isPlaceholder(supabaseAnonKey)) {
  console.error(
    "[DevMind] ⚠️  VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY are missing or still set to " +
    "placeholder values in .env.local. Auth will not work until you add your real Supabase credentials. " +
    "Go to supabase.com/dashboard → Settings → API to get them."
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);

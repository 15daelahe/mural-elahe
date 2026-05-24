"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Retorna `null` se as env vars estão ausentes (útil em dev/preview antes
 * de configurar Supabase). Chamadas devem tratar o null com graça.
 */
export function createSupabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

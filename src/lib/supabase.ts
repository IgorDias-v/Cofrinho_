"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { env, hasSupabase } from "./env";

/**
 * Cliente do Supabase no navegador (chave pública). As regras de acesso (RLS) garantem
 * que cada pessoa só lê e altera os próprios dados. Sem as variáveis no .env, o app
 * continua no modo local (localStorage).
 */
let client: SupabaseClient<Database> | null = null;

export function supabase(): SupabaseClient<Database> {
  if (!hasSupabase) throw new Error("Supabase não configurado (.env).");
  client ??= createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true, storageKey: "cofrinho:auth" },
  });
  return client;
}

export { hasSupabase };

/**
 * Variáveis públicas (seguras no navegador). Chaves secretas — SUPABASE_SERVICE_ROLE_KEY,
 * OPENAI_API_KEY — nunca devem ser lidas aqui: só em código de servidor.
 */
export const env = {
  plus: process.env.NEXT_PUBLIC_PLUS !== "false",
  /** true = Fatura/Assistente chamam /api/* (OpenAI no servidor). false = simulados no front. */
  useApi: process.env.NEXT_PUBLIC_USE_API === "true",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
};

/** true quando o Supabase estiver configurado — até lá, os dados ficam no localStorage. */
export const hasSupabase = Boolean(env.supabaseUrl && env.supabaseAnonKey);

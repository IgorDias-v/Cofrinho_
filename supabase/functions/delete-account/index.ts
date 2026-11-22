// Cofrinho — apaga a conta de quem chamou (e todos os dados dela).
// Roda no servidor do Supabase com a service role; o navegador só manda o token da sessão.
// Ordem: identifica o usuário pelo token → apaga os arquivos dele no storage (faturas/{id}/…)
// → auth.admin.deleteUser(id). As tabelas apagam em cascata a partir de auth.users.
// A conta de demonstração não pode ser apagada por aqui.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.119.2";

const DEMO_EMAIL = "lucas@cofrinho.app";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json(405, { error: "Método não permitido." });

  const url = Deno.env.get("SUPABASE_URL")!;
  const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const authHeader = req.headers.get("Authorization") ?? "";

  // 1. Quem está pedindo (pelo token da própria pessoa)
  const asUser = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
  const { data: { user }, error } = await asUser.auth.getUser();
  if (error || !user) return json(401, { error: "Entre na conta para apagar." });
  if (user.email?.toLowerCase() === DEMO_EMAIL) return json(403, { error: "A conta de demonstração não pode ser apagada." });

  const admin = createClient(url, service, { auth: { persistSession: false } });

  // 2. Arquivos no storage (SQL não apaga arquivos)
  const { data: files } = await admin.storage.from("faturas").list(user.id, { limit: 1000 });
  if (files?.length) {
    const { error: rmError } = await admin.storage.from("faturas").remove(files.map((f) => `${user.id}/${f.name}`));
    if (rmError) return json(500, { error: "Não deu para apagar os arquivos. Tente de novo." });
  }

  // 3. A conta (perfil, cartões, lançamentos, metas… vão juntos em cascata)
  const { error: delError } = await admin.auth.admin.deleteUser(user.id);
  if (delError) return json(500, { error: "Não deu para apagar a conta. Tente de novo." });

  return json(200, { ok: true });
});

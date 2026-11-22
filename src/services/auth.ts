import type { User } from "@/lib/types";
import { DEMO_ACCOUNT } from "@/lib/data";
import { supabase } from "@/lib/supabase";

/**
 * Autenticação por e-mail e senha — SIMULADA no front (localStorage).
 *
 * Integração futura com Supabase Auth (mesmas assinaturas):
 *   signUp → supabase.auth.signUp({ email, password, options: { data: { name } } })
 *   signIn → supabase.auth.signInWithPassword({ email, password })
 *   signOut → supabase.auth.signOut()
 *   getSession → supabase.auth.getSession()
 * A senha aqui é guardada só como hash SHA-256, apenas para o protótipo.
 */

const ACCOUNTS = "cofrinho:accounts";
const SESSION = "cofrinho:session";

type Account = { name: string; email: string; hash: string };

export class AuthError extends Error {
  constructor(public field: "name" | "email" | "password" | "form", message: string) {
    super(message);
  }
}

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function read(): Record<string, Account> {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS) ?? "{}");
  } catch {
    return {};
  }
}
function write(a: Record<string, Account>) {
  try {
    localStorage.setItem(ACCOUNTS, JSON.stringify(a));
  } catch {}
}

/** Garante que a conta de demonstração exista (dados de exemplo do briefing). */
async function ensureDemo() {
  const all = read();
  const key = DEMO_ACCOUNT.email;
  if (!all[key]) {
    all[key] = { name: DEMO_ACCOUNT.name, email: key, hash: await sha256(DEMO_ACCOUNT.password) };
    write(all);
  }
}

const normEmail = (e: string) => e.trim().toLowerCase();
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function signUp(name: string, email: string, password: string): Promise<User> {
  await wait(500);
  await ensureDemo();
  const all = read();
  const key = normEmail(email);
  if (all[key]) throw new AuthError("email", "Já existe uma conta com esse e-mail. Entre com sua senha.");
  all[key] = { name: name.trim(), email: key, hash: await sha256(password) };
  write(all);
  setSession(key);
  return { name: name.trim(), email: key };
}

export async function signIn(email: string, password: string): Promise<User> {
  await wait(500);
  await ensureDemo();
  const acc = read()[normEmail(email)];
  if (!acc || acc.hash !== (await sha256(password))) throw new AuthError("form", "E-mail ou senha incorretos.");
  setSession(acc.email);
  return { name: acc.name, email: acc.email };
}

/**
 * Entrada livre (modo protótipo): não confere senha.
 * Se o e-mail já tem conta, entra nela; senão entra na conta de demonstração.
 * Remover quando o Supabase Auth entrar.
 */
export async function enterFree(email?: string): Promise<User> {
  await ensureDemo();
  const acc = email ? read()[normEmail(email)] : undefined;
  const key = acc?.email ?? DEMO_ACCOUNT.email;
  setSession(key);
  return acc ? { name: acc.name, email: acc.email } : { name: DEMO_ACCOUNT.name, email: DEMO_ACCOUNT.email };
}

/** Cadastro livre: cria a conta com o que foi digitado, sem exigir nada. Sem nome/e-mail, entra na demo. */
export async function signUpFree(name: string, email: string): Promise<User> {
  await ensureDemo();
  const key = normEmail(email);
  if (!name.trim() || !key) return enterFree();
  const all = read();
  if (!all[key]) {
    all[key] = { name: name.trim(), email: key, hash: "" };
    write(all);
  }
  setSession(key);
  return { name: all[key].name, email: key };
}

/** Atualiza o nome da conta. Supabase: supabase.from("profiles").update({ name }). */
export function updateName(email: string, name: string) {
  const all = read();
  const key = normEmail(email);
  if (all[key]) {
    all[key] = { ...all[key], name: name.trim() };
    write(all);
  }
}

/**
 * Apaga a conta e encerra a sessão.
 * Supabase: Edge Function com service role → auth.admin.deleteUser(id); as tabelas apagam em cascata.
 */
export function deleteAccount(email: string) {
  const all = read();
  delete all[normEmail(email)];
  write(all);
  signOut();
}

export function signOut() {
  try {
    localStorage.removeItem(SESSION);
  } catch {}
}

export function getSession(): User | null {
  try {
    const email = localStorage.getItem(SESSION);
    if (!email) return null;
    const acc = read()[email];
    return acc ? { name: acc.name, email: acc.email } : null;
  } catch {
    return null;
  }
}

function setSession(email: string) {
  try {
    localStorage.setItem(SESSION, email);
  } catch {}
}

export const isDemo = (email: string) => normEmail(email) === DEMO_ACCOUNT.email;

/* ───────────── Supabase Auth (usado quando o .env tem o Supabase) ───────────── */

type SbUser = { id: string; email?: string; user_metadata?: { name?: string }; app_metadata?: Record<string, unknown> };
const fromSb = (u: SbUser): User => ({
  id: u.id,
  email: u.email ?? "",
  name: u.user_metadata?.name ?? "",
  isAdmin: u.app_metadata?.role === "admin",
});

const AUTH_MESSAGES: [RegExp, string][] = [
  [/invalid login credentials/i, "E-mail ou senha incorretos."],
  [/email not confirmed/i, "Confirme seu e-mail pelo link que enviamos e tente de novo."],
  [/already registered|already been registered/i, "Já existe uma conta com esse e-mail. Entre com sua senha."],
  [/password should be at least|weak password/i, "Use uma senha com pelo menos 6 caracteres."],
  [/rate limit|too many/i, "Muitas tentativas. Espere um pouco e tente de novo."],
  [/invalid.*email|unable to validate email/i, "Confira o e-mail."],
];
function authError(message: string, field: AuthError["field"] = "form") {
  const hit = AUTH_MESSAGES.find(([re]) => re.test(message));
  return new AuthError(field, hit ? hit[1] : "Não deu para entrar. Tente de novo.");
}

export async function sbSession(): Promise<User | null> {
  const { data } = await supabase().auth.getSession();
  return data.session ? fromSb(data.session.user) : null;
}

export async function sbSignIn(email: string, password: string): Promise<User> {
  const { data, error } = await supabase().auth.signInWithPassword({ email: normEmail(email), password });
  if (error || !data.user) throw authError(error?.message ?? "");
  return fromSb(data.user);
}

/** Cria a conta. Se o projeto exigir confirmação de e-mail, volta sem sessão (`user: null`). */
export async function sbSignUp(name: string, email: string, password: string): Promise<{ user: User | null }> {
  const { data, error } = await supabase().auth.signUp({
    email: normEmail(email),
    password,
    options: { data: { name: name.trim() }, emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined },
  });
  if (error) throw authError(error.message);
  return { user: data.session && data.user ? fromSb(data.user) : null };
}

export async function sbSignOut() {
  await supabase().auth.signOut();
}

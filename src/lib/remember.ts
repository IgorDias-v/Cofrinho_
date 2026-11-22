"use client";

/**
 * "Salvar senha neste aparelho".
 * Marcado: a sessão fica no localStorage (continua entrando depois de fechar o navegador),
 * o e-mail fica preenchido e o navegador oferece guardar a senha no gerenciador dele.
 * Desmarcado: a sessão vai para o sessionStorage e some ao fechar a aba.
 * O app nunca guarda a senha por conta própria.
 */
const KEY = "cofrinho:lembrar";
const EMAIL_KEY = "cofrinho:email";

function safe<T>(fn: () => T, fallback: T): T {
  try { return fn(); } catch { return fallback; }
}

export const getRemember = () => safe(() => localStorage.getItem(KEY) !== "0", true);
export const getSavedEmail = () => safe(() => localStorage.getItem(EMAIL_KEY) ?? "", "");

export function setRemember(on: boolean, email?: string) {
  safe(() => {
    localStorage.setItem(KEY, on ? "1" : "0");
    if (on && email) localStorage.setItem(EMAIL_KEY, email);
    if (!on) localStorage.removeItem(EMAIL_KEY);
  }, undefined);
}

/** Pede ao navegador para guardar a senha (Chrome/Edge/Android). Nos outros, o próprio form já aciona. */
export async function offerToSavePassword(email: string, password: string, name?: string) {
  const w = window as unknown as { PasswordCredential?: new (d: { id: string; password: string; name?: string }) => Credential };
  if (!w.PasswordCredential || !navigator.credentials?.store) return;
  try { await navigator.credentials.store(new w.PasswordCredential({ id: email, password, name })); } catch { /* o navegador recusou: tudo bem */ }
}

/** Armazenamento da sessão do Supabase que segue a escolha acima. */
export const sessionStorageAdapter = {
  getItem: (k: string) => safe(() => localStorage.getItem(k) ?? sessionStorage.getItem(k), null),
  setItem: (k: string, v: string) => safe(() => {
    if (getRemember()) { localStorage.setItem(k, v); sessionStorage.removeItem(k); }
    else { sessionStorage.setItem(k, v); localStorage.removeItem(k); }
  }, undefined),
  removeItem: (k: string) => safe(() => { localStorage.removeItem(k); sessionStorage.removeItem(k); }, undefined),
};

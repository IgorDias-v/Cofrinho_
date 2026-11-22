"use client";

import { BUDGETS } from "@/lib/data";
import type { Database } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import type { State } from "@/lib/store";
import type { Card, CategoryId, Goal, GoalMove, Tx, User } from "@/lib/types";

/*
 * Dados no Supabase. Cada ação do reducer (src/lib/store.tsx) vira uma escrita aqui.
 * O front continua com os mesmos tipos; a conversão para as colunas fica neste arquivo.
 * Mapa completo: docs/BANCO.md e INTEGRACAO.md.
 */

type Row<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
type Category = Database["public"]["Enums"]["category"];

/** Erro do banco com a mensagem pronta para o toast (as funções SQL já falam português). */
export class DbError extends Error {}

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new DbError(res.error.message);
  return res.data;
}

/* ───────── Conversões banco ↔ front ───────── */

const toCard = (c: Row<"cards">): Card => ({
  id: c.id, nickname: c.nickname, last4: c.last4, color: c.color, limit: Number(c.credit_limit),
  faturaBase: Number(c.fatura_base), dueInDays: c.due_in_days,
});

const toTx = (t: Row<"transactions">): Tx => ({
  id: t.id, name: t.name, category: t.category as CategoryId,
  method: t.method === "card" && t.card_id ? t.card_id : t.method,
  date: t.date, amount: Number(t.amount), income: t.income, source: t.source,
});

const toGoal = (g: Row<"goals">): Goal => ({
  id: g.id, name: g.name, saved: Number(g.saved), target: Number(g.target), due: g.due ?? undefined, icon: g.icon,
});

const toMove = (m: Row<"goal_movements">): GoalMove => ({ id: m.id, goalId: m.goal_id, amount: Number(m.amount), date: m.date });

/** `method` do front ("pix" | "dinheiro" | id do cartão) → colunas method + card_id. */
function payment(method: string): { method: Database["public"]["Enums"]["payment_method"]; card_id: string | null } {
  return method === "pix" || method === "dinheiro" ? { method, card_id: null } : { method: "card", card_id: method };
}

/* ───────── Leitura ───────── */

/** Carrega tudo da pessoa logada (o RLS já filtra pelo usuário). */
export async function loadAll(user: User): Promise<State> {
  const db = supabase();
  const [profile, cards, txs, budgets, goals, moves] = await Promise.all([
    db.from("profiles").select("*").maybeSingle(),
    db.from("cards").select("*").order("created_at"),
    db.from("transactions").select("*").order("date", { ascending: false }),
    db.from("budgets").select("*"),
    db.from("goals").select("*").order("created_at"),
    db.from("goal_movements").select("*").order("date", { ascending: false }),
  ]);
  const p = check(profile);
  const caps = new Map((check(budgets) ?? []).map((b) => [b.category as CategoryId, Number(b.cap)]));
  return {
    opening: Number(p?.opening_balance ?? 0),
    txs: (check(txs) ?? []).map(toTx),
    cards: (check(cards) ?? []).map(toCard),
    // sempre as categorias do app; sem linha no banco = sem teto
    budgets: BUDGETS.map((b) => ({ category: b.category, cap: caps.get(b.category) ?? 0 })),
    monthCap: Number(p?.month_cap ?? 0),
    goals: (check(goals) ?? []).map(toGoal),
    goalMoves: (check(moves) ?? []).map(toMove),
    user: { ...user, name: p?.name || user.name },
    hidden: p?.hide_balance ?? false,
  };
}

/* ───────── Escrita (uma por ação) ───────── */

export type RemoteAction =
  | { type: "tx/save"; tx: Tx }
  | { type: "tx/delete"; id: string }
  | { type: "card/save"; card: Card }
  | { type: "card/delete"; id: string }
  | { type: "budget/set"; category: CategoryId; cap: number }
  | { type: "monthCap/set"; cap: number }
  | { type: "goal/save"; goal: Goal }
  | { type: "goal/delete"; id: string }
  | { type: "move/save"; move: GoalMove; isNew: boolean }
  | { type: "move/delete"; id: string }
  | { type: "user/rename"; name: string }
  | { type: "hidden/set"; hidden: boolean };

/**
 * Grava a ação no banco. Devolve true quando o banco gerou algo novo (ex.: id de um movimento)
 * e o estado precisa ser recarregado.
 */
export async function persist(a: RemoteAction, userId: string): Promise<boolean> {
  const db = supabase();
  switch (a.type) {
    case "tx/save": {
      const t = a.tx;
      check(await db.from("transactions").upsert({
        id: t.id, user_id: userId, name: t.name, category: t.category as Category, ...payment(t.method),
        amount: t.amount, income: !!t.income, source: t.source ?? "manual", date: t.date,
      }));
      return false;
    }
    case "tx/delete":
      check(await db.from("transactions").delete().eq("id", a.id));
      return false;
    case "card/save": {
      const c = a.card;
      check(await db.from("cards").upsert({
        id: c.id, user_id: userId, nickname: c.nickname, last4: c.last4, color: c.color,
        credit_limit: c.limit, fatura_base: c.faturaBase, due_in_days: c.dueInDays,
      }));
      return false;
    }
    case "card/delete":
      // o banco mantém as compras e muda o pagamento para "dinheiro" (trigger)
      check(await db.from("cards").delete().eq("id", a.id));
      return false;
    case "budget/set":
      if (a.cap > 0) check(await db.from("budgets").upsert({ user_id: userId, category: a.category as Category, cap: a.cap }));
      else check(await db.from("budgets").delete().eq("category", a.category as Category));
      return false;
    case "monthCap/set":
      check(await db.from("profiles").update({ month_cap: a.cap }).eq("id", userId));
      return false;
    case "user/rename":
      check(await db.from("profiles").update({ name: a.name }).eq("id", userId));
      return false;
    case "hidden/set":
      check(await db.from("profiles").update({ hide_balance: a.hidden }).eq("id", userId));
      return false;
    case "goal/save": {
      const g = a.goal;
      check(await db.from("goals").upsert({ id: g.id, user_id: userId, name: g.name, target: g.target, due: g.due ?? null, icon: g.icon }));
      return false;
    }
    case "goal/delete":
      check(await db.rpc("delete_goal", { p_id: a.id }));
      return false;
    case "move/save":
      check(await db.rpc("save_goal_movement", {
        p_goal_id: a.move.goalId, p_amount: a.move.amount, p_date: a.move.date, p_id: a.isNew ? undefined : a.move.id,
      }));
      return a.isNew; // id gerado pelo banco
    case "move/delete":
      check(await db.rpc("delete_goal_movement", { p_id: a.id }));
      return false;
  }
}

/* ───────── Fatura: arquivo no storage + importação ───────── */

/** Guarda o arquivo da fatura em faturas/{user}/… e registra a importação. Devolve o id. */
export async function saveInvoiceFile(file: File, userId: string, info: { total: number; dueInDays?: number }): Promise<string> {
  const db = supabase();
  const id = crypto.randomUUID();
  const safe = file.name.normalize("NFD").replace(/[^\w.-]+/g, "-").slice(-80) || "fatura";
  const path = `${userId}/${id}-${safe}`;
  check(await db.storage.from("faturas").upload(path, file, { contentType: file.type, upsert: false }));
  check(await db.from("invoice_imports").insert({
    id, user_id: userId, file_path: path, file_name: file.name.slice(0, 120), mime_type: file.type, size_bytes: file.size,
    status: "lida", total: info.total, due_in_days: info.dueInDays ?? null,
  }));
  return id;
}

/** Cria os lançamentos da fatura de uma vez (se um falhar, nenhum entra). */
export async function importInvoice(importId: string, items: { name: string; amount: number; category: CategoryId }[], cardId: string | null, date: string) {
  return check(await supabase().rpc("import_invoice", { p_import_id: importId, p_items: items, p_card_id: cardId ?? undefined, p_date: date }));
}

/* ───────── Conta ───────── */

/** Apaga a conta e tudo dela (Edge Function `delete-account`, com service role no servidor). */
export async function deleteAccountRemote() {
  const res = await supabase().functions.invoke("delete-account", { method: "POST" });
  if (res.error) throw new DbError("Não deu para apagar a conta. Tente de novo.");
}

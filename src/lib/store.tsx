"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { BUDGETS, CATEGORY_ORDER, GOALS, HISTORY, MONTH_CAP, seedCards, seedGoalMoves, seedOpening, seedTransactions } from "./data";
import type { Budget, Card, CategoryId, Goal, GoalMove, Sheet, Tx, User, View } from "./types";
import { uid } from "./format";
import { env, hasSupabase } from "./env";
import { deleteAccount as deleteAuthAccount, getSession, isDemo, sbSession, sbSignOut, signOut, updateName } from "@/services/auth";
import { deleteAccountRemote, loadAll, persist, type RemoteAction } from "@/services/db";

/*
 * Persistência: Supabase quando o .env tem NEXT_PUBLIC_SUPABASE_URL/ANON_KEY (src/services/db.ts);
 * sem isso, localStorage. Antes: localStorage, uma chave por conta (cofrinho:data:<email>).
 * Para o Supabase, troque loadData/saveData pelas tabelas (profiles, transactions, cards, budgets, goals, goal_movements)
 * — o reducer e as telas não mudam.
 */

/* ───────────── Dados (o que a pessoa digitou) ───────────── */

export type State = {
  opening: number;
  txs: Tx[];
  cards: Card[];
  budgets: Budget[];
  monthCap: number;
  goals: Goal[];
  goalMoves: GoalMove[];
  user: User;
  hidden: boolean;
};

export type Action =
  | { type: "load"; state: State }
  | { type: "tx/save"; tx: Tx }
  | { type: "tx/delete"; id: string }
  | { type: "tx/import"; txs: Tx[] }
  | { type: "card/save"; card: Card }
  | { type: "card/delete"; id: string }
  | { type: "budget/set"; category: CategoryId; cap: number }
  | { type: "monthCap/set"; cap: number }
  | { type: "goal/save"; goal: Goal }
  | { type: "goal/delete"; id: string }
  | { type: "move/save"; move: GoalMove }
  | { type: "move/delete"; id: string }
  | { type: "user/rename"; name: string }
  | { type: "hidden/toggle" }
  | { type: "reset" };

export function demoState(user: User): State {
  const txs = seedTransactions();
  return { opening: seedOpening(txs), txs, cards: seedCards(txs), budgets: BUDGETS, monthCap: MONTH_CAP, goals: GOALS, goalMoves: seedGoalMoves(), user, hidden: false };
}

export function emptyState(user: User): State {
  return {
    opening: 0,
    txs: [],
    cards: [],
    budgets: BUDGETS.map((b) => ({ ...b, cap: 0 })),
    monthCap: 0,
    goals: [],
    goalMoves: [],
    user,
    hidden: false,
  };
}

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "load":
      return a.state;
    case "tx/save": {
      const exists = s.txs.some((t) => t.id === a.tx.id);
      return { ...s, txs: exists ? s.txs.map((t) => (t.id === a.tx.id ? a.tx : t)) : [a.tx, ...s.txs] };
    }
    case "tx/delete":
      return { ...s, txs: s.txs.filter((t) => t.id !== a.id) };
    case "tx/import":
      return { ...s, txs: [...a.txs, ...s.txs] };
    case "card/save": {
      const exists = s.cards.some((c) => c.id === a.card.id);
      return { ...s, cards: exists ? s.cards.map((c) => (c.id === a.card.id ? a.card : c)) : [...s.cards, a.card] };
    }
    case "card/delete":
      // lançamentos do cartão continuam, passam a contar como "dinheiro"
      return {
        ...s,
        cards: s.cards.filter((c) => c.id !== a.id),
        txs: s.txs.map((t) => (t.method === a.id ? { ...t, method: "dinheiro" } : t)),
      };
    case "budget/set": {
      const has = s.budgets.some((b) => b.category === a.category);
      return {
        ...s,
        budgets: has
          ? s.budgets.map((b) => (b.category === a.category ? { ...b, cap: a.cap } : b))
          : [...s.budgets, { category: a.category, cap: a.cap }],
      };
    }
    case "monthCap/set":
      return { ...s, monthCap: a.cap };
    case "goal/save": {
      const exists = s.goals.some((g) => g.id === a.goal.id);
      return { ...s, goals: exists ? s.goals.map((g) => (g.id === a.goal.id ? a.goal : g)) : [...s.goals, a.goal] };
    }
    case "goal/delete": {
      const g = s.goals.find((x) => x.id === a.id);
      // o que estava guardado volta para o saldo
      return {
        ...s,
        opening: s.opening + (g?.saved ?? 0),
        goals: s.goals.filter((x) => x.id !== a.id),
        goalMoves: s.goalMoves.filter((m) => m.goalId !== a.id),
      };
    }
    case "move/save": {
      // novo movimento ou edição: aplica só a diferença no saldo e na meta
      const old = s.goalMoves.find((m) => m.id === a.move.id);
      const delta = a.move.amount - (old?.amount ?? 0);
      return {
        ...s,
        opening: s.opening - delta,
        goals: s.goals.map((g) => (g.id === a.move.goalId ? { ...g, saved: Math.max(0, g.saved + delta) } : g)),
        goalMoves: old ? s.goalMoves.map((m) => (m.id === a.move.id ? a.move : m)) : [a.move, ...s.goalMoves],
      };
    }
    case "move/delete": {
      // desfaz o movimento: o valor volta para onde estava
      const m = s.goalMoves.find((x) => x.id === a.id);
      if (!m) return s;
      return {
        ...s,
        opening: s.opening + m.amount,
        goals: s.goals.map((g) => (g.id === m.goalId ? { ...g, saved: Math.max(0, g.saved - m.amount) } : g)),
        goalMoves: s.goalMoves.filter((x) => x.id !== a.id),
      };
    }
    case "user/rename":
      return { ...s, user: { ...s.user, name: a.name } };
    case "hidden/toggle":
      return { ...s, hidden: !s.hidden };
    case "reset":
      return demoState(s.user);
  }
}

/* ───────────── Derivados ───────────── */

const sameMonth = (iso: string, ref: Date) => {
  const d = new Date(iso);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
};

export function derive(s: State) {
  const now = new Date();
  const expenses = s.txs.filter((t) => !t.income);
  const month = expenses.filter((t) => sameMonth(t.date, now));
  const monthTotal = month.reduce((sum, t) => sum + t.amount, 0);
  const balance = s.opening + s.txs.reduce((sum, t) => sum + (t.income ? t.amount : -t.amount), 0);

  const byCategory = CATEGORY_ORDER.map((category) => {
    const spent = month.filter((t) => t.category === category).reduce((sum, t) => sum + t.amount, 0);
    return { category, spent, share: monthTotal ? spent / monthTotal : 0 };
  })
    .filter((c) => c.spent > 0)
    .sort((a, b) => b.spent - a.spent);

  // histórico só existe na conta de demonstração
  const history = isDemo(s.user.email) ? HISTORY : [];
  const lastMonth = history[history.length - 1];
  const vsLast = lastMonth ? (monthTotal - lastMonth) / lastMonth : null;

  const budgets = s.budgets.map((b) => {
    const spent = month.filter((t) => t.category === b.category).reduce((sum, t) => sum + t.amount, 0);
    return { ...b, spent, pct: b.cap ? Math.min(100, Math.round((spent / b.cap) * 100)) : 0 };
  });

  const cards = s.cards.map((c) => {
    const fatura = c.faturaBase + month.filter((t) => t.method === c.id).reduce((sum, t) => sum + t.amount, 0);
    return { ...c, fatura, used: c.limit ? Math.min(100, Math.round((fatura / c.limit) * 100)) : 0 };
  });

  const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();
  const subscriptions = month.filter((t) => t.category === "assinaturas");

  return {
    now,
    balance,
    monthTotal,
    byCategory,
    vsLast,
    history: [...history, monthTotal],
    budgets,
    cards,
    leftToSpend: s.monthCap - monthTotal,
    daysLeft,
    subscriptions,
    totalSaved: s.goals.reduce((sum, g) => sum + g.saved, 0),
    recent: [...s.txs].sort((a, b) => +new Date(b.date) - +new Date(a.date)),
  };
}

export type Derived = ReturnType<typeof derive>;

/* ───────────── Persistência local ───────────── */

const dataKey = (email: string) => `cofrinho:data:${email}`;

function loadData(user: User): State {
  try {
    const raw = localStorage.getItem(dataKey(user.email));
    if (raw) return { ...emptyState(user), ...JSON.parse(raw), user };
  } catch {}
  return isDemo(user.email) ? demoState(user) : emptyState(user);
}

function saveData(s: State) {
  try {
    localStorage.setItem(dataKey(s.user.email), JSON.stringify(s));
  } catch {}
}

/* ───────────── Contexto ───────────── */

type Toast = { id: number; text: string };

type Ctx = {
  state: State;
  d: Derived;
  dispatch: React.Dispatch<Action>;
  view: View;
  go: (v: View) => void;
  back: () => void;
  sheet: Sheet | null;
  sheetClosing: boolean;
  openSheet: (s: Sheet) => void;
  closeSheet: () => void;
  toast: (text: string) => void;
  toasts: Toast[];
  plus: boolean;
  ready: boolean;
  session: User | null;
  login: (u: User) => Promise<void>;
  /** true quando os dados vêm do Supabase (e não do localStorage). */
  remote: boolean;
  logout: () => void;
  /** Atualiza o nome da conta (perfil). */
  rename: (name: string) => void;
  /** Apaga a conta e todos os dados dela, e sai. */
  deleteAccount: () => Promise<void>;
  /** Recarrega os dados do banco (modo Supabase). */
  refresh: () => Promise<void>;
};

const StoreCtx = createContext<Ctx | null>(null);
const GUEST: User = { name: "", email: "" };

/**
 * Estado inicial fixo — usado pelo Storybook (e testes) para abrir uma tela/folha já logado,
 * sem ler nem gravar o localStorage. No app, `initial` fica vazio e nada muda.
 */
export type StoreInitial = { session?: User | null; data?: "demo" | "empty"; view?: View; sheet?: Sheet | null };

export function StoreProvider({ children, initial }: { children: React.ReactNode; initial?: StoreInitial }) {
  const fixed = initial !== undefined;
  const remote = hasSupabase && !fixed;
  const [state, dispatch] = useReducer(reducer, GUEST, (g) =>
    initial?.session ? (initial.data === "empty" ? emptyState : demoState)(initial.session) : emptyState(g),
  );
  const [session, setSession] = useState<User | null>(initial?.session ?? null);
  const [ready, setReady] = useState(fixed);
  const [stack, setStack] = useState<View[]>([initial?.view ?? "home"]);
  const [sheet, setSheet] = useState<Sheet | null>(initial?.sheet ?? null);
  const [sheetClosing, setSheetClosing] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const openSheet = useCallback((s: Sheet) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setSheetClosing(false);
    setSheet(s);
  }, []);
  // fecha com animação de saída (220 ms) antes de desmontar
  const closeSheet = useCallback(() => {
    setSheetClosing(true);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setSheet(null);
      setSheetClosing(false);
    }, 220);
  }, []);
  // Recupera a sessão e os dados da conta depois de montar (evita diferença SSR/cliente).
  useEffect(() => {
    if (fixed) return;
    if (remote) {
      (async () => {
        try {
          const u = await sbSession();
          if (u) {
            const data = await loadAll(u);
            dispatch({ type: "load", state: data });
            setSession(data.user);
          }
        } catch {
          // sem rede ou sessão inválida: volta para a tela de entrar
        }
        setReady(true);
      })();
      return;
    }
    const u = getSession();
    if (u) {
      dispatch({ type: "load", state: loadData(u) });
      setSession(u);
    }
    setReady(true);
  }, [fixed, remote]);

  useEffect(() => {
    if (!fixed && !remote && ready && session && state.user.email === session.email) saveData(state);
  }, [state, ready, session, fixed, remote]);

  // Estado atual para a sincronização (sem recriar callbacks a cada mudança).
  const stateRef = useRef(state);
  stateRef.current = state;

  /** Recarrega tudo do banco (verdade do servidor). */
  const refresh = useCallback(async () => {
    const u = stateRef.current.user;
    if (!remote || !u.id) return;
    try {
      dispatch({ type: "load", state: await loadAll(u) });
    } catch {}
  }, [remote]);

  const login = useCallback(async (u: User) => {
    const data = fixed ? demoState(u) : remote ? await loadAll(u) : loadData(u);
    dispatch({ type: "load", state: data });
    setSession(data.user);
    setStack(["home"]);
    setSheet(null);
    window.scrollTo({ top: 0 });
  }, [fixed, remote]);

  const logout = useCallback(() => {
    if (remote) sbSignOut().catch(() => {});
    signOut();
    setSession(null);
    setSheet(null);
    setStack(["home"]);
    dispatch({ type: "load", state: emptyState(GUEST) });
  }, [remote]);

  const toastId = useRef(0);
  const toast = useCallback((text: string) => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  /**
   * dispatch das telas: atualiza a tela na hora e grava no banco em seguida.
   * Se o banco recusar, mostra o motivo e recarrega o que está salvo.
   */
  const act = useCallback((a: Action) => {
    const before = stateRef.current;
    dispatch(a);
    if (!remote || !before.user.id) return;
    const r = toRemote(a, before);
    if (!r) return;
    persist(r, before.user.id)
      .then((reload) => { if (reload) refresh(); })
      .catch((e: unknown) => {
        toast(e instanceof Error && e.message ? e.message : "Não deu para salvar. Tente de novo.");
        refresh();
      });
  }, [remote, refresh, toast]);

  const rename = useCallback((name: string) => {
    act({ type: "user/rename", name });
    setSession((u) => (u ? { ...u, name } : u));
    if (!fixed && !remote) updateName(state.user.email, name);
  }, [act, fixed, remote, state.user.email]);

  const deleteAccount = useCallback(async () => {
    if (remote) {
      try {
        await deleteAccountRemote();
      } catch (e) {
        toast(e instanceof Error ? e.message : "Não deu para apagar a conta.");
        return;
      }
    } else if (!fixed) {
      try { localStorage.removeItem(dataKey(state.user.email)); } catch {}
      deleteAuthAccount(state.user.email);
    }
    logout();
  }, [fixed, remote, state.user.email, logout, toast]);

  const go = useCallback((v: View) => {
    setSheet(null);
    setStack((st) => (v === "home" ? ["home"] : st[st.length - 1] === v ? st : [...st, v]));
    window.scrollTo({ top: 0 });
  }, []);
  const back = useCallback(() => {
    setStack((st) => (st.length > 1 ? st.slice(0, -1) : st));
    window.scrollTo({ top: 0 });
  }, []);

  const d = useMemo(() => derive(state), [state]);
  let view = stack[stack.length - 1];
  if (!env.plus && (view === "fatura" || view === "assistente")) view = "home";

  const value: Ctx = {
    state, d, dispatch: act, view, go, back, sheet, sheetClosing,
    openSheet,
    closeSheet,
    toast, toasts, plus: env.plus, ready, session, login, logout, rename, deleteAccount, remote, refresh,
  };
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

/** Ação do reducer → escrita no banco. `before` é o estado antes da ação. */
function toRemote(a: Action, before: State): RemoteAction | null {
  switch (a.type) {
    case "tx/save": case "tx/delete": case "card/save": case "card/delete":
    case "budget/set": case "monthCap/set": case "goal/save": case "goal/delete":
    case "move/delete": case "user/rename":
      return a;
    case "move/save":
      return { ...a, isNew: !before.goalMoves.some((m) => m.id === a.move.id) };
    case "hidden/toggle":
      return { type: "hidden/set", hidden: !before.hidden };
    default:
      return null; // load, reset e tx/import (a fatura grava pelo import_invoice)
  }
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore fora do StoreProvider");
  return ctx;
}

export const newId = uid;

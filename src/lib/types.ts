export type CategoryId =
  | "moradia"
  | "alimentacao"
  | "transporte"
  | "lazer"
  | "assinaturas"
  | "outros";

export type Tx = {
  id: string;
  name: string;
  category: CategoryId;
  /** id do cartão, ou "pix" / "dinheiro" */
  method: string;
  /** ISO date */
  date: string;
  /** positivo = valor do gasto (sempre exibido com "−"); entradas usam income */
  amount: number;
  income?: boolean;
  source?: "manual" | "fatura";
};

export type Card = {
  id: string;
  nickname: string;
  last4: string;
  color: "ciano" | "lima" | "menta";
  limit: number;
  /** parte da fatura que não veio de lançamentos digitados */
  faturaBase: number;
  dueInDays: number;
};

export type Budget = { category: CategoryId; cap: number };

export type Goal = {
  id: string;
  name: string;
  saved: number;
  target: number;
  due?: string;
  icon: "plane" | "shield" | "book" | "car" | "target";
};

/** Movimento de uma meta: guardar (valor positivo) ou retirar (valor negativo). */
export type GoalMove = {
  id: string;
  goalId: string;
  /** positivo = guardou; negativo = retirou */
  amount: number;
  /** ISO date */
  date: string;
};

/** `id` existe quando a conta é do Supabase (auth.users.id). */
export type User = { name: string; email: string; id?: string; /** true = administrador (app_metadata.role, só o servidor altera) */ isAdmin?: boolean };

export type View = "home" | "cartoes" | "metas" | "objetivos" | "fatura" | "assistente";

export type Sheet =
  | { kind: "adicionar"; txId?: string }
  | { kind: "conta" }
  | { kind: "cartao"; cardId?: string }
  | { kind: "teto"; category: CategoryId }
  | { kind: "tetoMes" }
  | { kind: "guardar"; goalId: string; mode?: "guardar" | "retirar"; moveId?: string }
  | { kind: "meta"; goalId?: string };

export type Insight = { context: string; value: string; consequence: string };

export type FaturaItem = {
  name: string;
  amount: number;
  category: CategoryId;
  subscription?: boolean;
};

export type FaturaResult = {
  items: FaturaItem[];
  total: number;
  dueInDays?: number;
};

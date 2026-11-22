import { CATEGORIES } from "./data";
import type { Derived, State } from "./store";

/** Resumo enxuto dos dados da pessoa — vai para o servidor como contexto do assistente. */
export function buildContext(s: State, d: Derived) {
  return {
    nome: s.user.name,
    saldo: round(d.balance),
    gastoNoMes: round(d.monthTotal),
    variacaoVsMesPassado: d.vsLast === null ? null : Math.round(d.vsLast * 100),
    tetoDoMes: s.monthCap,
    aindaPodeGastar: round(d.leftToSpend),
    diasRestantes: d.daysLeft,
    porCategoria: d.byCategory.map((c) => ({ categoria: CATEGORIES[c.category].label, valor: round(c.spent) })),
    tetos: d.budgets.map((b) => ({ categoria: CATEGORIES[b.category].label, teto: b.cap, gasto: round(b.spent), pct: b.pct })),
    cartoes: d.cards.map((c) => ({ apelido: c.nickname, fatura: round(c.fatura), limite: c.limit, usado: c.used, venceEmDias: c.dueInDays })),
    metas: s.goals.map((g) => ({ nome: g.name, guardado: g.saved, alvo: g.target, prazo: g.due ?? null })),
    lancamentos: d.recent.slice(0, 60).map((t) => ({
      nome: t.name,
      categoria: t.income ? "Entrada" : CATEGORIES[t.category].label,
      valor: t.income ? round(t.amount) : -round(t.amount),
      data: t.date.slice(0, 10),
    })),
  };
}

export type FinanceContext = ReturnType<typeof buildContext>;

const round = (v: number) => Math.round(v * 100) / 100;

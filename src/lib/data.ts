import type { GoalMove, Budget, Card, CategoryId, Goal, Tx, User } from "./types";

/** Mocks tipados — no estágio 1 são tratados como se a pessoa tivesse digitado. */

export const CATEGORIES: Record<CategoryId, { label: string; color: string; chip: string; ink: string; icon: string }> = {
  // color = fundo do círculo; chip = fundo + cor do ícone com contraste AA
  moradia: { label: "Moradia", color: "bg-esk-violet", chip: "bg-esk-violet text-white", ink: "text-[#A98BFF]", icon: "home" },
  alimentacao: { label: "Alimentação", color: "bg-esk-lima", chip: "bg-esk-lima text-esk-ink", ink: "text-esk-lima", icon: "bag" },
  transporte: { label: "Transporte", color: "bg-esk-ciano", chip: "bg-esk-ciano text-esk-ink", ink: "text-esk-ciano", icon: "bus" },
  lazer: { label: "Lazer", color: "bg-esk-orange", chip: "bg-esk-orange text-esk-ink", ink: "text-esk-orange", icon: "game" },
  assinaturas: { label: "Assinaturas", color: "bg-esk-coral", chip: "bg-esk-coral text-white", ink: "text-[#FF6A52]", icon: "repeat" },
  outros: { label: "Outros", color: "bg-esk-paper", chip: "bg-esk-paper text-esk-ink", ink: "text-white", icon: "card" },
};

export const CATEGORY_ORDER: CategoryId[] = ["moradia", "alimentacao", "transporte", "lazer", "assinaturas", "outros"];

export const USER: User = { name: "Lucas", email: "lucas@cofrinho.app" };

/** Conta de demonstração (só protótipo, sem servidor): abre com os dados de exemplo. */
export const DEMO_ACCOUNT = { ...USER, password: "cofrinho123" };

/** Gastos dos meses anteriores (Ago, Set, Out) para o gráfico e o comparativo. */
export const HISTORY = [2100, 2450, 2660];

export const BUDGETS: Budget[] = [
  { category: "alimentacao", cap: 774 },
  { category: "moradia", cap: 900 },
  { category: "transporte", cap: 800 },
  { category: "lazer", cap: 385 },
];
export const MONTH_CAP = 3200;

export const GOALS: Goal[] = [
  { id: "japao", name: "Viagem ao Japão", saved: 13600, target: 20000, due: "Dez 2027", icon: "plane" },
  { id: "reserva", name: "Reserva", saved: 7200, target: 10000, icon: "shield" },
  { id: "curso", name: "Curso", saved: 2700, target: 3000, icon: "book" },
  { id: "carro", name: "Carro novo", saved: 9600, target: 40000, icon: "car" },
];

/** Histórico de guardar/retirar da demo (parte do que já está em `saved`). */
export function seedGoalMoves(): GoalMove[] {
  const ago = (days: number) => new Date(Date.now() - days * 864e5).toISOString();
  return [
    { id: "m1", goalId: "japao", amount: 500, date: ago(2) },
    { id: "m2", goalId: "japao", amount: 1000, date: ago(12) },
    { id: "m3", goalId: "japao", amount: -300, date: ago(20) },
    { id: "m4", goalId: "reserva", amount: 400, date: ago(5) },
    { id: "m5", goalId: "curso", amount: 250, date: ago(9) },
  ];
}

/** Datas sempre dentro do mês atual, para os números do mock fecharem. */
function dayOfMonth(day: number, hour = 12, minute = 0) {
  const now = new Date();
  const d = Math.min(day, now.getDate());
  return new Date(now.getFullYear(), now.getMonth(), d, hour, minute).toISOString();
}

export function seedTransactions(): Tx[] {
  const t = (id: string, name: string, category: CategoryId, method: string, day: number, amount: number, hour = 12): Tx => ({
    id, name, category, method, date: dayOfMonth(day, hour), amount, source: "manual",
  });
  return [
    { id: "sal", name: "Salário", category: "outros", method: "pix", date: dayOfMonth(5, 9), amount: 6200, income: true, source: "manual" },
    t("alug", "Aluguel", "moradia", "pix", 5, 900, 10),
    t("merc", "Mercado", "alimentacao", "principal", 31, 182.4, 18),
    t("ifood", "iFood", "alimentacao", "salario", 20, 157.6, 20),
    t("rappi", "Rappi", "alimentacao", "principal", 14, 140, 21),
    t("uber", "Uber", "transporte", "principal", 19, 32, 8),
    t("comb", "Combustível", "transporte", "salario", 11, 288, 17),
    t("cine", "Cinema e jantar", "lazer", "principal", 15, 300, 22),
    t("netflix", "Netflix", "assinaturas", "principal", 30, 55.9, 7),
    t("spotify", "Spotify", "assinaturas", "principal", 8, 34.9, 7),
    t("icloud", "iCloud", "assinaturas", "principal", 8, 14.9, 7),
    t("acad", "Academia", "assinaturas", "principal", 2, 129.9, 7),
    t("yt", "YouTube Premium", "assinaturas", "principal", 3, 24.9, 7),
    t("disney", "Disney+", "assinaturas", "principal", 4, 79.5, 7),
  ];
}

/** Faturas de referência: Principal 1.284 · Salário 640 · Viagem 98. */
const FATURA_TARGET: Record<string, number> = { principal: 1284, salario: 640, viagem: 98 };

export function seedCards(txs: Tx[]): Card[] {
  const onCard = (id: string) => txs.filter((t) => !t.income && t.method === id).reduce((s, t) => s + t.amount, 0);
  const base = (id: string) => Math.max(0, Math.round((FATURA_TARGET[id] - onCard(id)) * 100) / 100);
  return [
    { id: "viagem", nickname: "Viagem", last4: "1180", color: "lima", limit: 1225, faturaBase: base("viagem"), dueInDays: 27 },
    { id: "salario", nickname: "Salário", last4: "6917", color: "menta", limit: 2460, faturaBase: base("salario"), dueInDays: 12 },
    { id: "principal", nickname: "Principal", last4: "4552", color: "ciano", limit: 2986, faturaBase: base("principal"), dueInDays: 8 },
  ];
}

/** Saldo inicial calculado para a home abrir em R$ 14.500. */
export function seedOpening(txs: Tx[]) {
  const net = txs.reduce((s, t) => s + (t.income ? t.amount : -t.amount), 0);
  return 14500 - net;
}

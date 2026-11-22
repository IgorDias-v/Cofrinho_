const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const plain = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const short = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });

/** R$ 1.284,00 (espaço normal, não nbsp, para casar com o design) */
export const brl = (v: number) => currency.format(v).replace(/ /g, " ");
/** 1.284,00 */
export const money = (v: number) => plain.format(v);
/** R$ 7.200 */
export const brlShort = (v: number) => `R$ ${short.format(v)}`;

/** "182,40" | "1.284,5" | "12" → number (NaN se inválido) */
export function parseMoney(input: string): number {
  const raw = input.replace(/[^\d,.-]/g, "");
  // "42.50" (ponto como decimal, sem vírgula) vale 42,50 — não 4.250
  const clean = !raw.includes(",") && /\.\d{1,2}$/.test(raw)
    ? raw.slice(0, raw.lastIndexOf(".")).replace(/\./g, "") + raw.slice(raw.lastIndexOf("."))
    : raw.replace(/\./g, "").replace(",", ".");
  if (!clean) return NaN;
  return Math.round(Number(clean) * 100) / 100;
}

const monthShort = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
export const monthLong = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
export const monthLabel = (m: number) => {
  const s = monthShort[(m + 12) % 12];
  return s[0].toUpperCase() + s.slice(1);
};

export function relativeDay(iso: string, now = new Date()): string {
  const d = new Date(iso);
  const day = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((day(now) - day(d)) / 86400000);
  if (diff === 0) return `hoje, ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  if (diff === 1) return "ontem";
  return `${d.getDate()} ${monthShort[d.getMonth()]}`;
}

export const toDateInput = (iso: string) => {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

/** uuid v4 — o mesmo formato das chaves do banco (Supabase). */
export const uid = () => crypto.randomUUID();

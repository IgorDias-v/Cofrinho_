import { env } from "@/lib/env";
import type { FaturaResult } from "@/lib/types";

/**
 * Leitura de fatura.
 * - NEXT_PUBLIC_USE_API=false (padrão): simulada no front.
 * - NEXT_PUBLIC_USE_API=true: envia para /api/fatura → OpenAI no servidor (app/api/fatura/route.ts).
 */
export async function readInvoice(file: File): Promise<FaturaResult> {
  if (env.useApi) {
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/fatura", { method: "POST", body });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error ?? "Não deu para ler a fatura.");
    return json as FaturaResult;
  }
  return mockInvoice(file);
}

async function mockInvoice(file: File): Promise<FaturaResult> {
  await wait(2600 + Math.random() * 900);
  if (!/pdf|image/.test(file.type)) throw new Error("Envie um PDF ou uma foto da fatura.");

  const subs: [string, number][] = [
    ["Netflix", 55.9], ["Spotify", 34.9], ["iCloud", 14.9], ["Academia", 129.9], ["YouTube Premium", 24.9], ["Disney+", 79.5],
  ];
  const buys: [string, number, FaturaResult["items"][number]["category"]][] = [
    ["Mercado Pão de Açúcar", 212.4, "alimentacao"], ["iFood", 48.9, "alimentacao"], ["Rappi", 36.5, "alimentacao"],
    ["Padaria", 18.7, "alimentacao"], ["Uber", 27.4, "transporte"], ["99", 19.8, "transporte"], ["Posto Shell", 150, "transporte"],
    ["Farmácia", 64.3, "outros"], ["Cinema", 56, "lazer"], ["Livraria", 42.9, "lazer"], ["Amazon", 89.9, "outros"],
    ["Restaurante", 72, "alimentacao"],
  ];
  const items: FaturaResult["items"] = [
    ...subs.map(([name, amount]) => ({ name, amount, category: "assinaturas" as const, subscription: true })),
    ...buys.map(([name, amount, category]) => ({ name, amount, category })),
  ];
  // completa até 34 compras com valores pequenos
  let n = 1;
  while (items.length < 34) items.push({ name: `Compra ${n++}`, amount: 4.6, category: "outros" });
  const sum = items.reduce((s, i) => s + i.amount, 0);
  // ajusta a última para o total bater com R$ 1.284,00
  items[items.length - 1].amount = Math.round((items[items.length - 1].amount + (1284 - sum)) * 100) / 100;

  return { items, total: 1284, dueInDays: 8 };
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

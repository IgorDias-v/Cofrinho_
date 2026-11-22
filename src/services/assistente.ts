import type { FinanceContext } from "@/lib/context";
import { env } from "@/lib/env";
import { brl } from "@/lib/format";
import type { Insight } from "@/lib/types";

export type ChatMessage = { role: "user" | "assistant"; content: string };
export type ChatReply = { text: string; insight?: Insight };

/**
 * Assistente.
 * - NEXT_PUBLIC_USE_API=false (padrão): simulado no front, mas com os dados reais do app.
 * - NEXT_PUBLIC_USE_API=true: envia para /api/assistente → OpenAI no servidor (app/api/assistente/route.ts).
 */
export async function askAssistant(messages: ChatMessage[], ctx: FinanceContext): Promise<ChatReply> {
  if (env.useApi) {
    const res = await fetch("/api/assistente", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, context: ctx }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error ?? "Não consegui responder agora.");
    return json as ChatReply;
  }
  return mockReply(messages, ctx);
}

async function mockReply(messages: ChatMessage[], ctx: FinanceContext): Promise<ChatReply> {
  await new Promise((r) => setTimeout(r, 900 + Math.random() * 700));
  const q = normalize(messages[messages.length - 1]?.content ?? "");

  // Só para validar o feedback de erro no protótipo: pergunte "simular erro".
  if (q.includes("simular erro")) throw new Error("Não consegui responder agora.");

  const delivery = ctx.lancamentos.filter((l) => /ifood|rappi|delivery|uber eats|james/i.test(l.nome) && l.valor < 0);
  const deliveryTotal = -delivery.reduce((s, l) => s + l.valor, 0);
  const trip = ctx.metas.find((m) => /viagem|japao|japão/i.test(m.nome)) ?? ctx.metas[0];

  if (/delivery|ifood|rappi|comida/.test(q)) {
    return {
      text: deliveryTotal
        ? `Foram ${brl(deliveryTotal)} em delivery este mês, em ${delivery.length} pedidos.`
        : "Você não registrou nenhum delivery este mês.",
    };
  }

  if (/guard|economi|viagem|meta|japao/.test(q) && trip) {
    const save = Math.max(50, Math.round((deliveryTotal * 0.4) / 10) * 10);
    const missing = Math.max(0, trip.alvo - trip.guardado);
    const monthsNow = Math.ceil(missing / 1000);
    const monthsNew = Math.ceil(missing / (1000 + save));
    return {
      text: "",
      insight: {
        context: "Reduzindo delivery, você guarda",
        value: `${brl(save)} / mês`,
        consequence: `${trip.nome} chega ${Math.max(1, monthsNow - monthsNew)} ${monthsNow - monthsNew > 1 ? "meses" : "mês"} antes.`,
      },
    };
  }

  if (/cart|limite|fatura/.test(q)) {
    const top = [...ctx.cartoes].sort((a, b) => b.usado - a.usado)[0];
    return { text: `O ${top.apelido} está com ${top.usado}% do limite usado (${brl(top.fatura)}). Vence em ${top.venceEmDias} dias.` };
  }

  if (/assinatura/.test(q)) {
    const subs = ctx.lancamentos.filter((l) => l.categoria === "Assinaturas");
    const total = -subs.reduce((s, l) => s + l.valor, 0);
    return { text: `Você tem ${subs.length} assinaturas somando ${brl(total)} por mês.` };
  }

  if (/quanto|gastei|gasto|mes/.test(q)) {
    const top = ctx.porCategoria[0];
    return {
      text: `Você gastou ${brl(ctx.gastoNoMes)} este mês${top ? `, a maior parte em ${top.categoria} (${brl(top.valor)})` : ""}. Ainda pode gastar ${brl(ctx.aindaPodeGastar)}.`,
    };
  }

  return { text: `Seu saldo é ${brl(ctx.saldo)} e você ainda pode gastar ${brl(ctx.aindaPodeGastar)} nos próximos ${ctx.diasRestantes} dias.` };
}

const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

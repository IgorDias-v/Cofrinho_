import { NextResponse } from "next/server";
import { OpenAINotConfigured, respondJSON } from "@/server/openai";
import type { ChatMessage, ChatReply } from "@/services/assistente";

/**
 * POST /api/assistente — EXEMPLO de chat com a OpenAI usando os dados da pessoa.
 * Body JSON: { messages: ChatMessage[], context: FinanceContext } → ChatReply
 * Só é chamada quando NEXT_PUBLIC_USE_API=true (veja src/services/assistente.ts).
 */
export const runtime = "nodejs";

const INSTRUCTIONS = `Você é o Assistente Cofrinho, de finanças pessoais, em PT-BR.
Use SOMENTE os dados do contexto (JSON) da pessoa. Nada de dica genérica, nada de coach.
Seja curto: número primeiro, consequência depois.
Responda SOMENTE com JSON:
{"text": string, "insight": {"context": string, "value": string, "consequence": string} | null}
Use "insight" quando a resposta for uma economia ou projeção (ex.: context "Reduzindo delivery, você guarda",
value "R$ 120,00 / mês", consequence "A viagem ao Japão chega 3 meses antes."). Nesse caso "text" pode ser "".`;

export async function POST(req: Request) {
  try {
    const { messages, context } = (await req.json()) as { messages?: ChatMessage[]; context?: unknown };
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Envie ao menos uma mensagem." }, { status: 400 });
    }

    const reply = await respondJSON<{ text: string; insight: ChatReply["insight"] | null }>({
      instructions: `${INSTRUCTIONS}\n\nContexto da pessoa:\n${JSON.stringify(context ?? {})}`,
      input: messages.slice(-12).map((m) => ({ role: m.role, content: String(m.content).slice(0, 2000) })),
    });

    return NextResponse.json({ text: reply.text ?? "", insight: reply.insight ?? undefined } satisfies ChatReply);
  } catch (e) {
    if (e instanceof OpenAINotConfigured) return NextResponse.json({ error: e.message }, { status: 503 });
    console.error("[api/assistente]", e);
    return NextResponse.json({ error: "Não consegui responder agora. Tente de novo." }, { status: 500 });
  }
}

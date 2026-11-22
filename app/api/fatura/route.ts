import { NextResponse } from "next/server";
import { OpenAINotConfigured, respondJSON, toDataUrl } from "@/server/openai";
import type { FaturaResult } from "@/lib/types";

/**
 * POST /api/fatura — EXEMPLO de leitura de fatura com a OpenAI.
 * Recebe multipart/form-data com o campo "file" (PDF ou imagem) e devolve um FaturaResult.
 * Só é chamada quando NEXT_PUBLIC_USE_API=true (veja src/services/fatura.ts).
 */
export const runtime = "nodejs";

const MAX_BYTES = 15 * 1024 * 1024;
const CATEGORIES = "moradia, alimentacao, transporte, lazer, assinaturas, outros";

const INSTRUCTIONS = `Você lê faturas de cartão de crédito brasileiras.
Responda SOMENTE com JSON no formato:
{"items":[{"name":string,"amount":number,"category":string,"subscription":boolean}],"total":number,"dueInDays":number|null}
- amount em reais, positivo, com ponto decimal.
- category deve ser uma de: ${CATEGORIES}.
- subscription=true para cobranças recorrentes (streaming, apps, academia).
- Ignore pagamentos, estornos, juros e linhas de saldo anterior.`;

export async function POST(req: Request) {
  try {
    const form = await req.formData().catch(() => null);
    const file = form?.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Envie um arquivo no campo 'file'." }, { status: 400 });
    if (file.size > MAX_BYTES) return NextResponse.json({ error: "Arquivo acima de 15 MB." }, { status: 413 });

    const isPdf = file.type === "application/pdf";
    const isImage = file.type.startsWith("image/");
    if (!isPdf && !isImage) return NextResponse.json({ error: "Envie um PDF ou uma foto da fatura." }, { status: 415 });

    const dataUrl = await toDataUrl(file);
    const result = await respondJSON<FaturaResult>({
      instructions: INSTRUCTIONS,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: "Extraia as compras desta fatura." },
            isPdf
              ? { type: "input_file", filename: file.name || "fatura.pdf", file_data: dataUrl }
              : { type: "input_image", image_url: dataUrl },
          ],
        },
      ],
    });

    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof OpenAINotConfigured) return NextResponse.json({ error: e.message }, { status: 503 });
    console.error("[api/fatura]", e);
    return NextResponse.json({ error: "Não deu para ler a fatura." }, { status: 500 });
  }
}

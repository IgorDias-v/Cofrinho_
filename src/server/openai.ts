import "server-only";

/**
 * Conexão com a API da OpenAI — SÓ SERVIDOR.
 * O import "server-only" faz o build falhar se este arquivo for importado no front,
 * então a OPENAI_API_KEY nunca chega ao navegador.
 *
 * Usa a Responses API via fetch (sem SDK): https://platform.openai.com/docs/api-reference/responses
 */

const API = "https://api.openai.com/v1/responses";

export class OpenAINotConfigured extends Error {
  constructor() {
    super("OPENAI_API_KEY não configurada no .env");
  }
}

type InputPart =
  | { type: "input_text"; text: string }
  | { type: "input_image"; image_url: string }
  | { type: "input_file"; filename: string; file_data: string };

type Message = { role: "user" | "assistant"; content: string | InputPart[] };

/** Chama o modelo e devolve o JSON da resposta já parseado. */
export async function respondJSON<T>({ instructions, input }: { instructions: string; input: Message[] }): Promise<T> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new OpenAINotConfigured();

  const res = await fetch(API, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      instructions,
      input,
      text: { format: { type: "json_object" } },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`OpenAI ${res.status}: ${detail.slice(0, 300)}`);
  }

  const data = (await res.json()) as { output?: { content?: { type: string; text?: string }[] }[] };
  const text = (data.output ?? [])
    .flatMap((o) => o.content ?? [])
    .filter((c) => c.type === "output_text")
    .map((c) => c.text ?? "")
    .join("");
  return JSON.parse(text) as T;
}

/** Converte um arquivo recebido no servidor em data URL base64. */
export async function toDataUrl(file: File) {
  const b64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  return `data:${file.type};base64,${b64}`;
}

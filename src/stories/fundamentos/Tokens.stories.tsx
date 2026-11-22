import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import tokens from "../../../design-tokens/tokens.json";

/**
 * Tokens lidos direto de `design-tokens/tokens.json` (a mesma fonte do Figma e do `TOKENS.md`).
 * Cada amostra usa a variável CSS de `tokens.css`, então o que aparece aqui é o valor real.
 */
const meta: Meta = {
  title: "Fundamentos/Tokens",
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj;

const P = tokens.primitives as Record<string, string | number>;
const S = tokens.semantic as unknown as Record<string, [string, string]>;
const cssVar = (n: string) => `--${n.replaceAll("/", "-")}`;
const keys = (prefix: string, src: Record<string, unknown>) => Object.keys(src).filter((k) => k.startsWith(prefix));
const groupOf = (k: string, depth: number) => k.split("/").slice(0, depth).join("/");

function Title({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-6">
      <h2 className="display text-[28px] font-semibold text-white">{children}</h2>
      {sub && <p className="mt-1 max-w-[720px] text-sm text-esk-muted">{sub}</p>}
    </div>
  );
}
const Code = ({ children }: { children: React.ReactNode }) => (
  <code className="rounded-md bg-esk-surface px-1.5 py-0.5 font-mono text-[12px] text-esk-lima">{children}</code>
);

export const CoresPrimitivas: Story = {
  name: "Cores · primitivas",
  render: () => {
    const groups = Object.groupBy(keys("color/", P), (k) => groupOf(k, 2));
    return (
      <div className="flex flex-col gap-8">
        <Title sub="Paleta bruta, sem significado. Não use direto no layout: use um token semântico.">Cores primitivas</Title>
        {Object.entries(groups).map(([g, list]) => (
          <section key={g}>
            <h3 className="kicker mb-3">{g.split("/")[1]}</h3>
            <div className="flex flex-wrap gap-3">
              {list!.map((k) => (
                <div key={k} className="w-[128px]">
                  <div className="h-[72px] rounded-2xl border border-esk-border" style={{ background: `var(${cssVar(k)})` }} />
                  <p className="mt-2 text-[13px] font-medium text-white">{k.split("/")[2]}</p>
                  <p className="text-xs text-esk-muted">{String(P[k])}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  },
};

function SemanticTable({ prefix, preview }: { prefix: string; preview: (k: string) => React.ReactNode }) {
  const groups = Object.groupBy(keys(prefix, S), (k) => (k.split("/").length > 2 ? groupOf(k, 2) : groupOf(k, 1)));
  return (
    <div className="flex flex-col gap-6">
      {Object.entries(groups).map(([g, list]) => (
        <section key={g} className="rounded-[28px] border border-[#1E1E1E] bg-esk-panel p-6">
          <h3 className="display mb-3 text-xl font-semibold text-white">{g}</h3>
          <table className="w-full text-left text-[13px]">
            <thead className="text-esk-muted">
              <tr>
                <th className="w-14 py-2 font-medium" />
                <th className="py-2 font-medium">Token</th>
                <th className="py-2 font-medium">CSS</th>
                <th className="py-2 font-medium">Alias</th>
                <th className="py-2 font-medium">Valor</th>
                <th className="py-2 font-medium">Uso</th>
              </tr>
            </thead>
            <tbody>
              {list!.map((k) => {
                const [alias, desc] = S[k];
                return (
                  <tr key={k} className="border-t border-esk-border align-middle">
                    <td className="py-2.5">{preview(k)}</td>
                    <td className="py-2.5 pr-4 font-medium text-white">{k}</td>
                    <td className="py-2.5 pr-4"><Code>{`var(${cssVar(k)})`}</Code></td>
                    <td className="py-2.5 pr-4 text-esk-muted">{alias}</td>
                    <td className="py-2.5 pr-4 text-white">{String(P[alias])}</td>
                    <td className="py-2.5 text-esk-muted">{desc}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}

export const CoresSemanticas: Story = {
  name: "Cores · semânticas",
  render: () => (
    <>
      <Title sub="Aliases dos primitivos que dizem ONDE usar cada cor. São os únicos tokens de cor para layout e componentes.">Cores semânticas</Title>
      <SemanticTable prefix="color/" preview={(k) => <span className="block size-9 rounded-[10px] border border-esk-track" style={{ background: `var(${cssVar(k)})` }} />} />
    </>
  ),
};

export const Espacamento: Story = {
  name: "Espaçamento",
  render: () => (
    <div className="flex flex-col gap-10">
      <div>
        <Title sub="Escala primitiva em px, incluindo gaps negativos (sobreposição de cartões).">Espaçamento primitivo</Title>
        <div className="flex flex-col gap-2">
          {keys("space/", P).map((k) => {
            const v = Number(P[k]);
            return (
              <div key={k} className="flex items-center gap-4">
                <span className="w-28 text-[13px] text-white">{k}</span>
                <span className="w-12 text-xs text-esk-muted">{v}px</span>
                <span className={`h-3 rounded-sm ${v < 0 ? "bg-[#FF6A52]" : "bg-esk-lima"}`} style={{ width: Math.max(2, Math.abs(v) * 2) }} />
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <Title>Espaçamento semântico</Title>
        <SemanticTable prefix="space/" preview={(k) => { const v = Number(P[S[k][0]]); return <span className={`block h-3 rounded-sm ${v < 0 ? "bg-[#FF6A52]" : "bg-esk-lima"}`} style={{ width: Math.max(2, Math.min(48, Math.abs(v))) }} />; }} />
      </div>
    </div>
  ),
};

export const Raio: Story = {
  render: () => (
    <>
      <Title sub="Pílulas e botões são sempre radius/pill; cartões 26, painéis 28, folhas 32, topo papel 36/44.">Raio</Title>
      <div className="mb-10 flex flex-wrap gap-4">
        {keys("radius/", S).map((k) => (
          <div key={k} className="w-[120px]">
            <div className="h-[88px] w-[120px] border border-esk-track bg-[#1C1C1E]" style={{ borderRadius: `var(${cssVar(k)})` }} />
            <p className="mt-2 text-[13px] font-medium text-white">{k.split("/")[1]}</p>
            <p className="text-xs text-esk-muted">{String(P[S[k][0]])}px</p>
          </div>
        ))}
      </div>
      <SemanticTable prefix="radius/" preview={(k) => <span className="block size-9 border border-esk-track bg-[#1C1C1E]" style={{ borderRadius: `min(var(${cssVar(k)}), 18px)` }} />} />
    </>
  ),
};

export const Tipografia: Story = {
  render: () => {
    const sizes = keys("font-size/", S);
    return (
      <>
        <Title sub="Inter Tight em títulos e números (font-family/display); Inter no texto (font-family/body).">Tipografia</Title>
        <div className="mb-10 flex flex-col gap-4">
          {sizes.map((k) => {
            const display = /display|heading/.test(k);
            return (
              <div key={k} className="flex items-baseline gap-6 border-b border-esk-border pb-4">
                <span className="w-40 flex-none text-[13px] text-esk-muted">{k.replace("font-size/", "")} · {String(P[S[k][0]])}px</span>
                <span
                  className={display ? "num text-white" : "text-white"}
                  style={{ fontSize: `var(${cssVar(k)})`, fontFamily: display ? "var(--font-display)" : "var(--font-sans)" }}
                >
                  {display ? "R$ 14.500,00" : "Mercado Pão de Açúcar · Alimentação"}
                </span>
              </div>
            );
          })}
        </div>
        <SemanticTable prefix="font-" preview={() => <span className="text-esk-muted">Aa</span>} />
        <div className="mt-6">
          <SemanticTable prefix="l" preview={() => <span className="text-esk-muted">Aa</span>} />
        </div>
      </>
    );
  },
};

export const Outros: Story = {
  name: "Tamanho, borda, opacidade, blur, movimento",
  render: () => (
    <div className="flex flex-col gap-6">
      <Title>Demais tokens semânticos</Title>
      {["size/", "border-width/", "opacity/", "blur/", "duration/", "breakpoint/"].map((p) => (
        <SemanticTable key={p} prefix={p} preview={() => <span className="block size-2 rounded-full bg-esk-lima" />} />
      ))}
    </div>
  ),
};

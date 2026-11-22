// Gera design-tokens/TOKENS.md e design-tokens/tokens.css a partir de design-tokens/tokens.json
// Uso: node scripts/build-tokens.mjs
import { readFileSync, writeFileSync } from 'node:fs';
const root = new URL('../design-tokens/', import.meta.url);
const t = JSON.parse(readFileSync(new URL('tokens.json', root), 'utf8'));
const cssName = (n) => '--' + n.replaceAll('/', '-');
const UNIT = { space: 'px', size: 'px', radius: 'px', 'border-width': 'px', blur: 'px', 'font-size': 'px', breakpoint: 'px', opacity: '%', 'line-height': '%', 'letter-spacing': '%', duration: 'ms' };
const fam = (n) => n.split('/')[0];
const show = (n, v) => (typeof v === 'number' ? `${v}${UNIT[fam(n)] ?? ''}` : v);
const cssVal = (n, v) => {
  const f = fam(n);
  if (typeof v === 'string') return f === 'font-family' ? `"${v}", system-ui, sans-serif` : v.length === 9 ? `#${v.slice(1)}` : v;
  if (f === 'opacity') return String(v / 100);
  if (f === 'line-height') return String(v / 100);
  if (f === 'letter-spacing') return `${(v / 100).toFixed(3).replace(/0+$/, '')}em`;
  if (f === 'font-weight') return String(v);
  if (f === 'radius' && v === 999) return '9999px';
  return `${v}${UNIT[f] ?? ''}`;
};
const swatch = () => "";
const groupBy = (keys, depth) => keys.reduce((m, k) => { const g = k.split('/').slice(0, depth(k)).join('/'); (m[g] ||= []).push(k); return m; }, {});

const P = t.primitives, S = t.semantic;
const pCount = Object.keys(P).length, sCount = Object.keys(S).length;
let md = `# Cofrinho · Design Tokens

> Fonte única: \`design-tokens/tokens.json\` · Figma: arquivo **W5**, página **2 - Design MVP**, coleções **primitives** e **semantic** e seção *Cofrinho · Design Tokens*.
> Gerado por \`node scripts/build-tokens.mjs\` — não edite este arquivo à mão.

**${pCount} primitivos · ${sCount} semânticos**

## Como funciona

| Camada | Coleção no Figma | Papel | Quem usa |
|---|---|---|---|
| Primitivos | \`primitives\` (modo \`value\`) | Valores brutos, sem significado (paleta, escalas). | Só os semânticos. Escondidos dos seletores do Figma (scopes vazios). |
| Semânticos | \`semantic\` (modo \`cofrinho\`) | Aliases que dizem **onde** usar cada valor. | Layouts, componentes e código. |

- **Nomenclatura kebab-case.** No Figma, \`/\` separa grupos; no código vira \`-\`: \`color/bg/canvas\` → \`var(--color-bg-canvas)\`. Todos os tokens já têm *code syntax* WEB configurado.
- **Negativos e decimais** usam palavras: \`space/neg-24\` = −24px, \`border-width/1-5\` = 1.5px, \`letter-spacing/neg-3-5\` = −3.5%.
- **Unidades:** px para espaço, tamanho, raio, borda, desfoque, fonte e breakpoint; % para opacidade, line-height e letter-spacing; ms para duração.
- **Regra:** layout e componente referenciam **só semânticos**. Precisa de um valor novo? Crie o primitivo e depois o alias semântico.
- **Tipografia:** o app usa *Inter Tight* para títulos e números. No Figma ela não está disponível, então os estilos de display usam Inter (os de corpo estão ligados a \`font-family/body\`).

---

## 1. Primitivos
`;
const pGroups = groupBy(Object.keys(P), (k) => (k.startsWith('color/') ? 2 : 1));
const TITLES = { color: 'Cor', space: 'Espaçamento (gap, padding e negativos)', size: 'Tamanho', radius: 'Raio', 'border-width': 'Espessura de borda (stroke)', opacity: 'Opacidade', blur: 'Desfoque', 'font-family': 'Família tipográfica', 'font-weight': 'Peso', 'font-size': 'Tamanho de fonte', 'line-height': 'Altura de linha', 'letter-spacing': 'Espaçamento entre letras', duration: 'Duração', breakpoint: 'Breakpoint' };
let lastTop = '';
for (const [g, keys] of Object.entries(pGroups)) {
  const top = fam(g);
  if (top !== lastTop) { md += `\n### ${TITLES[top] ?? top}\n`; lastTop = top; }
  if (top === 'color') md += `\n**${g.split('/')[1]}**\n`;
  md += `\n| Token | CSS | Valor |\n|---|---|---|\n`;
  for (const k of keys) md += `| \`${k}\` | \`${cssName(k)}\` | ${swatch(P[k])}\`${show(k, P[k])}\` |\n`;
}
md += `\n---\n\n## 2. Semânticos\n`;
const sGroups = groupBy(Object.keys(S), (k) => (k.startsWith('color/') ? 2 : k.split('/').length > 2 ? 2 : 1));
lastTop = '';
for (const [g, keys] of Object.entries(sGroups)) {
  const top = fam(g);
  if (top !== lastTop) { md += `\n### ${TITLES[top] ?? top}\n`; lastTop = top; }
  if (g.includes('/')) md += `\n**${g}**\n`;
  md += `\n| Token | CSS | Alias | Valor | Uso |\n|---|---|---|---|---|\n`;
  for (const k of keys) { const [a, d] = S[k]; md += `| \`${k}\` | \`${cssName(k)}\` | \`${a}\` | ${swatch(P[a])}\`${show(a, P[a])}\` | ${d} |\n`; }
}
md += `
---

## 3. Estilos de texto (Figma) → tokens

| Estilo | font-size | font-weight | line-height | letter-spacing | font-family |
|---|---|---|---|---|---|
| Cofrinho/Display/Saldo | \`font-size/display-lg\` (46; 84 no desktop = \`display-xl\`) | \`emphasis\` | \`display\` | \`display\` | \`display\` |
| Cofrinho/Display/Número | \`font-size/display-md\` | \`emphasis\` | \`number\` | \`number\` | \`display\` |
| Cofrinho/Título/Tela | \`font-size/heading-lg\` | \`emphasis\` | \`title\` | \`title\` | \`display\` |
| Cofrinho/Título/Seção | \`font-size/heading-md\` | \`emphasis\` | \`title\` | \`title\` | \`display\` |
| Cofrinho/Corpo/Linha | \`font-size/body-lg\` | \`body\` | \`body\` | \`body\` | \`body\` |
| Cofrinho/Corpo/Valor | \`font-size/body-md\` | \`emphasis\` | \`body\` | \`value\` | \`body\` |
| Cofrinho/Corpo/Botão | \`font-size/body-md\` | \`label\` | \`title\` | \`body\` | \`body\` |
| Cofrinho/Corpo/Label | \`font-size/body-sm\` | \`body\` | \`body\` | \`body\` | \`body\` |
| Cofrinho/Corpo/Sub | \`font-size/caption\` | \`body\` | \`body\` | \`body\` | \`body\` |
| Cofrinho/Corpo/Legenda | \`font-size/caption-sm\` | \`body\` | \`body\` | \`body\` | \`body\` |

## 4. Fora das variáveis (só documentação)

Sombras e gradientes não viram variáveis no Figma. Referência para o código:

| Nome | Valor |
|---|---|
| \`shadow/card\` | \`0 18px 40px rgba(0,0,0,.45)\` |
| \`shadow/sheet\` | \`0 12px 36px rgba(0,0,0,.55)\` |
| \`shadow/mini-art\` | \`0 14px 30px rgba(0,0,0,.25)\` |
| \`shadow/glow-lime\` | \`0 10px 30px rgba(217,245,155,.25)\` |
| \`shadow/glow-iris\` | \`0 18px 40px rgba(59,45,255,.25)\` |
| \`gradient/art-iris\` | radiais \`iris-glow-1/2/3\` sobre \`linear-gradient(135deg, iris-start, iris-mid 45%, iris-end)\` |
| \`gradient/art-aurora\` | radiais \`aurora-glow-1\` (85%) e \`aurora-glow-2\` (75%) sobre \`linear-gradient(150deg, aurora-start, aurora-end 70%)\` |
| \`gradient/art-lime\` | radiais \`lime-glow-1/2\` sobre \`linear-gradient(160deg, lime-start, lime-mid 55%, lime-end)\` |
| \`easing/standard\` | \`cubic-bezier(.2,.8,.2,1)\` |

## 5. Próximos passos

1. Documentar componentes (Button, Pill, Tile, Row, Card, Panel, Field, Nav) referenciando só tokens semânticos.
2. Trocar as variáveis \`--color-esk-*\` de \`app/globals.css\` por \`@import "../design-tokens/tokens.css"\` + mapeamento no \`@theme\`.
3. Se surgir modo claro, adicionar um modo na coleção \`semantic\` (os primitivos não mudam).
`;
writeFileSync(new URL('TOKENS.md', root), md);

let css = `/* Gerado por scripts/build-tokens.mjs a partir de tokens.json — não edite à mão */\n:root {\n  /* Primitivos */\n`;
for (const [k, v] of Object.entries(P)) css += `  ${cssName(k)}: ${cssVal(k, v)};\n`;
css += `\n  /* Semânticos */\n`;
for (const [k, [a]] of Object.entries(S)) css += `  ${cssName(k)}: var(${cssName(a)});\n`;
css += `}\n`;
writeFileSync(new URL('tokens.css', root), css);
console.log(`ok: ${pCount} primitivos, ${sCount} semânticos`);

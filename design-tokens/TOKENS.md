# Cofrinho · Design Tokens

> Fonte única: `design-tokens/tokens.json` · Figma: arquivo **W5**, página **2 - Design MVP**, coleções **primitives** e **semantic** e seção *Cofrinho · Design Tokens*.
> Gerado por `node scripts/build-tokens.mjs` — não edite este arquivo à mão.

**170 primitivos · 164 semânticos**

## Como funciona

| Camada | Coleção no Figma | Papel | Quem usa |
|---|---|---|---|
| Primitivos | `primitives` (modo `value`) | Valores brutos, sem significado (paleta, escalas). | Só os semânticos. Escondidos dos seletores do Figma (scopes vazios). |
| Semânticos | `semantic` (modo `cofrinho`) | Aliases que dizem **onde** usar cada valor. | Layouts, componentes e código. |

- **Nomenclatura kebab-case.** No Figma, `/` separa grupos; no código vira `-`: `color/bg/canvas` → `var(--color-bg-canvas)`. Todos os tokens já têm *code syntax* WEB configurado.
- **Negativos e decimais** usam palavras: `space/neg-24` = −24px, `border-width/1-5` = 1.5px, `letter-spacing/neg-3-5` = −3.5%.
- **Unidades:** px para espaço, tamanho, raio, borda, desfoque, fonte e breakpoint; % para opacidade, line-height e letter-spacing; ms para duração.
- **Regra:** layout e componente referenciam **só semânticos**. Precisa de um valor novo? Crie o primitivo e depois o alias semântico.
- **Tipografia:** o app usa *Inter Tight* para títulos e números. No Figma ela não está disponível, então os estilos de display usam Inter (os de corpo estão ligados a `font-family/body`).

---

## 1. Primitivos

### Cor

**neutral**

| Token | CSS | Valor |
|---|---|---|
| `color/neutral/0` | `--color-neutral-0` | `#FFFFFF` |
| `color/neutral/50` | `--color-neutral-50` | `#F5F5F3` |
| `color/neutral/100` | `--color-neutral-100` | `#E6E6E2` |
| `color/neutral/300` | `--color-neutral-300` | `#BDBDBD` |
| `color/neutral/400` | `--color-neutral-400` | `#8A8A8A` |
| `color/neutral/500` | `--color-neutral-500` | `#6B6B6B` |
| `color/neutral/700` | `--color-neutral-700` | `#2A2A2A` |
| `color/neutral/750` | `--color-neutral-750` | `#262626` |
| `color/neutral/800` | `--color-neutral-800` | `#222222` |
| `color/neutral/825` | `--color-neutral-825` | `#1E1E1E` |
| `color/neutral/850` | `--color-neutral-850` | `#1C1C1E` |
| `color/neutral/900` | `--color-neutral-900` | `#161616` |
| `color/neutral/925` | `--color-neutral-925` | `#121212` |
| `color/neutral/950` | `--color-neutral-950` | `#0A0A0A` |

**lime**

| Token | CSS | Valor |
|---|---|---|
| `color/lime/50` | `--color-lime-50` | `#F4FFD6` |
| `color/lime/300` | `--color-lime-300` | `#D9F59B` |
| `color/lime/500` | `--color-lime-500` | `#9BE36B` |
| `color/lime/900` | `--color-lime-900` | `#2E7D5B` |

**mint**

| Token | CSS | Valor |
|---|---|---|
| `color/mint/300` | `--color-mint-300` | `#7CF0A8` |
| `color/mint/400` | `--color-mint-400` | `#62F2BC` |

**violet**

| Token | CSS | Valor |
|---|---|---|
| `color/violet/200` | `--color-violet-200` | `#C9B6FF` |
| `color/violet/300` | `--color-violet-300` | `#A98BFF` |
| `color/violet/500` | `--color-violet-500` | `#8C5BFF` |
| `color/violet/700` | `--color-violet-700` | `#3B2DFF` |

**blue**

| Token | CSS | Valor |
|---|---|---|
| `color/blue/300` | `--color-blue-300` | `#6EC8FF` |
| `color/blue/500` | `--color-blue-500` | `#21B3FF` |

**pink**

| Token | CSS | Valor |
|---|---|---|
| `color/pink/300` | `--color-pink-300` | `#FF8FD8` |

**orange**

| Token | CSS | Valor |
|---|---|---|
| `color/orange/400` | `--color-orange-400` | `#FF9A3C` |

**red**

| Token | CSS | Valor |
|---|---|---|
| `color/red/200` | `--color-red-200` | `#FFB4B4` |
| `color/red/300` | `--color-red-300` | `#FF9E9E` |
| `color/red/400` | `--color-red-400` | `#FF6A52` |
| `color/red/500` | `--color-red-500` | `#FF3B1F` |

**alpha**

| Token | CSS | Valor |
|---|---|---|
| `color/alpha/white-6` | `--color-alpha-white-6` | `#FFFFFF0F` |
| `color/alpha/white-10` | `--color-alpha-white-10` | `#FFFFFF1A` |
| `color/alpha/white-85` | `--color-alpha-white-85` | `#FFFFFFD9` |
| `color/alpha/black-12` | `--color-alpha-black-12` | `#0000001F` |
| `color/alpha/black-45` | `--color-alpha-black-45` | `#00000073` |
| `color/alpha/black-55` | `--color-alpha-black-55` | `#0000008C` |
| `color/alpha/lime-10` | `--color-alpha-lime-10` | `#D9F59B1A` |
| `color/alpha/lime-25` | `--color-alpha-lime-25` | `#D9F59B40` |
| `color/alpha/violet-25` | `--color-alpha-violet-25` | `#3B2DFF40` |

### Espaçamento (gap, padding e negativos)

| Token | CSS | Valor |
|---|---|---|
| `space/0` | `--space-0` | `0px` |
| `space/2` | `--space-2` | `2px` |
| `space/4` | `--space-4` | `4px` |
| `space/6` | `--space-6` | `6px` |
| `space/8` | `--space-8` | `8px` |
| `space/10` | `--space-10` | `10px` |
| `space/12` | `--space-12` | `12px` |
| `space/14` | `--space-14` | `14px` |
| `space/16` | `--space-16` | `16px` |
| `space/18` | `--space-18` | `18px` |
| `space/20` | `--space-20` | `20px` |
| `space/22` | `--space-22` | `22px` |
| `space/24` | `--space-24` | `24px` |
| `space/28` | `--space-28` | `28px` |
| `space/32` | `--space-32` | `32px` |
| `space/36` | `--space-36` | `36px` |
| `space/40` | `--space-40` | `40px` |
| `space/44` | `--space-44` | `44px` |
| `space/48` | `--space-48` | `48px` |
| `space/56` | `--space-56` | `56px` |
| `space/64` | `--space-64` | `64px` |
| `space/80` | `--space-80` | `80px` |
| `space/96` | `--space-96` | `96px` |
| `space/120` | `--space-120` | `120px` |
| `space/neg-2` | `--space-neg-2` | `-2px` |
| `space/neg-4` | `--space-neg-4` | `-4px` |
| `space/neg-8` | `--space-neg-8` | `-8px` |
| `space/neg-12` | `--space-neg-12` | `-12px` |
| `space/neg-16` | `--space-neg-16` | `-16px` |
| `space/neg-24` | `--space-neg-24` | `-24px` |
| `space/neg-32` | `--space-neg-32` | `-32px` |

### Tamanho

| Token | CSS | Valor |
|---|---|---|
| `size/12` | `--size-12` | `12px` |
| `size/14` | `--size-14` | `14px` |
| `size/16` | `--size-16` | `16px` |
| `size/18` | `--size-18` | `18px` |
| `size/20` | `--size-20` | `20px` |
| `size/22` | `--size-22` | `22px` |
| `size/24` | `--size-24` | `24px` |
| `size/40` | `--size-40` | `40px` |
| `size/42` | `--size-42` | `42px` |
| `size/44` | `--size-44` | `44px` |
| `size/48` | `--size-48` | `48px` |
| `size/52` | `--size-52` | `52px` |
| `size/56` | `--size-56` | `56px` |
| `size/64` | `--size-64` | `64px` |
| `size/110` | `--size-110` | `110px` |
| `size/420` | `--size-420` | `420px` |
| `size/1200` | `--size-1200` | `1200px` |

### Raio

| Token | CSS | Valor |
|---|---|---|
| `radius/0` | `--radius-0` | `0px` |
| `radius/6` | `--radius-6` | `6px` |
| `radius/8` | `--radius-8` | `8px` |
| `radius/10` | `--radius-10` | `10px` |
| `radius/12` | `--radius-12` | `12px` |
| `radius/16` | `--radius-16` | `16px` |
| `radius/20` | `--radius-20` | `20px` |
| `radius/24` | `--radius-24` | `24px` |
| `radius/26` | `--radius-26` | `26px` |
| `radius/28` | `--radius-28` | `28px` |
| `radius/32` | `--radius-32` | `32px` |
| `radius/36` | `--radius-36` | `36px` |
| `radius/44` | `--radius-44` | `44px` |
| `radius/full` | `--radius-full` | `999px` |

### Espessura de borda (stroke)

| Token | CSS | Valor |
|---|---|---|
| `border-width/0` | `--border-width-0` | `0px` |
| `border-width/1` | `--border-width-1` | `1px` |
| `border-width/1-5` | `--border-width-1-5` | `1.5px` |
| `border-width/2` | `--border-width-2` | `2px` |
| `border-width/4` | `--border-width-4` | `4px` |

### Opacidade

| Token | CSS | Valor |
|---|---|---|
| `opacity/0` | `--opacity-0` | `0%` |
| `opacity/10` | `--opacity-10` | `10%` |
| `opacity/18` | `--opacity-18` | `18%` |
| `opacity/25` | `--opacity-25` | `25%` |
| `opacity/45` | `--opacity-45` | `45%` |
| `opacity/55` | `--opacity-55` | `55%` |
| `opacity/85` | `--opacity-85` | `85%` |
| `opacity/100` | `--opacity-100` | `100%` |

### Desfoque

| Token | CSS | Valor |
|---|---|---|
| `blur/0` | `--blur-0` | `0px` |
| `blur/12` | `--blur-12` | `12px` |
| `blur/24` | `--blur-24` | `24px` |
| `blur/40` | `--blur-40` | `40px` |
| `blur/60` | `--blur-60` | `60px` |

### Família tipográfica

| Token | CSS | Valor |
|---|---|---|
| `font-family/inter` | `--font-family-inter` | `Inter` |
| `font-family/inter-tight` | `--font-family-inter-tight` | `Inter Tight` |

### Peso

| Token | CSS | Valor |
|---|---|---|
| `font-weight/400` | `--font-weight-400` | `400` |
| `font-weight/500` | `--font-weight-500` | `500` |
| `font-weight/600` | `--font-weight-600` | `600` |
| `font-weight/700` | `--font-weight-700` | `700` |

### Tamanho de fonte

| Token | CSS | Valor |
|---|---|---|
| `font-size/11` | `--font-size-11` | `11px` |
| `font-size/12` | `--font-size-12` | `12px` |
| `font-size/13` | `--font-size-13` | `13px` |
| `font-size/14` | `--font-size-14` | `14px` |
| `font-size/15` | `--font-size-15` | `15px` |
| `font-size/16` | `--font-size-16` | `16px` |
| `font-size/18` | `--font-size-18` | `18px` |
| `font-size/20` | `--font-size-20` | `20px` |
| `font-size/22` | `--font-size-22` | `22px` |
| `font-size/24` | `--font-size-24` | `24px` |
| `font-size/28` | `--font-size-28` | `28px` |
| `font-size/32` | `--font-size-32` | `32px` |
| `font-size/34` | `--font-size-34` | `34px` |
| `font-size/40` | `--font-size-40` | `40px` |
| `font-size/44` | `--font-size-44` | `44px` |
| `font-size/46` | `--font-size-46` | `46px` |
| `font-size/56` | `--font-size-56` | `56px` |
| `font-size/64` | `--font-size-64` | `64px` |
| `font-size/68` | `--font-size-68` | `68px` |
| `font-size/84` | `--font-size-84` | `84px` |

### Altura de linha

| Token | CSS | Valor |
|---|---|---|
| `line-height/100` | `--line-height-100` | `100%` |
| `line-height/105` | `--line-height-105` | `105%` |
| `line-height/110` | `--line-height-110` | `110%` |
| `line-height/120` | `--line-height-120` | `120%` |
| `line-height/130` | `--line-height-130` | `130%` |
| `line-height/150` | `--line-height-150` | `150%` |

### Espaçamento entre letras

| Token | CSS | Valor |
|---|---|---|
| `letter-spacing/neg-4` | `--letter-spacing-neg-4` | `-4%` |
| `letter-spacing/neg-3-5` | `--letter-spacing-neg-3-5` | `-3.5%` |
| `letter-spacing/neg-3` | `--letter-spacing-neg-3` | `-3%` |
| `letter-spacing/neg-2` | `--letter-spacing-neg-2` | `-2%` |
| `letter-spacing/neg-1-5` | `--letter-spacing-neg-1-5` | `-1.5%` |
| `letter-spacing/0` | `--letter-spacing-0` | `0%` |
| `letter-spacing/6` | `--letter-spacing-6` | `6%` |

### Duração

| Token | CSS | Valor |
|---|---|---|
| `duration/150` | `--duration-150` | `150ms` |
| `duration/220` | `--duration-220` | `220ms` |
| `duration/600` | `--duration-600` | `600ms` |
| `duration/700` | `--duration-700` | `700ms` |
| `duration/9000` | `--duration-9000` | `9000ms` |
| `duration/11000` | `--duration-11000` | `11000ms` |

### Breakpoint

| Token | CSS | Valor |
|---|---|---|
| `breakpoint/390` | `--breakpoint-390` | `390px` |
| `breakpoint/800` | `--breakpoint-800` | `800px` |
| `breakpoint/1100` | `--breakpoint-1100` | `1100px` |
| `breakpoint/1440` | `--breakpoint-1440` | `1440px` |

---

## 2. Semânticos

### Cor

**color/bg**

| Token | CSS | Alias | Valor | Uso |
|---|---|---|---|---|
| `color/bg/canvas` | `--color-bg-canvas` | `color/neutral/950` | `#0A0A0A` | Fundo da aplicação (área escura) |
| `color/bg/paper` | `--color-bg-paper` | `color/neutral/50` | `#F5F5F3` | Topo claro (hero), balão do usuário, item ativo do menu |
| `color/bg/panel` | `--color-bg-panel` | `color/neutral/925` | `#121212` | Painéis e sheets |
| `color/bg/surface` | `--color-bg-surface` | `color/neutral/900` | `#161616` | Campos, barra de navegação, superfícies elevadas |
| `color/bg/tile` | `--color-bg-tile` | `color/neutral/850` | `#1C1C1E` | Fundo dos ícones em tile (48px, raio 16) |
| `color/bg/active` | `--color-bg-active` | `color/neutral/700` | `#2A2A2A` | Estado ativo/pressionado no escuro |
| `color/bg/ink` | `--color-bg-ink` | `color/neutral/950` | `#0A0A0A` | Elementos escuros sobre o papel (menu pílula, segmentos, anel) |
| `color/bg/highlight` | `--color-bg-highlight` | `color/alpha/lime-10` | `#D9F59B1A` | Fundo de aviso/destaque lima (ex.: modo protótipo) |
| `color/bg/glass` | `--color-bg-glass` | `color/alpha/white-10` | `#FFFFFF1A` | Navegação com desfoque (glass) |
| `color/bg/overlay` | `--color-bg-overlay` | `color/alpha/black-55` | `#0000008C` | Overlay atrás de sheets |

**color/text**

| Token | CSS | Alias | Valor | Uso |
|---|---|---|---|---|
| `color/text/primary` | `--color-text-primary` | `color/neutral/0` | `#FFFFFF` | Texto principal no escuro |
| `color/text/inverse` | `--color-text-inverse` | `color/neutral/50` | `#F5F5F3` | Texto claro sobre arte/tinta |
| `color/text/secondary` | `--color-text-secondary` | `color/neutral/400` | `#8A8A8A` | Texto de apoio, labels |
| `color/text/tertiary` | `--color-text-tertiary` | `color/neutral/500` | `#6B6B6B` | Datas e metadados |
| `color/text/nav` | `--color-text-nav` | `color/neutral/300` | `#BDBDBD` | Itens inativos do menu |
| `color/text/on-paper` | `--color-text-on-paper` | `color/neutral/950` | `#0A0A0A` | Texto sobre o papel |
| `color/text/on-paper-muted` | `--color-text-on-paper-muted` | `color/neutral/500` | `#6B6B6B` | Texto secundário sobre o papel (AA) |
| `color/text/accent` | `--color-text-accent` | `color/lime/300` | `#D9F59B` | Números em destaque, links, 'Criar conta' |
| `color/text/positive` | `--color-text-positive` | `color/mint/300` | `#7CF0A8` | Entradas e variações positivas |
| `color/text/negative` | `--color-text-negative` | `color/red/300` | `#FF9E9E` | Erros e variações negativas |

**color/border**

| Token | CSS | Alias | Valor | Uso |
|---|---|---|---|---|
| `color/border/default` | `--color-border-default` | `color/neutral/800` | `#222222` | Divisores e bordas padrão |
| `color/border/subtle` | `--color-border-subtle` | `color/neutral/825` | `#1E1E1E` | Contorno de painéis |
| `color/border/input` | `--color-border-input` | `color/neutral/750` | `#262626` | Borda de campos |
| `color/border/control` | `--color-border-control` | `color/neutral/700` | `#2A2A2A` | Botões fantasma (outline) no escuro |
| `color/border/focus` | `--color-border-focus` | `color/neutral/0` | `#FFFFFF` | Foco de campos e anel de foco no escuro |
| `color/border/on-paper` | `--color-border-on-paper` | `color/neutral/950` | `#0A0A0A` | Botões circulares e contornos sobre o papel |
| `color/border/light` | `--color-border-light` | `color/alpha/white-6` | `#FFFFFF0F` | Luz de borda em cards escuros |

**color/track**

| Token | CSS | Alias | Valor | Uso |
|---|---|---|---|---|
| `color/track/default` | `--color-track-default` | `color/neutral/700` | `#2A2A2A` | Trilhos de barras no escuro |
| `color/track/on-paper` | `--color-track-on-paper` | `color/neutral/100` | `#E6E6E2` | Trilhos/segmentos vazios no papel |

**color/action**

| Token | CSS | Alias | Valor | Uso |
|---|---|---|---|---|
| `color/action/primary-bg` | `--color-action-primary-bg` | `color/neutral/50` | `#F5F5F3` | Botão primário no escuro (papel) |
| `color/action/primary-fg` | `--color-action-primary-fg` | `color/neutral/950` | `#0A0A0A` | Texto do botão primário |
| `color/action/accent-bg` | `--color-action-accent-bg` | `color/lime/300` | `#D9F59B` | Botão do assistente, enviar, valor destacado |
| `color/action/accent-fg` | `--color-action-accent-fg` | `color/neutral/950` | `#0A0A0A` | Conteúdo sobre lima |
| `color/action/on-paper-bg` | `--color-action-on-paper-bg` | `color/neutral/950` | `#0A0A0A` | Botão escuro sobre o papel |
| `color/action/on-paper-fg` | `--color-action-on-paper-fg` | `color/neutral/50` | `#F5F5F3` | Conteúdo do botão escuro sobre o papel |

**color/feedback**

| Token | CSS | Alias | Valor | Uso |
|---|---|---|---|---|
| `color/feedback/success` | `--color-feedback-success` | `color/mint/400` | `#62F2BC` | Sucesso |
| `color/feedback/warning` | `--color-feedback-warning` | `color/orange/400` | `#FF9A3C` | Atenção |
| `color/feedback/danger` | `--color-feedback-danger` | `color/red/500` | `#FF3B1F` | Erro destrutivo |
| `color/feedback/info` | `--color-feedback-info` | `color/blue/500` | `#21B3FF` | Informação |

**color/accent**

| Token | CSS | Alias | Valor | Uso |
|---|---|---|---|---|
| `color/accent/lime` | `--color-accent-lime` | `color/lime/300` | `#D9F59B` | Acento principal da marca |
| `color/accent/violet` | `--color-accent-violet` | `color/violet/500` | `#8C5BFF` | Acento violeta |
| `color/accent/blue` | `--color-accent-blue` | `color/blue/500` | `#21B3FF` | Acento ciano |
| `color/accent/orange` | `--color-accent-orange` | `color/orange/400` | `#FF9A3C` | Acento laranja |
| `color/accent/red` | `--color-accent-red` | `color/red/400` | `#FF6A52` | Acento coral |
| `color/accent/lilac` | `--color-accent-lilac` | `color/violet/200` | `#C9B6FF` | Acento lilás |

**color/category**

| Token | CSS | Alias | Valor | Uso |
|---|---|---|---|---|
| `color/category/moradia` | `--color-category-moradia` | `color/violet/300` | `#A98BFF` | Categoria Moradia |
| `color/category/alimentacao` | `--color-category-alimentacao` | `color/lime/300` | `#D9F59B` | Categoria Alimentação |
| `color/category/transporte` | `--color-category-transporte` | `color/blue/500` | `#21B3FF` | Categoria Transporte |
| `color/category/lazer` | `--color-category-lazer` | `color/orange/400` | `#FF9A3C` | Categoria Lazer |
| `color/category/assinaturas` | `--color-category-assinaturas` | `color/red/400` | `#FF6A52` | Categoria Assinaturas |
| `color/category/outros` | `--color-category-outros` | `color/neutral/0` | `#FFFFFF` | Categoria Outros |

**color/brand**

| Token | CSS | Alias | Valor | Uso |
|---|---|---|---|---|
| `color/brand/netflix-mark` | `--color-brand-netflix-mark` | `color/violet/200` | `#C9B6FF` | Marca Netflix (N lilás) |

**color/chart**

| Token | CSS | Alias | Valor | Uso |
|---|---|---|---|---|
| `color/chart/bar` | `--color-chart-bar` | `color/neutral/0` | `#FFFFFF` | Barra padrão do gráfico semanal |
| `color/chart/bar-active` | `--color-chart-bar-active` | `color/lime/300` | `#D9F59B` | Barra do dia atual |

**color/art**

| Token | CSS | Alias | Valor | Uso |
|---|---|---|---|---|
| `color/art/iris-start` | `--color-art-iris-start` | `color/violet/700` | `#3B2DFF` | Arte Iris (Principal) — início do gradiente |
| `color/art/iris-mid` | `--color-art-iris-mid` | `color/violet/500` | `#8C5BFF` | Arte Iris — meio |
| `color/art/iris-end` | `--color-art-iris-end` | `color/blue/500` | `#21B3FF` | Arte Iris — fim |
| `color/art/iris-glow-1` | `--color-art-iris-glow-1` | `color/violet/200` | `#C9B6FF` | Arte Iris — brilho lilás |
| `color/art/iris-glow-2` | `--color-art-iris-glow-2` | `color/blue/300` | `#6EC8FF` | Arte Iris — brilho azul |
| `color/art/iris-glow-3` | `--color-art-iris-glow-3` | `color/pink/300` | `#FF8FD8` | Arte Iris — brilho rosa |
| `color/art/aurora-start` | `--color-art-aurora-start` | `color/neutral/850` | `#1C1C1E` | Arte Aurora escura (Salário) — grafite |
| `color/art/aurora-end` | `--color-art-aurora-end` | `color/neutral/950` | `#0A0A0A` | Arte Aurora — tinta |
| `color/art/aurora-glow-1` | `--color-art-aurora-glow-1` | `color/lime/300` | `#D9F59B` | Arte Aurora — brilho lima |
| `color/art/aurora-glow-2` | `--color-art-aurora-glow-2` | `color/violet/500` | `#8C5BFF` | Arte Aurora — brilho violeta |
| `color/art/lime-start` | `--color-art-lime-start` | `color/lime/300` | `#D9F59B` | Arte Lima (Viagem/metas) — início |
| `color/art/lime-mid` | `--color-art-lime-mid` | `color/lime/500` | `#9BE36B` | Arte Lima — meio |
| `color/art/lime-end` | `--color-art-lime-end` | `color/lime/900` | `#2E7D5B` | Arte Lima — fim |
| `color/art/lime-glow-1` | `--color-art-lime-glow-1` | `color/lime/50` | `#F4FFD6` | Arte Lima — brilho claro |
| `color/art/lime-glow-2` | `--color-art-lime-glow-2` | `color/mint/400` | `#62F2BC` | Arte Lima — brilho menta |

### Espaçamento (gap, padding e negativos)

**space/inset**

| Token | CSS | Alias | Valor | Uso |
|---|---|---|---|---|
| `space/inset/xs` | `--space-inset-xs` | `space/8` | `8px` | Padding interno mínimo (chips) |
| `space/inset/sm` | `--space-inset-sm` | `space/12` | `12px` | Padding de pílulas e avisos |
| `space/inset/md` | `--space-inset-md` | `space/16` | `16px` | Padding de campos e cards pequenos |
| `space/inset/lg` | `--space-inset-lg` | `space/20` | `20px` | Margem lateral da tela mobile |
| `space/inset/xl` | `--space-inset-xl` | `space/24` | `24px` | Padding de cards e arte |
| `space/inset/2xl` | `--space-inset-2xl` | `space/28` | `28px` | Padding de painéis |
| `space/inset/3xl` | `--space-inset-3xl` | `space/48` | `48px` | Padding do painel de marca (desktop) |

**space/screen**

| Token | CSS | Alias | Valor | Uso |
|---|---|---|---|---|
| `space/screen/mobile` | `--space-screen-mobile` | `space/20` | `20px` | Margem horizontal da tela mobile |
| `space/screen/desktop` | `--space-screen-desktop` | `space/120` | `120px` | Margem horizontal da tela desktop |

**space/stack**

| Token | CSS | Alias | Valor | Uso |
|---|---|---|---|---|
| `space/stack/2xs` | `--space-stack-2xs` | `space/4` | `4px` | Gap vertical mínimo (título + sub) |
| `space/stack/xs` | `--space-stack-xs` | `space/8` | `8px` | Gap label + campo |
| `space/stack/sm` | `--space-stack-sm` | `space/12` | `12px` | Gap entre itens próximos |
| `space/stack/md` | `--space-stack-md` | `space/16` | `16px` | Gap entre blocos de um card |
| `space/stack/lg` | `--space-stack-lg` | `space/24` | `24px` | Gap entre painéis |
| `space/stack/xl` | `--space-stack-xl` | `space/32` | `32px` | Gap entre seções |
| `space/stack/2xl` | `--space-stack-2xl` | `space/48` | `48px` | Gap entre áreas (desktop) |

**space/inline**

| Token | CSS | Alias | Valor | Uso |
|---|---|---|---|---|
| `space/inline/2xs` | `--space-inline-2xs` | `space/4` | `4px` | Gap ícone + texto mínimo |
| `space/inline/xs` | `--space-inline-xs` | `space/8` | `8px` | Gap ícone + texto |
| `space/inline/sm` | `--space-inline-sm` | `space/10` | `10px` | Gap entre pílulas |
| `space/inline/md` | `--space-inline-md` | `space/14` | `14px` | Gap entre tiles |
| `space/inline/lg` | `--space-inline-lg` | `space/16` | `16px` | Gap linha de lista (tile + texto) |

**space/overlap**

| Token | CSS | Alias | Valor | Uso |
|---|---|---|---|---|
| `space/overlap/sm` | `--space-overlap-sm` | `space/neg-8` | `-8px` | Sobreposição leve (avatares, chips) |
| `space/overlap/md` | `--space-overlap-md` | `space/neg-16` | `-16px` | Pilha de cartões compacta |
| `space/overlap/lg` | `--space-overlap-lg` | `space/neg-24` | `-24px` | Pilha de cartões (Meus cartões) |

### Tamanho

**size/icon**

| Token | CSS | Alias | Valor | Uso |
|---|---|---|---|---|
| `size/icon/xs` | `--size-icon-xs` | `size/14` | `14px` | Ícone em aviso/pílula pequena |
| `size/icon/sm` | `--size-icon-sm` | `size/18` | `18px` | Ícone de pílula e menu |
| `size/icon/md` | `--size-icon-md` | `size/20` | `20px` | Ícone de botão circular |
| `size/icon/lg` | `--size-icon-lg` | `size/22` | `22px` | Ícone do botão do assistente |

**size/control**

| Token | CSS | Alias | Valor | Uso |
|---|---|---|---|---|
| `size/control/sm` | `--size-control-sm` | `size/40` | `40px` | Botão compacto |
| `size/control/md` | `--size-control-md` | `size/44` | `44px` | Pílula/menu (alvo de toque mínimo) |
| `size/control/lg` | `--size-control-lg` | `size/48` | `48px` | Botão circular |
| `size/control/xl` | `--size-control-xl` | `size/52` | `52px` | Campo de texto |
| `size/control/2xl` | `--size-control-2xl` | `size/56` | `56px` | CTA e botão do assistente |

**size/tile**

| Token | CSS | Alias | Valor | Uso |
|---|---|---|---|---|
| `size/tile/md` | `--size-tile-md` | `size/48` | `48px` | Tile de ícone em listas |
| `size/tile/sm` | `--size-tile-sm` | `size/42` | `42px` | Logo de assinatura |

**size/ring**

| Token | CSS | Alias | Valor | Uso |
|---|---|---|---|---|
| `size/ring/lg` | `--size-ring-lg` | `size/110` | `110px` | Anel de progresso da meta |

**size/form**

| Token | CSS | Alias | Valor | Uso |
|---|---|---|---|---|
| `size/form/width` | `--size-form-width` | `size/420` | `420px` | Largura do formulário de login (desktop) |

**size/container**

| Token | CSS | Alias | Valor | Uso |
|---|---|---|---|---|
| `size/container/max` | `--size-container-max` | `size/1200` | `1200px` | Largura máxima do conteúdo desktop |

### Raio

| Token | CSS | Alias | Valor | Uso |
|---|---|---|---|---|
| `radius/control` | `--radius-control` | `radius/16` | `16px` | Campos e controles |
| `radius/tile` | `--radius-tile` | `radius/16` | `16px` | Tiles de ícone |
| `radius/bar` | `--radius-bar` | `radius/6` | `6px` | Segmentos e barras do gráfico |
| `radius/chip` | `--radius-chip` | `radius/12` | `12px` | Chips pequenos |
| `radius/category` | `--radius-category` | `radius/24` | `24px` | Cards de categoria |
| `radius/card` | `--radius-card` | `radius/26` | `26px` | Cartões e artes |
| `radius/panel` | `--radius-panel` | `radius/28` | `28px` | Painéis |
| `radius/sheet` | `--radius-sheet` | `radius/32` | `32px` | Bottom sheets |
| `radius/hero` | `--radius-hero` | `radius/36` | `36px` | Topo papel no mobile |
| `radius/hero-desktop` | `--radius-hero-desktop` | `radius/44` | `44px` | Topo papel e painel de marca no desktop |
| `radius/pill` | `--radius-pill` | `radius/full` | `999px` | Pílulas, botões circulares e CTAs |

### Espessura de borda (stroke)

| Token | CSS | Alias | Valor | Uso |
|---|---|---|---|---|
| `border-width/hairline` | `--border-width-hairline` | `border-width/1` | `1px` | Bordas e divisores |
| `border-width/control` | `--border-width-control` | `border-width/1-5` | `1.5px` | Botões circulares em contorno |
| `border-width/focus` | `--border-width-focus` | `border-width/2` | `2px` | Anel de foco |

### Opacidade

| Token | CSS | Alias | Valor | Uso |
|---|---|---|---|---|
| `opacity/hint` | `--opacity-hint` | `opacity/10` | `10%` | Fundo de avisos tingidos |
| `opacity/ring-track` | `--opacity-ring-track` | `opacity/18` | `18%` | Trilho do anel sobre arte |
| `opacity/disabled` | `--opacity-disabled` | `opacity/45` | `45%` | Controles desabilitados |
| `opacity/prefix` | `--opacity-prefix` | `opacity/55` | `55%` | Prefixo 'R$' no valor digitado |
| `opacity/outline-digits` | `--opacity-outline-digits` | `opacity/85` | `85%` | Dígitos em contorno sobre arte |

### Desfoque

| Token | CSS | Alias | Valor | Uso |
|---|---|---|---|---|
| `blur/glass` | `--blur-glass` | `blur/12` | `12px` | Desfoque da navegação |
| `blur/art-sm` | `--blur-art-sm` | `blur/40` | `40px` | Brilhos menores das artes |
| `blur/art-lg` | `--blur-art-lg` | `blur/60` | `60px` | Brilhos maiores das artes |

### Família tipográfica

| Token | CSS | Alias | Valor | Uso |
|---|---|---|---|---|
| `font-family/body` | `--font-family-body` | `font-family/inter` | `Inter` | Texto corrido e interface |
| `font-family/display` | `--font-family-display` | `font-family/inter-tight` | `Inter Tight` | Títulos e números (no Figma, Inter como fallback) |

### Peso

| Token | CSS | Alias | Valor | Uso |
|---|---|---|---|---|
| `font-weight/body` | `--font-weight-body` | `font-weight/400` | `400` | Texto |
| `font-weight/label` | `--font-weight-label` | `font-weight/500` | `500` | Botões e labels |
| `font-weight/emphasis` | `--font-weight-emphasis` | `font-weight/600` | `600` | Títulos, valores e números |
| `font-weight/strong` | `--font-weight-strong` | `font-weight/700` | `700` | Dígitos em contorno |

### Tamanho de fonte

| Token | CSS | Alias | Valor | Uso |
|---|---|---|---|---|
| `font-size/display-xl` | `--font-size-display-xl` | `font-size/84` | `84px` | Saldo no desktop |
| `font-size/display-lg` | `--font-size-display-lg` | `font-size/46` | `46px` | Saldo no mobile |
| `font-size/display-md` | `--font-size-display-md` | `font-size/34` | `34px` | Números de destaque |
| `font-size/heading-lg` | `--font-size-heading-lg` | `font-size/22` | `22px` | Título de tela |
| `font-size/heading-md` | `--font-size-heading-md` | `font-size/20` | `20px` | Título de seção |
| `font-size/body-lg` | `--font-size-body-lg` | `font-size/16` | `16px` | Linha de lista |
| `font-size/body-md` | `--font-size-body-md` | `font-size/15` | `15px` | Valor e botão |
| `font-size/body-sm` | `--font-size-body-sm` | `font-size/14` | `14px` | Label |
| `font-size/caption` | `--font-size-caption` | `font-size/13` | `13px` | Subtexto |
| `font-size/caption-sm` | `--font-size-caption-sm` | `font-size/12` | `12px` | Legenda |

### Altura de linha

| Token | CSS | Alias | Valor | Uso |
|---|---|---|---|---|
| `line-height/display` | `--line-height-display` | `line-height/100` | `100%` | Displays e saldo |
| `line-height/number` | `--line-height-number` | `line-height/110` | `110%` | Números de destaque |
| `line-height/title` | `--line-height-title` | `line-height/120` | `120%` | Títulos e botões |
| `line-height/body` | `--line-height-body` | `line-height/130` | `130%` | Texto |

### Espaçamento entre letras

| Token | CSS | Alias | Valor | Uso |
|---|---|---|---|---|
| `letter-spacing/display` | `--letter-spacing-display` | `letter-spacing/neg-3-5` | `-3.5%` | Saldo |
| `letter-spacing/number` | `--letter-spacing-number` | `letter-spacing/neg-3` | `-3%` | Números |
| `letter-spacing/title` | `--letter-spacing-title` | `letter-spacing/neg-2` | `-2%` | Títulos |
| `letter-spacing/value` | `--letter-spacing-value` | `letter-spacing/neg-1-5` | `-1.5%` | Valores em linhas |
| `letter-spacing/body` | `--letter-spacing-body` | `letter-spacing/0` | `0%` | Texto |
| `letter-spacing/kicker` | `--letter-spacing-kicker` | `letter-spacing/6` | `6%` | Rótulos em caixa alta |

### Duração

| Token | CSS | Alias | Valor | Uso |
|---|---|---|---|---|
| `duration/press` | `--duration-press` | `duration/150` | `150ms` | Feedback de toque (scale .97) |
| `duration/sheet` | `--duration-sheet` | `duration/220` | `220ms` | Saída do bottom sheet |
| `duration/enter` | `--duration-enter` | `duration/600` | `600ms` | Entrada de tela/stagger |
| `duration/chart` | `--duration-chart` | `duration/700` | `700ms` | Crescimento das barras |
| `duration/art-drift` | `--duration-art-drift` | `duration/9000` | `9000ms` | Fluxo lento das artes |

### Breakpoint

| Token | CSS | Alias | Valor | Uso |
|---|---|---|---|---|
| `breakpoint/mobile` | `--breakpoint-mobile` | `breakpoint/390` | `390px` | Artboard mobile |
| `breakpoint/tablet` | `--breakpoint-tablet` | `breakpoint/800` | `800px` | Vira layout desktop (md) |
| `breakpoint/desktop` | `--breakpoint-desktop` | `breakpoint/1100` | `1100px` | Desktop largo (lg) |
| `breakpoint/desktop-frame` | `--breakpoint-desktop-frame` | `breakpoint/1440` | `1440px` | Artboard desktop |

---

## 3. Estilos de texto (Figma) → tokens

| Estilo | font-size | font-weight | line-height | letter-spacing | font-family |
|---|---|---|---|---|---|
| Cofrinho/Display/Saldo | `font-size/display-lg` (46; 84 no desktop = `display-xl`) | `emphasis` | `display` | `display` | `display` |
| Cofrinho/Display/Número | `font-size/display-md` | `emphasis` | `number` | `number` | `display` |
| Cofrinho/Título/Tela | `font-size/heading-lg` | `emphasis` | `title` | `title` | `display` |
| Cofrinho/Título/Seção | `font-size/heading-md` | `emphasis` | `title` | `title` | `display` |
| Cofrinho/Corpo/Linha | `font-size/body-lg` | `body` | `body` | `body` | `body` |
| Cofrinho/Corpo/Valor | `font-size/body-md` | `emphasis` | `body` | `value` | `body` |
| Cofrinho/Corpo/Botão | `font-size/body-md` | `label` | `title` | `body` | `body` |
| Cofrinho/Corpo/Label | `font-size/body-sm` | `body` | `body` | `body` | `body` |
| Cofrinho/Corpo/Sub | `font-size/caption` | `body` | `body` | `body` | `body` |
| Cofrinho/Corpo/Legenda | `font-size/caption-sm` | `body` | `body` | `body` | `body` |

## 4. Fora das variáveis (só documentação)

Sombras e gradientes não viram variáveis no Figma. Referência para o código:

| Nome | Valor |
|---|---|
| `shadow/card` | `0 18px 40px rgba(0,0,0,.45)` |
| `shadow/sheet` | `0 12px 36px rgba(0,0,0,.55)` |
| `shadow/mini-art` | `0 14px 30px rgba(0,0,0,.25)` |
| `shadow/glow-lime` | `0 10px 30px rgba(217,245,155,.25)` |
| `shadow/glow-iris` | `0 18px 40px rgba(59,45,255,.25)` |
| `gradient/art-iris` | radiais `iris-glow-1/2/3` sobre `linear-gradient(135deg, iris-start, iris-mid 45%, iris-end)` |
| `gradient/art-aurora` | radiais `aurora-glow-1` (85%) e `aurora-glow-2` (75%) sobre `linear-gradient(150deg, aurora-start, aurora-end 70%)` |
| `gradient/art-lime` | radiais `lime-glow-1/2` sobre `linear-gradient(160deg, lime-start, lime-mid 55%, lime-end)` |
| `easing/standard` | `cubic-bezier(.2,.8,.2,1)` |

## 5. Próximos passos

1. Documentar componentes (Button, Pill, Tile, Row, Card, Panel, Field, Nav) referenciando só tokens semânticos.
2. Trocar as variáveis `--color-esk-*` de `app/globals.css` por `@import "../design-tokens/tokens.css"` + mapeamento no `@theme`.
3. Se surgir modo claro, adicionar um modo na coleção `semantic` (os primitivos não mudam).

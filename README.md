# Cofrinho

App de finanças pessoais, mobile-first, com uma visão desktop da mesma home, só mais larga. Por enquanto é **só interface**: os dados ficam no `localStorage` e a Fatura e o Assistente são simulados no front.

## Rodar

```bash
npm install
npm run dev   # http://localhost:3000
```

## Estrutura

```
Cofrinho/
├── .env                  ← valores reais (NÃO vai para o GitHub)
├── .env.example          ← modelo das variáveis (vai para o GitHub)
├── .gitignore
├── app/
│   ├── api/assistente/route.ts   ← exemplo: chat com OpenAI (servidor)
│   ├── api/fatura/route.ts       ← exemplo: leitura de PDF/foto com OpenAI (servidor)
│   ├── globals.css               ← tokens do design system
│   ├── layout.tsx · page.tsx
├── public/
├── referencias/          ← PNGs do design
├── src/
│   ├── components/       ← App, ui, ícones
│   ├── lib/              ← tipos, mocks, estado, formatação, env
│   ├── screens/          ← Login/Cadastro, Home, Cartões, Metas, Objetivos, Fatura, Assistente
│   ├── server/openai.ts  ← conexão OpenAI (só servidor, protegido por "server-only")
│   ├── services/         ← fatura.ts e assistente.ts: simulado ↔ API
│   └── sheets/           ← folhas (Adicionar, Conta, Cartão, Teto, Guardar, Meta)
└── supabase/migrations/               ← schema, RLS, RPCs, storage, seed demo (docs/BANCO.md)
```

| Pasta | O que tem |
|---|---|
| `app/globals.css` | Tokens do design system (`--color-esk-*` → `bg-esk-brand`, `text-esk-muted`…) |
| `src/lib/data.ts` | Mocks tipados (Lucas, R$ 14.500, cartões, metas) |
| `src/lib/store.tsx` | Estado (reducer), navegação por views + folhas, toasts, persistência |
| `src/screens/` | Login/Cadastro, Home, Cartões, Metas, Objetivos, Fatura, Assistente |
| `src/sheets/` | Folhas: Adicionar/editar gasto, Conta, Novo cartão, Teto, Guardar, Nova meta |
| `src/services/` | Fatura e Assistente simulados: **pontos de integração** |
| `src/lib/env.ts` | Variáveis públicas e `hasSupabase` |

Breakpoints: `md` = 800px (vira desktop), `lg` = 1100px.

## Variáveis de ambiente

- `.env.example` fica no repositório, sem valores.
- `.env` é local e **está no `.gitignore`**. Preencha aqui.
- Para ligar a OpenAI: preencha `OPENAI_API_KEY` e mude `NEXT_PUBLIC_USE_API=true` no `.env`, depois reinicie o `npm run dev`.
- Na Vercel, cadastre as mesmas chaves em *Settings → Environment Variables*.
- Só `NEXT_PUBLIC_*` vai para o navegador. `SUPABASE_SERVICE_ROLE_KEY` e `OPENAI_API_KEY` ficam só no servidor.

## Integrar depois

1. **Supabase (dados):** o banco já está criado (migrations em `supabase/migrations/`, veja `docs/BANCO.md`). Falta trocar o load/save do `StoreProvider` em `src/lib/store.tsx` por leituras e escritas nas tabelas e RPCs (mapa em `INTEGRACAO.md`). Tipos do banco: `src/lib/database.types.ts`.
2. **Supabase Auth:** troque o corpo das funções em `src/services/auth.ts` (as assinaturas já seguem o Supabase).
3. **IA (estágio 2):** já existe o exemplo em `app/api/*` + `src/server/openai.ts`. Ligue com `NEXT_PUBLIC_USE_API=true` e a `OPENAI_API_KEY`.
4. `NEXT_PUBLIC_PLUS=false` desliga Fatura e Assistente (estágio 1).

## Conta de demonstração

Modo protótipo: "Entrar" e "Criar conta" entram direto, sem validar. A conta de demonstração abre os dados do briefing. As credenciais ficam em `DEMO_ACCOUNT`, em `src/lib/data.ts`. Uma conta criada pelo cadastro começa vazia.

Veja o [CHECKLIST.md](CHECKLIST.md) (o que está validado) e o [INTEGRACAO.md](INTEGRACAO.md) (como ligar o backend).

## Design system

| O quê | Onde |
|---|---|
| Tokens (fonte única) | `design-tokens/tokens.json` |
| Documentação dos tokens | `design-tokens/TOKENS.md` |
| Variáveis CSS geradas | `design-tokens/tokens.css` |
| Figma | arquivo W5 → coleções `primitives` e `semantic`, seção *Cofrinho · Design Tokens* |
| Storybook | `src/stories/` (componentes, folhas e telas) |

```bash
npm run storybook              # Storybook local em http://localhost:6006
npm run build-storybook        # versão estática em storybook-static/
node scripts/build-tokens.mjs  # regenera TOKENS.md e tokens.css depois de editar tokens.json
```

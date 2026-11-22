# Mapa de integração — front → backend

O front está **ligado ao Supabase** (22/11/2026). Com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` no `.env`, login e dados vão para o banco; sem elas, o app volta ao modo local (localStorage). O Storybook sempre usa dados fixos.

| Ponto | Arquivo | Com Supabase | Sem Supabase |
|---|---|---|---|
| Dados | `src/lib/store.tsx` (`dispatch` → `src/services/db.ts`: `loadAll` / `persist`) | Tabelas abaixo, com RLS | localStorage, uma chave por conta |
| Autenticação | `src/services/auth.ts` (`sbSignIn`, `sbSignInDemo`, `sbSignUp`, `sbSignOut`, `sbSession`) | Supabase Auth (e-mail + senha; "Entrar" vazio abre a demo) | Entrada livre (`enterFree`, `signUpFree`) |
| Fatura | `src/screens/Fatura.tsx` → `saveInvoiceFile` + `importInvoice` | Arquivo no bucket `faturas` + `rpc('import_invoice')` | `tx/import` local |
| Apagar conta | `deleteAccountRemote` → Edge Function `delete-account` | Apaga arquivos + usuário (cascata) | Remove do localStorage |
| IA | `src/services/fatura.ts`, `src/services/assistente.ts` | Simulado no front | `app/api/*` → OpenAI (`NEXT_PUBLIC_USE_API=true`) |

## Ações do app → operação no Supabase

Cada ação do reducer em `src/lib/store.tsx` vira uma escrita no banco. O esquema já está aplicado no projeto Supabase `eyhybcegxlanckgkglau` (migrations em `supabase/migrations/`, documentação completa em [docs/BANCO.md](docs/BANCO.md)), com Row Level Security por usuário, funções transacionais e o bucket privado `faturas`. Tipos para o `supabase-js`: `src/lib/database.types.ts`. A matriz CRUD completa está em `CHECKLIST.md`.

| Ação (`dispatch`) | Disparada em | Tabela | Operação |
|---|---|---|---|
| `tx/save` | Folha Adicionar / editar gasto | `transactions` | `upsert` (cartão: `method = 'card'` + `card_id`) |
| `tx/delete` | Folha editar → Apagar lançamento | `transactions` | `delete` |
| `tx/import` | Fatura → Confirmar N lançamentos | `storage.faturas` + `invoice_imports` + `transactions` | upload `{uid}/arquivo` → `insert invoice_imports` → `rpc('import_invoice')` |
| `card/save` | Folha Novo / editar cartão | `cards` | `upsert` (`limit` → coluna `credit_limit`) |
| `card/delete` | Folha editar cartão → Apagar | `cards` (+ `transactions.method` → `'dinheiro'`) | só `delete`: o banco zera `card_id` e troca o método por trigger |
| `budget/set` | Metas → bloco da categoria (salvar ou **Remover teto**) | `budgets` | `upsert (user_id, category)`; teto 0 = `delete` |
| `monthCap/set` | Metas → ícone de calendário (salvar ou **Remover teto do mês**) | `profiles.month_cap` | `update` |
| `goal/save` | Folha Nova / editar meta | `goals` | `upsert` |
| `goal/delete` | Folha editar meta → Apagar | `goals` (+ `goal_movements` em cascata) | `rpc('delete_goal')` |
| `move/save` | Folha Guardar / Retirar; Objetivos → Movimentações → editar | `goal_movements` + `goals.saved` + `profiles.opening_balance` | `rpc('save_goal_movement')` |
| `move/delete` | Objetivos → Movimentações → Apagar movimento | `goal_movements` + `goals.saved` + `profiles.opening_balance` | `rpc('delete_goal_movement')` |
| `user/rename` | Conta → Nome → Salvar nome | `profiles.name` | `update` |
| `deleteAccount()` | Conta → Apagar conta e dados | `auth.users` (tudo em cascata) | Edge Function `auth.admin.deleteUser` |
| `hidden/toggle` | Olho na Home / Conta | `profiles.hide_balance` | `update` |
| `reset` | Conta → Restaurar dados de exemplo | — | Só para a conta demo; no banco: `supabase/seed/remover_dados_demo.sql` + reaplicar o seed |

Guardar, retirar, editar ou apagar um movimento mexem no saldo e na meta ao mesmo tempo; por isso passam por funções SQL (`rpc`) que fazem tudo numa transação.

## Leituras (o que cada tela precisa)

| Tela | Lê | Calculado no front (`derive`) |
|---|---|---|
| Login / Cadastro | sessão | — |
| Home | `profiles`, `transactions` (mês), `cards` | saldo, total do mês, por categoria, comparativo, faturas |
| Cartões | `cards`, `transactions` (mês) | fatura por cartão, % do limite, total das faturas |
| Metas | `budgets`, `profiles.month_cap`, `transactions` (mês), `goals` | ainda pode gastar, % por categoria, insight |
| Objetivos | `goals` | % por meta, total guardado |
| Fatura | arquivo do usuário | — (a IA devolve `FaturaResult`) |
| Assistente | `buildContext()` em `src/lib/context.ts` | resumo enviado à IA |

O histórico de meses anteriores (gráfico Ago–Out) hoje só existe na conta demo. No backend, ele sai de uma consulta agrupada em `transactions` por mês.

## Contratos (tipos em `src/lib/types.ts`)

- `Tx`, `Card`, `Budget`, `Goal`, `User`: espelham as colunas das tabelas.
- `FaturaResult`: `{ items: { name, amount, category, subscription }[], total, dueInDays }`, devolvido por `POST /api/fatura`.
- `ChatReply`: `{ text, insight?: { context, value, consequence } }`, devolvido por `POST /api/assistente`.

## Ordem sugerida

1. ✅ Projeto Supabase criado e migrations aplicadas (schema, rls, funcoes, storage, seed_demo). Conta demo `lucas@cofrinho.app` já está no banco.
2. ✅ `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (chave publishable) preenchidos no `.env` local. Falta cadastrar as mesmas variáveis na Vercel.
3. ✅ `@supabase/supabase-js` instalado; `src/services/auth.ts` com Supabase Auth.
4. ✅ Dados lidos e gravados no banco ação por ação (`src/services/db.ts`); fatura no storage; Edge Function `delete-account` publicada.
5. Ligar a OpenAI: `OPENAI_API_KEY` + `NEXT_PUBLIC_USE_API=true`.
6. Subir para o GitHub e conectar à Vercel com as mesmas variáveis.

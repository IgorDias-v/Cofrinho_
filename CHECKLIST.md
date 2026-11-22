# Checklist completo — Cofrinho (front-end)

Validado no localhost em 21/11/2026, no celular (375 px) e no desktop (1440 px), executando cada fluxo no navegador.
Escopo inicial: só front-end, com dados no `localStorage`. Desde 22/11/2026 o app usa o Supabase (login e dados); Fatura e Assistente continuam com a leitura simulada no front.

Legenda: ✅ testado e funcionando · ⚠️ funciona, com ressalva · ⏳ depende do backend · — fora do escopo

## CRUD completo por usuário (revisado em 22/11/2026)

Cada coisa que a pessoa cadastra tem as quatro operações: **criar, ver, editar e apagar**. Tudo é da conta logada. No banco, cada tabela tem `user_id` e Row Level Security (`supabase/migrations/`, documentado em `docs/BANCO.md`).

### Matriz por entidade

| Entidade | Tabela | Criar | Ver | Editar | Apagar |
|---|---|---|---|---|---|
| Conta / perfil | `auth.users` + `profiles` | Cadastro | Home (avatar e nome) e folha Conta | Conta → Nome → Salvar nome; ocultar saldo | Conta → **Apagar conta e dados** (com confirmação; não aparece na conta demo) |
| Lançamento (gasto ou entrada) | `transactions` | Home → Adicionar (gasto ou entrada) | Home → Transações (Ver todas) e Cartões → compras do cartão | Tocar no lançamento → Editar lançamento | Editar lançamento → Apagar lançamento |
| Lançamentos importados | `transactions` (`source = 'fatura'`) | Fatura → Confirmar N lançamentos | Mesmas listas, com logo do estabelecimento | Antes: categoria e marcar/desmarcar. Depois: como qualquer lançamento | Como qualquer lançamento |
| Cartão | `cards` | Cartões → + ou Home → Adicionar cartão | Cartões (pilha, fatura, limite, compras) e Home → Faturas abertas | Cartões → Editar | Editar cartão → Apagar cartão (as compras ficam, como "Dinheiro") |
| Teto por categoria | `budgets` | Metas → categoria → Definir | Metas → Este mês (% e barra) | Metas → categoria → Salvar teto | Metas → categoria → **Remover teto** |
| Teto do mês | `profiles.month_cap` | Metas → Defina o teto do mês | Metas → Ainda pode gastar | Metas → calendário → Salvar teto | Metas → calendário → **Remover teto do mês** |
| Meta (objetivo) | `goals` | Objetivos → + / Metas → ícone de alvo | Objetivos (destaque, lista, resumo) e Metas → Guardando | Objetivos → Editar | Editar meta → Apagar meta (o guardado volta para o saldo) |
| Movimento da meta (guardar ou retirar) | `goal_movements` | Guardar ou Retirar | Objetivos → **Movimentações** | Tocar no movimento → Editar movimento (valor, tipo e data) | Editar movimento → **Apagar movimento** (desfaz no saldo e na meta) |

Dados calculados (não são cadastro, então não têm CRUD): saldo, total do mês, gasto por categoria, faturas dos cartões, assinaturas do mês, gráfico da semana, insight do assistente.

### Checklist para conferir (marque ao validar)

Comece com a conta demo e use **Conta → Restaurar dados de exemplo** antes de testar. ✅ = testado por mim no navegador em 22/11/2026.

**Acesso e conta**
- [ ] ✅ Entrar livre (sem e-mail e senha) e com a conta de demonstração
- [ ] ✅ Criar conta livre (nome + e-mail) → entra com a conta vazia
- [ ] ✅ Conta → editar o nome → aparece na Home e continua depois de recarregar
- [ ] ✅ Conta → ocultar saldo (também pelo olho na Home)
- [ ] ✅ Conta → Sair (com confirmação)
- [ ] ✅ Conta → Apagar conta e dados → volta ao login; conta, dados e sessão removidos
- [ ] ✅ Conta demo: não mostra "Apagar conta"; mostra "Restaurar dados de exemplo"

**Home**
- [ ] Saldo, total do mês, comparativo, gráfico da semana (tocar destaca o dia)
- [ ] Faturas abertas → abre Cartões; sem cartão → Adicionar cartão
- [ ] Assinaturas do mês em pílulas
- [ ] ✅ Transações: Ver todas / Ver menos; tocar abre a edição

**Lançamentos (CRUD)**
- [ ] ✅ Criar gasto (valor, descrição, categoria, pagamento, data)
- [ ] Criar entrada (Tipo → Entrada; Pix ou Dinheiro)
- [ ] ✅ Ver na lista da Home e nas compras do cartão
- [ ] ✅ Editar valor/descrição/categoria/data
- [ ] ✅ Apagar com confirmação
- [ ] Erros: valor vazio, zero ou acima de R$ 1.000.000

**Cartões (CRUD)**
- [ ] ✅ Criar (apelido, final, vencimento, limite, fatura já aberta, cor)
- [ ] ✅ Ver: pilha em baralho, fatura, % do limite, compras do cartão
- [ ] ✅ Editar
- [ ] ✅ Apagar → compras continuam como "Dinheiro"
- [ ] Erros: apelido repetido, final sem 4 dígitos, limite vazio, vencimento fora de 1–60

**Metas: tetos (CRUD)**
- [ ] ✅ Definir teto da categoria e do mês
- [ ] ✅ Ver % usado, barra e "Ainda pode gastar"
- [ ] ✅ Alterar o valor
- [ ] ✅ Remover teto da categoria (vira "Definir") e do mês (volta o convite "Defina o teto do mês")

**Objetivos e movimentos (CRUD)**
- [ ] ✅ Criar meta (nome, valor alvo, prazo, ícone)
- [ ] ✅ Ver destaque, outros objetivos e resumo; tocar em outro objetivo troca o destaque
- [ ] ✅ Editar meta
- [ ] ✅ Apagar meta → o guardado volta para o saldo; os movimentos somem juntos
- [ ] ✅ Guardar e Retirar → aparecem em Movimentações
- [ ] ✅ Editar movimento → a meta e o saldo mudam só pela diferença
- [ ] ✅ Apagar movimento → desfaz no saldo e na meta
- [ ] ✅ Erros: retirar mais do que tem guardado; guardar mais do que o saldo

**Fatura (plus)**
- [ ] ✅ Arrastar PDF/foto, escolher arquivo, Tirar foto, Usar exemplo
- [ ] ✅ Lendo (progresso + cancelar) → Fatura lida
- [ ] ✅ Categorias encontradas filtram os lançamentos; Limpar filtro
- [ ] Desmarcar itens, trocar categoria, escolher o cartão
- [ ] ✅ Confirmar → lançamentos entram na Home e podem ser editados/apagados
- [ ] Erros: arquivo que não é PDF/imagem; acima de 15 MB

**Assistente (plus)**
- [ ] Sugestões, enviar pergunta, resposta com insight, limpar conversa (a conversa não é cadastro; fica só na sessão)

**Navegação e qualidade**
- [ ] Barra inferior (mobile) e menu em pílula (desktop); voltar
- [ ] Celular (375 px) e desktop (1440 px)
- [ ] ✅ Sem erros no console após recarregar
- [ ] ✅ `npx tsc --noEmit` sem erros; Storybook abre todas as folhas e telas

**Backend (quando ligar o Supabase)** ⏳
- [x] Migrations aplicadas no Supabase (`supabase/migrations/20261122*`; detalhes em `docs/BANCO.md`) e CRUD/RLS validados no banco
- [ ] Cada ação do `dispatch` → operação em `INTEGRACAO.md`
- [ ] Guardar/retirar/editar/apagar movimento pelas funções `save_goal_movement` e `delete_goal_movement`; apagar meta por `delete_goal`
- [ ] Apagar conta por Edge Function (`auth.admin.deleteUser`)

---

## 0. Redesign V2 (aplicado em 21/11/2026)

Direção aprovada no canvas, página "V2 · Redesign": topo claro (papel `#F5F5F3`) com conteúdo escuro (`#0A0A0A`), tipografia Inter Tight + Inter, pílulas com contorno, cartões com arte em CSS e lima como acento.

| Item | Status |
|---|---|
| Todas as telas no V2: Login, Cadastro, Home, Cartões, Metas, Objetivos, Fatura, Assistente e folhas | ✅ |
| Saldo: dígitos sobem um a um; olho desfoca o saldo | ✅ |
| Cartões com arte (iridescente, faixas, lima) fluindo devagar + dígitos finais em contorno | ✅ |
| Pilha de cartões em baralho + pontos de página + limite em 20 segmentos que preenchem em sequência | ✅ |
| Gráfico da semana: barras crescem da base; tocar destaca o dia em lima e mostra o valor | ✅ |
| Assinaturas em pílulas com logo; transações com avatar | ✅ |
| Barra inferior flutuante (vidro), ativo em círculo branco, Assistente em lima | ✅ |
| Menu desktop em pílula escura sobre o topo claro | ✅ |
| Assistente: orbe "respirando", balões papel/escuro, insight com arte | ✅ |
| Fluxos revalidados após o redesign (gasto, cartão, guardar/retirar, fatura, chat), sem erros no console | ✅ |

---

## 1. Acesso

| Item | Status | Como foi validado |
|---|---|---|
| Login: "Entrar" entra direto, sem e-mail e senha | ✅ | Campos vazios → Home com R$ 14.500 |
| Login: aviso "Modo protótipo: é só tocar em Entrar" | ✅ | Visível abaixo do título |
| Login: mostrar / ocultar senha | ✅ | |
| Entrar com a conta de demonstração | ✅ | |
| Cadastro: "Criar conta" entra direto | ✅ | Sem preencher → conta demo; com nome e e-mail → conta nova vazia |
| Cadastro: medidor de força da senha | ✅ | Muda de "Fraca" para "Forte" |
| Sair (Conta → Sair → "Deseja sair?") | ✅ | Volta ao login, e os dados continuam ao entrar de novo |
| Login com Google | — | Fora do escopo |
| Esqueci minha senha | ⏳ | Entra com o Supabase Auth |

## 2. Home

| Item | Status | Como foi validado |
|---|---|---|
| Saldo com contagem animada ao abrir | ✅ | Conta de R$ 0 até o saldo |
| Olho oculta / mostra saldo e valores | ✅ | |
| Botão do Assistente no topo (celular) | ✅ | Abre o chat |
| Faturas abertas (rolagem no celular, linha no desktop) | ✅ | Tocar abre Cartões |
| Atalhos Adicionar · Fatura · Cartões · Metas | ✅ | |
| Este mês: total, comparativo, gráfico, 3 categorias | ✅ | |
| Transações: "Ver todas" estica a home | ✅ | |
| Toque na transação abre editar / apagar | ✅ | |
| Estado vazio (conta nova) | ✅ | "Cadastrar cartão", "Nenhum gasto ainda" |

## 3. Fluxo de gasto (folha Adicionar)

| Item | Status | Como foi validado |
|---|---|---|
| Abre com o foco no valor | ✅ | |
| Validação: salvar vazio → "Digite o valor da compra." | ✅ | |
| Salvar R$ 50 → aviso + saldo cai | ✅ | R$ 14.500 → R$ 14.450 |
| Editar para R$ 60 | ✅ | → R$ 14.440 |
| Apagar com confirmação | ✅ | → R$ 14.500 |
| Gasto / Entrada, categoria, pagamento (cartão, Pix, dinheiro), data | ✅ | |
| Folha fecha com animação (desce no celular, some no desktop) | ✅ | |

## 4. Cartões

| Item | Status | Como foi validado |
|---|---|---|
| Pilha: tocar troca o cartão da frente (animado) | ✅ | Nubank foi para a frente |
| Limite usado com barra animada | ✅ | |
| Novo cartão: validação de apelido, final e limite | ✅ | 3 mensagens de erro com tudo vazio |
| Novo cartão salvo | ✅ | 3 → 4 cartões |
| Editar cartão (limite) | ✅ | "de R$ 4.000,00" |
| Apagar cartão com confirmação | ✅ | 4 → 3; as compras ficam no histórico |
| Próximas faturas + total das faturas | ✅ | |
| Compras do cartão da frente | ✅ | |
| Estado vazio "Cadastre seu primeiro cartão" | ✅ | |

## 5. Metas

| Item | Status | Como foi validado |
|---|---|---|
| Ainda pode gastar (contagem animada) | ✅ | R$ 860 de R$ 3.200 |
| Teto do mês | ✅ | R$ 3.500 → ainda pode gastar R$ 1.160 |
| Teto por categoria | ✅ | Alimentação 62% → 50% com teto de R$ 960 |
| Guardando: destaque + anel animado | ✅ | |
| Card ASSISTENTE COFRINHO abre o chat | ✅ | |
| Estado vazio: "Defina o teto do mês" e "Definir" | ✅ | |

## 6. Objetivos

| Item | Status | Como foi validado |
|---|---|---|
| Abre por "Ver objetivos" (aba Metas fica ativa) | ✅ | |
| Tocar numa meta coloca ela em destaque | ✅ | |
| Guardar (padrão R$ 500) | ✅ | R$ 13.600 → R$ 14.100; saldo −R$ 500 |
| Retirar com validação | ✅ | Acima do guardado → "Você tem R$ 14.100,00 guardado." |
| Retirar R$ 200 | ✅ | Volta ao saldo: R$ 14.200 |
| Nova meta (nome, alvo, prazo, ícone) | ✅ | |
| Editar meta | ✅ | Alvo R$ 6.000 → R$ 8.000 |
| Apagar meta (valor guardado volta ao saldo) | ✅ | |
| Resumo: total guardado e progresso geral | ✅ | |

## 7. Fatura (plus)

| Item | Status | Como foi validado |
|---|---|---|
| Estado 1: escolher (Enviar PDF / Tirar foto / arrastar) | ✅ | Botão Confirmar desativado |
| Arquivo inválido → erro + "Escolher outro arquivo" | ✅ | `.xlsx` recusado |
| Estado 2: lendo (progresso + brilho + esqueleto) | ✅ | |
| Cancelar no meio da leitura | ✅ | Não termina depois de cancelado |
| Estado 3: "Fatura lida" + check animado | ✅ | |
| Marcar / desmarcar todos, desmarcar item, trocar categoria | ✅ | 34 → 33 lançamentos |
| Escolher o cartão | ✅ | |
| Confirmar → aviso + volta à Home + saldo atualizado | ✅ | "33 lançamentos adicionados" |
| Leitura real com a OpenAI | ⏳ | Rota pronta em `app/api/fatura`, desligada |

## 8. Assistente (plus)

| Item | Status | Como foi validado |
|---|---|---|
| Acesso pelo botão do topo da Home (celular) | ✅ | |
| Acesso pela barra inferior (celular) | ✅ | |
| Acesso pelo menu (desktop) | ✅ | Marcado como ativo |
| Acesso pelo card em Metas | ✅ | |
| Estado inicial com 4 sugestões | ✅ | |
| Enviar desativado com campo vazio | ✅ | |
| "Digitando…" (3 pontos) + placeholder "Pensando…" | ✅ | |
| Resposta com números reais do app | ✅ | Delivery, limite do cartão, assinaturas |
| Card de insight (ciano) | ✅ | "R$ 150,00 / mês · Viagem ao Japão chega 1 mês antes" |
| Sugestões depois de cada resposta | ✅ | |
| Erro + "Tentar de novo" | ✅ | Pergunte "simular erro" para ver |
| Conversa mantida ao sair e voltar | ✅ | Dura a sessão do navegador |
| Nova conversa | ✅ | |
| Limite de 300 caracteres com contador | ✅ | |
| Respostas reais da OpenAI | ⏳ | Rota pronta em `app/api/assistente`, desligada |
| Streaming da resposta | ⏳ | Para a integração |

## 9. Animações e microanimações

| Item | Status |
|---|---|
| Troca de tela: sobe e aparece | ✅ |
| Listas entram em sequência (escalonadas) | ✅ |
| Valores em R$ contam até o número novo | ✅ |
| Barras e anéis crescem a partir do zero | ✅ |
| Folhas sobem ao abrir e descem ao fechar | ✅ |
| Botões "afundam" de leve ao toque | ✅ |
| Pilha de cartões desliza | ✅ |
| Fatura: brilho na barra e check que "pula" | ✅ |
| Chat: balões e pontos de digitando | ✅ |
| Respeita "reduzir movimento" do sistema | ✅ |

## 10. Qualidade

| Item | Status |
|---|---|
| Sem erros no console passando por todas as telas | ✅ |
| TypeScript sem erros + `next build` ok | ✅ |
| Celular e desktop em todas as telas | ✅ |
| Botões reais, `aria-label` nos ícones, foco visível | ✅ |
| Auditoria de acessibilidade completa (WCAG AA) | ⚠️ Não feita formalmente |

---

## Diferenças conscientes em relação ao briefing

1. **Objetivos é uma tela própria**, aberta a partir de Metas, como na imagem de referência.
2. **A barra inferior tem o botão de IA**, como nas imagens.
3. **Cores azul, lima, ciano e menta** das imagens, no lugar do lilás.
4. **O insight de Metas é calculado no front** (as 2 assinaturas mais caras) até a OpenAI entrar.

## Pronto para o backend

O passo a passo está em [INTEGRACAO.md](INTEGRACAO.md): cada ação do app aparece com a tabela e a operação no Supabase, e há uma ordem sugerida para ligar tudo.

---

## Banco no Supabase (Project-v1 · eyhybcegxlanckgkglau) — 22/11/2026

✅ = conferido no banco. Detalhes em `docs/BANCO.md`; schema em `prisma/schema.prisma`; migrations em `supabase/migrations/`.

**Estrutura**
- [x] 5 migrations aplicadas (schema, rls, funcoes, storage, seed_demo), iguais aos arquivos locais
- [x] 7 tabelas: profiles, cards, transactions, budgets, goals, goal_movements, invoice_imports
- [x] 6 enums: category, payment_method, card_color, tx_source, goal_icon, import_status
- [x] created_at/updated_at com trigger; checks de valores; índices em todas as FKs
- [x] FKs compostas (id, user_id): ninguém aponta para cartão/meta/importação de outro
- [x] Perfil criado sozinho no cadastro (trigger on_auth_user_created)

**Segurança**
- [x] RLS ligado nas 7 tabelas, uma policy por operação, só para usuários logados (27 policies)
- [x] anon sem acesso a nenhuma tabela nem função ("permission denied")
- [x] Usuário A não vê nem altera dados do B (nem da demo)
- [x] Funções internas sem permissão de execução; RPCs só para logados
- [x] Advisor de performance: 0 avisos · Advisor de segurança: só "Leaked Password Protection" (config do Auth)

**CRUD validado (74 testes, todos passaram)**
- [x] profiles: ler, editar (apagar só com a conta)
- [x] cards: criar, ler, editar, apagar · apelido único · apagar mantém as compras como "dinheiro"
- [x] transactions: criar, ler, editar, apagar · validações de valor, categoria e cartão
- [x] budgets: criar, editar, remover teto
- [x] goals: criar, ler, editar · apagar (delete_goal) devolve o guardado ao saldo
- [x] goal_movements: guardar, retirar, editar pela diferença, apagar desfaz (save_goal_movement / delete_goal_movement)
- [x] invoice_imports + import_invoice: importação cria lançamentos; item inválido desfaz tudo
- [x] Storage `faturas` (privado, 15 MB, PDF/imagens): cada um só na própria pasta

**Dados de demonstração (manter até ter dados reais)**
- [x] Conta lucas@cofrinho.app com 3 cartões, 14 lançamentos, 4 tetos, teto do mês 3200, 4 metas, 5 movimentos
- [x] Script para remover: `supabase/seed/remover_dados_demo.sql`

**Pendente**
- [ ] Ligar "Leaked Password Protection" (Dashboard → Authentication → Providers → Email)
- [x] Front ligado ao Supabase: login, dados, fatura no storage (ver seção abaixo)
- [x] Edge Function `delete-account` publicada e testada
- [ ] Cadastrar NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY na Vercel
- [x] Login real da demo pela API do Auth
- [ ] Datas da demo são de novembro/2026: em dezembro, reaplicar o seed

## App ligado ao Supabase — testado em 22/11/2026

Testado no navegador (localhost) e conferido direto no banco depois de cada passo.

- [x] Abrir o app sem sessão → tela de entrar; "Entrar" vazio ou "Entrar com a conta de demonstração" → demo do banco
- [x] Login com e-mail e senha de verdade; senha errada → "E-mail ou senha incorretos."
- [x] Sessão continua depois de recarregar a página
- [x] Cada conta só vê os próprios dados (conta nova abre vazia, sem dados da demo)
- [x] Cadastro valida e-mail, senha (6+) e confirmação; com confirmação de e-mail ligada, avisa para abrir o link
- [ ] Cadastro real com um e-mail seu (não testei para não disparar e-mails)
- [x] Lançamento: criar, editar, apagar → gravado no banco
- [x] Cartão: criar, editar, apagar → gravado no banco
- [x] Meta: criar, apagar (delete_goal) · Movimento: guardar, editar, apagar (RPCs) → meta e saldo certos no banco
- [x] Teto da categoria: alterar e remover · Nome: editar → gravados no banco
- [x] Fatura: arquivo vai para `faturas/{usuário}/…`, importação "importada" e lançamentos criados de uma vez
- [x] Apagar conta → Edge Function apaga usuário, perfil e lançamentos; volta ao login
- [x] "Restaurar dados de exemplo" escondido no modo Supabase
- [x] Se o banco recusar uma gravação, aparece o motivo e o app recarrega o que está salvo
- [x] `next build` sem erros · `tsc` sem erros · `npm audit` de produção: 0 vulnerabilidades
- [ ] Cadastrar `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` na Vercel
- [ ] Em Authentication → URL Configuration, pôr a URL da Vercel como Site URL (link de confirmação do cadastro)
